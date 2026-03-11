import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'user' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    currentSessionId?: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const unsubscribeProfileRef = React.useRef<(() => void) | null>(null);

    const logout = async () => {
        try {
            console.log("AuthProvider: Logging out...");
            localStorage.removeItem('active_session_id');
            if (unsubscribeProfileRef.current) {
                unsubscribeProfileRef.current();
                unsubscribeProfileRef.current = null;
            }
            await signOut(auth);
            setProfile(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Auth State Changed:", firebaseUser?.email);
            setUser(firebaseUser);

            // Clean up previous profile subscription if any
            if (unsubscribeProfileRef.current) {
                unsubscribeProfileRef.current();
                unsubscribeProfileRef.current = null;
            }

            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);

                // Use onSnapshot for real-time updates
                unsubscribeProfileRef.current = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;
                        setProfile(data);

                        // Check for multi-device login (One User, One Device)
                        let localSessionId = localStorage.getItem('active_session_id');

                        // Auto-bind: If local session is missing but Firestore has one, adopt it
                        // This handles page refreshes or first-time feature rollout
                        if (!localSessionId && data.currentSessionId) {
                            console.log("AuthProvider: Adopting Firestore session ID:", data.currentSessionId);
                            localStorage.setItem('active_session_id', data.currentSessionId);
                            localSessionId = data.currentSessionId;
                        }

                        console.log("Session Check:", {
                            firestoreSessionId: data.currentSessionId,
                            localSessionId: localSessionId,
                            mismatch: data.currentSessionId && localSessionId && data.currentSessionId !== localSessionId
                        });

                        if (data.currentSessionId && localSessionId && data.currentSessionId !== localSessionId) {
                            console.warn("Session mismatch detected! Remote session:", data.currentSessionId, "Local session:", localSessionId);
                            alert("Sesi Anda telah berakhir karena akun ini login di perangkat lain.");
                            logout();
                        }
                    } else {
                        // New user - create profile
                        console.log("Creating new user profile...");
                        const newProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || '',
                            photoURL: firebaseUser.photoURL || '',
                            role: 'user',
                            status: 'pending',
                            createdAt: new Date(),
                        };
                        setDoc(userDocRef, newProfile);
                        setProfile(newProfile);
                    }
                    setLoading(false);
                });
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfileRef.current) {
                unsubscribeProfileRef.current();
            }
        };
    }, []);

    const login = async () => {
        try {
            console.log("AuthProvider: Starting login...");
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                // Generate unique session ID for this device
                const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                // Update Firestore FIRST to avoid race condition in Browser B
                console.log("Updating Firestore with session ID:", newSessionId);
                const userDocRef = doc(db, 'users', result.user.uid);
                await setDoc(userDocRef, {
                    currentSessionId: newSessionId,
                    lastLogin: new Date()
                }, { merge: true });

                // THEN set local storage
                console.log("Setting local session ID:", newSessionId);
                localStorage.setItem('active_session_id', newSessionId);
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
