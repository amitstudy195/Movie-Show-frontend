import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Security: Passwords coordinates do not match.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/resetpassword/${resettoken}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Handshake Failure: Reset token may be decommissioned or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Elite Background Aura */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F84464]/10 blur-[150px] rounded-full animate-pulse opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F84464]/5 blur-[150px] rounded-full opacity-30"></div>

            <div className="w-full max-w-lg bg-[#212121]/80 border border-white/5 rounded-[3.5rem] shadow-2xl p-12 glass-effect relative z-10 animate-in zoom-in duration-700">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl border border-white/10 shadow-[#F84464]/20 transform -rotate-3">
                        <span className="text-3xl text-white italic font-black">MS</span>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">IDENTITY RECOVERY</h2>
                    <p className="text-[#999999] text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Define new access coordinates for your cinematic vault</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-6 rounded-3xl mb-10 text-center animate-pulse italic">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest p-6 rounded-3xl mb-10 text-center italic">
                        PROTOCOL COMPLETE: Identity Restored. Initiating Redirect...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#999999] uppercase tracking-widest ml-3">New Authorization Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••••••" 
                            required
                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-white placeholder:text-[#999999]/30 outline-none focus:border-[#F84464] focus:bg-[#212121] transition-all font-black text-xs tracking-widest"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#999999] uppercase tracking-widest ml-3">Verify Access Secret</label>
                        <input 
                            type="password" 
                            placeholder="••••••••••••" 
                            required
                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-white placeholder:text-[#999999]/30 outline-none focus:border-[#F84464] focus:bg-[#212121] transition-all font-black text-xs tracking-widest"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || success}
                        className="w-full h-20 btn-hero rounded-3xl mt-10 flex items-center justify-center gap-4 active:scale-95 text-xs italic"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>RESTORE ACCESS PERMISSIONS <span className="text-xl">🛡️</span></>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-[8px] font-black text-[#999999] uppercase tracking-[0.4em] italic opacity-50 underline decoration-[#F84464]/20 underline-offset-8">End of Transmission</p>
                </div>
            </div>

            {/* Footer Accent */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#F84464] via-white/10 to-[#F84464] opacity-20"></div>
        </div>
    );
};

export default ResetPassword;
