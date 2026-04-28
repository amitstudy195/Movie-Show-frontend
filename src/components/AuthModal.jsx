import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

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

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            
            if (!result || !result.user) {
                throw new Error("IDENTITY_REJECTED: Firebase did not return a valid user payload. Check Authorized Domains.");
            }

            const user = result.user;
            
            // Sync with our backend
            const response = await api.post('/auth/google-login', {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                uid: user.uid
            });

            if (!response.data) {
                throw new Error("BACKEND_DESYNC: The server did not provide an identity token.");
            }

            const userData = response.data;
            localStorage.setItem('movie_user', JSON.stringify(userData));
            onLoginSuccess(userData);
            onClose();
        } catch (err) {
            console.error("🕵️ IDENTITY_TRACE:", err);
            
            let message = err.message || "Google Authentication failed.";
            if (err.code === 'auth/unauthorized-domain') {
                message = "DOMAIN NOT AUTHORIZED: Add your Vercel URL to the Firebase Authorized Domains list.";
            } else if (err.code === 'auth/popup-blocked') {
                message = "Handshake blocked: Please allow popups for this site.";
            }
            
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-effect rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative bg-white/95">
                
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-[1.5rem] mx-auto flex items-center justify-center mb-4 shadow-lg shadow-[#F84464]/20 border border-white/20">
                            <span className="text-2xl text-white">👤</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#121212] uppercase tracking-tighter italic">
                            {isLogin ? 'Welcome Back' : 'Join the Magic'}
                        </h2>
                        
                    </div>

                    {error && (
                        <div className={`bg-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/10 border border-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/20 text-${error.includes('SUCCESS') ? 'emerald' : 'red'}-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 text-center animate-pulse`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 'input' ? (
                            <>
                                {!isLogin && (
                                    <input 
                                        type="text" placeholder="FULL NAME" required
                                        className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-sm text-[#121212] placeholder:text-[#666666] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all font-bold uppercase"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                )}
                                <input 
                                    type="email" placeholder="EMAIL ADDRESS" required
                                    className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-sm text-[#121212] placeholder:text-[#666666] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all font-bold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                                {(isLogin && !useEmailOtp) || !isLogin ? (
                                    <div className="space-y-2">
                                        <input 
                                            type="password" placeholder="CREATE PASSWORD" required
                                            className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-sm text-[#121212] placeholder:text-[#666666] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all font-bold"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        {isLogin && (
                                            <div className="flex justify-between items-center px-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setUseEmailOtp(!useEmailOtp)}
                                                    className="text-[8px] font-black text-[#F84464] hover:text-[#121212] uppercase tracking-widest transition-colors"
                                                >
                                                    {useEmailOtp ? "Use Password" : "Login with OTP"}
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsForgot(true)}
                                                    className="text-[8px] font-black text-[#666666] hover:text-[#121212] uppercase tracking-widest transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-[8px] text-[#F84464] font-black uppercase tracking-widest mb-4">Enter OTP sent to {formData.email}</p>
                                    <input 
                                        type="text" placeholder="0 0 0 0 0 0" required autoFocus
                                        className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-6 text-2xl text-center text-[#121212] placeholder:text-zinc-300 outline-none focus:border-[#F84464] focus:ring-4 focus:ring-[#F84464]/5 transition-all font-black tracking-[0.5em]"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={handleResend} disabled={resendTimer > 0} className={`w-full text-[8px] font-black uppercase tracking-[0.2em] transition-all ${resendTimer > 0 ? 'text-gray-300' : 'text-[#F84464] hover:text-[#121212]'}`}>
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                    </button>
                                    <button type="button" onClick={() => setStep('input')} className="w-full text-[8px] font-black text-gray-500 hover:text-[#121212] uppercase tracking-widest transition-colors">Change Email</button>
                                </div>
                            </div>
                        )}

                        {isForgot && (
                            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-white p-10 z-20 flex flex-col justify-center animate-in slide-in-from-bottom-full duration-500 border-t border-black/5 rounded-t-[3rem] shadow-2xl">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter">Identity Recovery</h3>
                                    <p className="text-[8px] text-[#666666] font-black uppercase tracking-widest mt-2">Enter your email to receive recovery instructions.</p>
                                </div>
                                <div className="space-y-4">
                                    <input 
                                        type="email" placeholder="ASSOCIATED EMAIL" required
                                        className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-sm text-[#121212] placeholder:text-[#666666] outline-none focus:border-[#F84464] transition-all font-bold uppercase"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    <button onClick={handleSubmit} className="w-full btn-hero h-14 rounded-2xl">Dispatch Link</button>
                                    <button onClick={() => setIsForgot(false)} className="w-full text-[8px] font-black text-[#666666] hover:text-[#121212] uppercase tracking-widest transition-colors mt-4">Back to Protocols</button>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full h-16 btn-hero rounded-2xl mt-6 flex items-center justify-center gap-3">
                            {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-[#666666] bg-white px-4 italic">Social Authentication</div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full h-14 bg-black/5 border border-black/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-black/10 transition-all group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span className="text-[10px] font-bold text-[#121212] uppercase tracking-widest group-hover:text-[#F84464] transition-colors">Continue with Google</span>
                        </button>

                        <div className="mt-8 text-center">
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-[10px] font-black text-black/50 hover:text-[#F84464] uppercase tracking-[0.3em] transition-all"
                            >
                                {isLogin ? (
                                    <>New to the platform? <span className="text-[#F84464] border-b border-[#F84464]/20 pb-1">Sign Up</span></>
                                ) : (
                                    <>Already verified? <span className="text-[#F84464] border-b border-[#F84464]/20 pb-1">Sign In</span></>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                <button onClick={onClose} className="absolute top-8 right-8 text-[#666666] hover:text-[#121212] transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
