import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match.' });
        }

        setLoading(true);
        try {
            await api.put(`/auth/reset-password/${resettoken}`, { password });
            setStatus({ type: 'success', message: 'Protocol updated. Your password has been successfully reset.' });
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Password update failed. Link may be expired.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-zinc-950/50 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] shadow-2xl relative z-10 animate-in zoom-in duration-700">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[1.8rem] mx-auto flex items-center justify-center mb-6 shadow-2xl border border-white/10">
                        <span className="text-3xl">🔑</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Update Protocol</h1>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-3">Reset your cinematic vault credentials</p>
                </div>

                {status.message && (
                    <div className={`p-5 rounded-2xl mb-8 border transition-all animate-pulse text-center ${
                        status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-4">New Password</label>
                        <input 
                            type="password" required placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500 focus:bg-white/10 transition-all font-bold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-4">Confirm Identity</label>
                        <input 
                            type="password" required placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500 focus:bg-white/10 transition-all font-bold"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full h-18 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-[0.2em] shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-3 mt-10 active:scale-95"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            'Execute Update'
                        )}
                    </button>
                </form>

                <div className="text-center mt-12">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        Back to Home Gateway
                    </button>
                </div>
            </div>
            
            {/* Glassmorphism Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600"></div>
        </div>
    );
};

export default ResetPassword;
