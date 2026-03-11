import React from 'react';
import { useAuth } from '../context/AuthContext';
import { playClickSound } from '../utils/helpers';

export const LoginPage: React.FC = () => {
    const { login } = useAuth();

    const handleLogin = async () => {
        playClickSound();
        try {
            await login();
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFE600] flex flex-col items-center justify-center p-6 border-[12px] border-black overflow-hidden relative font-sans">
            <div className="max-w-xl w-full text-center space-y-12">

                {/* Header: GROWWITHDEDY PRESENTS */}
                <div className="relative inline-block transform -rotate-2">
                    <div className="bg-white border-[4px] border-black px-8 py-3 neo-shadow-sm">
                        <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                            GROWWITHDEDY PRESENTS
                        </p>
                    </div>
                </div>

                {/* Main Brand: MAGIC UGC */}
                <div className="relative py-4">
                    <h1
                        className="text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-black"
                        style={{
                            textShadow: '8px 8px 0px #000000',
                            WebkitTextStroke: '2px white'
                        }}
                    >
                        MAGIC<br />UGC
                    </h1>
                </div>

                {/* Tagline: bikin konten jadi lebih mudah */}
                <div className="pb-4">
                    <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black italic">
                        bikin konten jadi lebih mudah
                    </p>
                </div>

                {/* Main Button: LOGIN AKUN GOOGLE */}
                <div className="pt-8">
                    <button
                        onClick={handleLogin}
                        className="neo-btn bg-[#00E5FF] text-black text-2xl md:text-4xl font-black uppercase px-12 py-6 border-[4px] border-black neo-shadow transition-all hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        LOGIN AKUN GOOGLE
                    </button>
                </div>

            </div>
        </div>
    );
};
