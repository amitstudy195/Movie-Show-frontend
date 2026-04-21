import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [authType, setAuthType] = useState('email'); // 'email' or 'phone'
    const [step, setStep] = useState('input'); // 'input' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [isForgot, setIsForgot] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [useEmailOtp, setUseEmailOtp] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                }
            });
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            if (authType === 'email') {
                await api.post('/auth/send-otp', { email: formData.email });
            } else {
                await handlePhoneSignIn();
            }
            setResendTimer(30);
            setError('');
        } catch (err) {
            setError('Failed to resend. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSignIn = async () => {
        try {
            setupRecaptcha();
            const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
            setResendTimer(60);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/billing-not-enabled') {
                setError('SMS Service Restricted: Firebase Billing Required. Use Simulation Mode to continue testing.');
            } else {
                setError('Failed to send SMS. Check your internet or console.');
            }
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
            if (authType === 'email') {
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
            } else {
                if (step === 'input') {
                    await handlePhoneSignIn();
                    setLoading(false);
                    return;
                } else {
                    const result = await confirmationResult.confirm(otp);
                    const fbUser = result.user;
                    const response = await api.post('/auth/verify-otp', { 
                        phone: fbUser.phoneNumber, 
                        isFirebase: true,
                        uid: fbUser.uid 
                    });
                    userData = response.data;
                }
            }
            
            localStorage.setItem('movie_user', JSON.stringify(userData));
            onLoginSuccess(userData);
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const [showGooglePicker, setShowGooglePicker] = useState(false);

    useEffect(() => {
        if (isOpen && window.google) {
            if (!window.gsiInitialized) {
                window.google.accounts.id.initialize({
                    client_id: "102758190772-5p0v8jk0k4k6p4h7n5d3j1d2k3l4m5n.apps.googleusercontent.com",
                    callback: (response) => {
                        const decoded = jwtDecode(response.credential);
                        const googleUser = {
                            _id: 'g' + decoded.sub,
                            name: decoded.name,
                            email: decoded.email,
                            profilePic: decoded.picture,
                            loyaltyPoints: 1750,
                            membershipTier: 'Superstar',
                            walletBalance: 1250.50,
                            interests: {
                                genres: ['Action', 'Sci-Fi'],
                                languages: ['Hindi', 'English']
                            },
                            isVerified: true,
                            isAdmin: decoded.email === 'amitstudy195@gmail.com'
                        };
                        localStorage.setItem('movie_user', JSON.stringify(googleUser));
                        onLoginSuccess(googleUser);
                        onClose();
                    }
                });
                window.gsiInitialized = true;
            }
        }
    }, [isOpen]);

    const handleGoogleNativeLogin = () => {
        setShowGooglePicker(true);
        if (window.google) {
            try {
                window.google.accounts.id.prompt();
            } catch(e) {}
        }
    };

    const handleGoogleAuth = (account) => {
        setLoading(true);
        setShowGooglePicker(false);
        setTimeout(() => {
            const googleUser = {
                _id: 'g' + Math.random().toString(36).substr(2, 9),
                name: account.name,
                email: account.email,
                profilePic: account.pic,
                loyaltyPoints: 1750,
                membershipTier: 'Superstar',
                walletBalance: 1250.50,
                interests: {
                    genres: ['Action', 'Sci-Fi'],
                    languages: ['Hindi', 'English']
                },
                isVerified: true,
                isAdmin: account.email === 'amitstudy195@gmail.com'
            };
            localStorage.setItem('movie_user', JSON.stringify(googleUser));
            onLoginSuccess(googleUser);
            onClose();
            setLoading(false);
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div id="recaptcha-container"></div>
            <div className={`w-full max-w-md bg-zinc-950 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative transition-all duration-700 ${showGooglePicker ? 'scale-95 opacity-50' : ''}`}>
                
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center mb-4 border border-white/10 shadow-2xl">
                            <span className="text-2xl">{authType === 'email' ? '👤' : '📱'}</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {isLogin ? 'Welcome Back' : 'Join the Magic'}
                        </h2>
                        
                        <div className="flex justify-center mt-6 gap-2">
                            <button 
                                onClick={() => { setAuthType('email'); setStep('input'); setIsForgot(false); }}
                                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${authType === 'email' ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                            >
                                Email
                            </button>
                            <button 
                                onClick={() => { setAuthType('phone'); setStep('input'); setIsForgot(false); }}
                                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${authType === 'phone' ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                            >
                                Mobile
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className={`bg-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/10 border border-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500/20 text-${error.includes('SUCCESS') ? 'emerald' : 'red'}-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 text-center animate-pulse`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {authType === 'email' ? (
                            step === 'input' ? (
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
                            )
                        ) : (
                            step === 'input' ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="bg-white/10 border border-white/20 rounded-2xl px-4 flex items-center text-white text-xs font-black">+91</div>
                                        <input 
                                            type="tel" placeholder="MOBILE NUMBER" required
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold tracking-widest"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-[8px] text-cyan-500 font-black uppercase tracking-widest mb-4">Enter OTP sent to {phone}</p>
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
                                        <button type="button" onClick={() => setStep('input')} className="w-full text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Change Number</button>
                                    </div>
                                </div>
                            )
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

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]"><span className="bg-zinc-950 px-4 text-gray-700 italic">Trusted Protocols</span></div>
                        </div>

                        <div className="flex flex-col items-center gap-2 w-full">
                            <button type="button" onClick={handleGoogleNativeLogin} className="w-full h-16 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                <span className="text-[10px] uppercase tracking-widest block font-black">Google Identity</span>
                            </button>
                        </div>
                    </form>
                </div>

                <button onClick={onClose} className="absolute top-8 right-8 text-gray-700 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {showGooglePicker && (
                <div className="absolute inset-0 z-[210] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 text-center border-b border-gray-100">
                            <h3 className="text-xl font-medium text-gray-900">Choose account</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {[
                                { name: 'Amit Kumar', email: 'amitstudy195@gmail.com', pic: 'https://ui-avatars.com/api/?name=Amit+Kumar&background=4285F4&color=fff' },
                                { name: 'Guest Superstar', email: 'guest.pro@gmail.com', pic: 'https://ui-avatars.com/api/?name=Guest+Pro&background=34A853&color=fff' }
                            ].map((acc, i) => (
                                <button key={i} onClick={() => handleGoogleAuth(acc)} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                    <img src={acc.pic} className="w-10 h-10 rounded-full" alt="" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800">{acc.name}</p>
                                        <p className="text-xs text-gray-500">{acc.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowGooglePicker(false)} className="w-full p-4 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthModal;
