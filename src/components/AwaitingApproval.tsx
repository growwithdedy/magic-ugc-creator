import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageCircle } from 'lucide-react';
import { playClickSound } from '../utils/helpers';

export const AwaitingApproval: React.FC = () => {
    const { profile, logout } = useAuth();

    const handleContactAdmin = () => {
        playClickSound();
        const message = `Halo, saya ingin verifikasi Magic UGC Generator dengan email ${profile?.email}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/6285123514560?text=${encodedMessage}`, '_blank');
    };

    const handleLogout = () => {
        playClickSound();
        logout();
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 border-[12px] border-black">
            <div className="max-w-2xl w-full bg-white border-8 border-black p-10 neo-shadow transform transition-transform hover:rotate-1">
                <div className="text-center space-y-8">
                    <div className="w-24 h-24 mx-auto bg-[#FFDE59] border-4 border-black flex items-center justify-center neo-shadow-sm transform -rotate-12 animate-bounce">
                        <span className="text-5xl font-black">!</span>
                    </div>

                    <div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4 leading-none">
                            MENUNGGU<br />APPROVAL
                        </h1>
                        <div className="bg-[#A3E635] border-4 border-black px-6 py-3 inline-block neo-shadow-sm transform rotate-1 mb-4">
                            <p className="text-2xl font-black uppercase italic">Satu langkah lagi!</p>
                        </div>
                    </div>

                    <div className="bg-[#00E5FF] border-4 border-black p-8 neo-shadow-sm transform -rotate-1">
                        <h2 className="text-2xl font-black uppercase mb-2">HUBUNGI ADMIN</h2>
                        <p className="text-4xl font-black tracking-tight mb-4">WA: +62 851-2351-4560</p>
                        <button
                            onClick={handleContactAdmin}
                            className="w-full neo-btn bg-[#25D366] text-white font-black uppercase py-6 text-2xl border-4 border-black neo-shadow flex items-center justify-center gap-4 hover:bg-[#1ebd5b] transition-colors"
                        >
                            <MessageCircle size={32} strokeWidth={3} />
                            CHAT SEKARANG
                        </button>
                    </div>

                    <p className="text-gray-500 font-bold leading-relaxed max-w-lg mx-auto uppercase text-sm">
                        Akun anda ({profile?.email}) sedang didaftarkan ke sistem. Klik tombol hijau di atas untuk verifikasi instan.
                    </p>

                    <div className="pt-6 border-t-4 border-black flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-black/40 tracking-widest leading-none">STATUS</p>
                            <p className="text-sm font-black uppercase text-[#FF4B4B]">Menunggu Persetujuan</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="neo-btn bg-white text-black font-black uppercase px-6 py-2 border-2 border-black text-xs flex items-center gap-2 hover:bg-gray-100"
                        >
                            <LogOut size={14} />
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
