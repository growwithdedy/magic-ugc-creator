import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Check, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { playClickSound } from '../utils/helpers';

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    status: 'pending' | 'approved' | 'rejected';
    role: 'user' | 'admin';
    createdAt: any;
}

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userData: UserData[] = [];
            snapshot.forEach((doc) => {
                userData.push(doc.data() as UserData);
            });
            // Sort by status (pending first) then by name
            userData.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return a.displayName.localeCompare(b.displayName);
            });
            setUsers(userData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (uid: string, status: 'approved' | 'rejected' | 'pending') => {
        playClickSound();
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { status });
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm("Hapus user ini?")) return;
        playClickSound();
        try {
            await deleteDoc(doc(db, 'users', uid));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white border-8 border-black flex flex-col neo-shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-[#FFDE59] border-b-8 border-black p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-black text-white p-2 border-2 border-white neo-shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">ADMIN CONTROL PANEL</h2>
                    </div>
                    <button onClick={() => { playClickSound(); onClose(); }} className="neo-btn bg-black text-white p-2 border-4 border-black">
                        <X size={24} />
                    </button>
                </div>

                {/* Filters/Stats */}
                <div className="bg-gray-100 p-4 border-b-4 border-black flex gap-4 overflow-x-auto">
                    <div className="bg-white border-4 border-black px-4 py-2 font-black flex items-center gap-2 neo-shadow-sm">
                        <span className="text-[#00E5FF]">{users.length}</span> TOTAL USERS
                    </div>
                    <div className="bg-white border-4 border-black px-4 py-2 font-black flex items-center gap-2 neo-shadow-sm text-yellow-600">
                        <Clock size={16} /> {users.filter(u => u.status === 'pending').length} PENDING
                    </div>
                </div>

                {/* Table */}
                <div className="flex-grow overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 font-black text-2xl uppercase italic animate-pulse">
                            Memuat Data User...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.uid} className={`flex flex-col md:flex-row items-center justify-between p-4 border-4 border-black neo-shadow-sm transition-all ${user.status === 'pending' ? 'bg-[#FFF9C4]' : 'bg-white hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                        <div className={`w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl ${user.role === 'admin' ? 'bg-purple-500' : 'bg-gray-200'}`}>
                                            {user.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase truncate max-w-[200px]">{user.displayName}</h3>
                                            <p className="text-xs font-bold text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="ml-2">
                                            {user.role === 'admin' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 border border-purple-700 font-black uppercase">ADMIN</span>}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        {user.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'approved')}
                                                    className="flex-grow md:flex-grow-0 neo-btn bg-[#A3E635] text-black font-black text-xs uppercase px-4 py-2 border-2 border-black flex items-center justify-center gap-2"
                                                >
                                                    <Check size={16} /> APPROVE
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'rejected')}
                                                    className="flex-grow md:flex-grow-0 neo-btn bg-[#FF4B4B] text-white font-black text-xs uppercase px-4 py-2 border-2 border-black flex items-center justify-center gap-2"
                                                >
                                                    <X size={16} /> REJECT
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 border-2 border-black neo-shadow-xs ${user.status === 'approved' ? 'bg-[#A3E635]' : 'bg-[#FF4B4B] text-white'}`}>
                                                    {user.status}
                                                </span>
                                                {user.status === 'approved' && (
                                                    <button onClick={() => handleUpdateStatus(user.uid, 'pending')} className="text-xs font-bold border-b-2 border-black hover:text-blue-600">RESET</button>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(user.uid)}
                                            className="neo-btn bg-black text-white p-2 border-2 border-black"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="text-center py-20 font-black text-gray-300 uppercase tracking-widest text-3xl">
                                    TIDAK ADA DATA USER
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
