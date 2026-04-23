import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import { auth } from '../firebase';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState('input'); // 'input' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [isForgot, setIsForgot] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [useEmailOtp, setUseEmailOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: formData.email });
            setResendTimer(30);
            setError('');
        } catch (err) {
            setError('Failed to resend. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isForgot) {
                // Real Call to Backend for Password Recovery Link
                await api.post('/auth/forgot-password', { email: formData.email });
                setError('SUCCESS: A secure recovery link has been dispatched to your inbox. Please verify within 15 minutes.');
                setLoading(false);
                setTimeout(() => { setIsForgot(false); setError(''); }, 5000);
                return;
            }

            let userData;
            if (!isLogin) {
                userData = await authService.register(formData.name, formData.email, formData.password);
            } else if (!useEmailOtp) {
                userData = await authService.login(formData.email, formData.password);
            } else {
                if (step === 'input') {
                    await api.post('/auth/send-otp', { email: formData.email });
                    setStep('otp');
                    setResendTimer(30);
                    setLoading(false);
                    return;
                } else {
                    const response = await api.post('/auth/verify-otp', { email: formData.email, otp });
                    userData = response.data;
                }
            }
            
            localStorage.setItem('movie_user', JSON.stringify(userData));
            onLoginSuccess(userData);
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Authentication failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-950 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative">
                
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center mb-4 border border-white/10 shadow-2xl">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {isLogin ? 'Welcome Back' : 'Join the Magic'}
                        </h2>
                        
                    </div>

                    {error && (
                        <div className={`bg-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/10 border border-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/20 text-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 text-center animate-pulse`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 'input' ? (
                            <>
                                {!isLogin && (
                                    <input 
                                        type="text" placeholder="FULL NAME" required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold uppercase"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                )}
                                <input 
                                    type="email" placeholder="EMAIL ADDRESS" required
                                    className="w-full bg-black/5 text-white border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-cyan-500 transition-all font-bold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                                {isLogin && !useEmailOtp && (
                                    <div className="space-y-2">
                                        <input 
                                            type="password" placeholder="PASSWORD" required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <div className="flex justify-between items-center px-2">
                                            <button 
                                                type="button"
                                                onClick={() => setUseEmailOtp(!useEmailOtp)}
                                                className="text-[8px] font-black text-cyan-500/60 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                                            >
                                                {useEmailOtp ? "Use Password" : "Login with OTP"}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsForgot(true)}
                                                className="text-[8px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-[8px] text-cyan-500 font-black uppercase tracking-widest mb-4">Enter OTP sent to {formData.email}</p>
                                    <input 
                                        type="text" placeholder="0 0 0 0 0 0" required autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl text-center text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all font-black tracking-[0.5em]"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={handleResend} disabled={resendTimer > 0} className={`w-full text-[8px] font-black uppercase tracking-[0.2em] transition-all ${resendTimer > 0 ? 'text-gray-700' : 'text-cyan-500 hover:text-white'}`}>
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                    </button>
                                    <button type="button" onClick={() => setStep('input')} className="w-full text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Change Email</button>
                                </div>
                            </div>
                        )}

                        {isForgot && (
                            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-zinc-950 p-10 z-20 flex flex-col justify-center animate-in slide-in-from-bottom-full duration-500 border-t border-white/10 rounded-t-[3rem]">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity Recovery</h3>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-2">Enter your email to receive recovery instructions.</p>
                                </div>
                                <div className="space-y-4">
                                    <input 
                                        type="email" placeholder="ASSOCIATED EMAIL" required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-red-500 transition-all font-bold uppercase"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    <button onClick={handleSubmit} className="w-full h-14 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all uppercase text-[10px] tracking-widest">Dispatch Link</button>
                                    <button onClick={() => setIsForgot(false)} className="w-full text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors mt-4">Back to Protocols</button>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full h-16 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-widest mt-6 shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-3">
                            {loading ? <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>

                    </form>
                </div>

                <button onClick={onClose} className="absolute top-8 right-8 text-gray-700 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
