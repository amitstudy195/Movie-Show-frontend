import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PaymentGateway = ({ amount, bookingDetails, onBack, onPaymentSuccess, addNotification }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
        document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
        // Step 1: Create Order on our backend
        const { data: orderData } = await api.post('/payments/order', {
            amount: amount,
            bookingData: bookingDetails
        });

        // STEP 2: CHECK FOR MOCK MODE
        if (orderData.isMock) {
            console.log("🛠️ [VIRTUAL_VAULT] Simulating secure transaction...");
            // Simulate gateway processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Auto-verify for mock mode
            const { data: verifyData } = await api.post('/payments/verify', {
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: "pay_MOCK_" + Math.random().toString(36).substr(2, 9),
                razorpay_signature: "mock_signature",
                verification: "simulated"
            });

            if (verifyData.success) {
                addNotification?.({
                    title: "Simulation Successful! 💎",
                    message: "Booking confirmed via Development Mock Gateway.",
                    type: "success"
                });
                onPaymentSuccess();
            }
            return;
        }

        // Step 3: REAL Razorpay Checkout (Only if not mock)
        const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Movie Show",
            description: `Tickets for ${bookingDetails.movieTitle}`,
            order_id: orderData.orderId,
            handler: async function (response) {
                try {
                    const { data: verifyData } = await api.post('/payments/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyData.success) {
                        addNotification?.({
                            title: "Payment Secured! 💳",
                            message: "Transaction verified successfully.",
                            type: "success"
                        });
                        onPaymentSuccess();
                    }
                } catch (verifyErr) {
                    setError("Gateway verification timed out. Contact support.");
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: bookingDetails.userName || "Guest",
                email: bookingDetails.userEmail || "guest@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#f84464"
            },
            modal: {
                ondismiss: function () {
                    setIsProcessing(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error("🕵️ PAYMENT_ABORT_TRACE:", err);
        const serverDetail = err.response?.data?.error || err.response?.data?.message || err.message;
        setError(`TRANSACTION_FAILED: ${serverDetail}`);
        setIsProcessing(false);
    }
  };

  return (
    <>

    <div className="flex flex-col h-full bg-[#F5F5FA] text-[#121212] font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-9 h-9 bg-black/5 hover:bg-black hover:text-white rounded-xl flex items-center justify-center transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-[#666666]">Secure Checkout</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-sm px-6 py-12 flex flex-col items-center text-center">
            {/* Animated Icon */}
            <div className="relative mb-8 shrink-0">
                <div className="absolute inset-0 bg-[#f84464]/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#f84464] to-[#f84464] rounded-3xl flex items-center justify-center shadow-xl border border-white rotate-12 hover:rotate-0 transition-transform duration-500">
                    <span className="text-3xl">🛡️</span>
                </div>
            </div>

            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-[#121212]">VIRTUAL VAULT</h3>
            <p className="text-[8px] font-bold text-[#666666] uppercase tracking-[0.3em] mb-10 italic">Secure Transactional Interface</p>

            {/* Order Card with Glassmorphism */}
            <div className="w-full bg-white shadow-xl shadow-black/5 border border-black/5 rounded-2xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                    <span className="text-[8px] font-black text-[#666666] uppercase tracking-widest">Total Payable</span>
                    <span className="text-lg font-black text-[#121212] italic">₹{amount}</span>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-[#666666] font-black uppercase">Movie</span>
                        <span className="text-[#121212] uppercase truncate ml-4 text-right">{bookingDetails.movieTitle}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-[#666666] font-black uppercase">Theater</span>
                        <span className="text-[#121212] uppercase truncate ml-4 text-right">{bookingDetails.theaterName}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] text-red-600 font-black uppercase mb-6 animate-in shake-in">
                    ⚠️ {error}
                </div>
            )}

            <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full h-14 rounded-2xl flex items-center justify-center gap-4 ${
                    isProcessing ? 'bg-black/5 text-gray-400' : 'btn-hero shadow-lg shadow-[#f84464]/20'
                }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-3 border-gray-300 border-t-[#f84464] rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                    </>
                ) : (
                    <>
                        <span>PAY ₹{amount}</span>
                        <span className="text-xl">›</span>
                    </>
                )}
            </button>
        </div>
      </div>

      <div className="p-8 border-t border-black/5 bg-white text-center shrink-0">
            <div className="flex items-center justify-center gap-6 mb-4 opacity-50 grayscale contrast-125">
                <span className="text-sm font-black italic text-[#121212]">VISA</span>
                <span className="text-sm font-black italic text-[#121212]">MASTERCARD</span>
                <span className="text-sm font-black italic text-[#121212]">UPI</span>
                <span className="text-sm font-black italic text-[#121212]">RUPAY</span>
            </div>
            <p className="text-[7px] font-black text-[#666666] uppercase tracking-[0.4em]">128-Bit SSL Encrypted Transaction Vault</p>
      </div>
    </div>
    </>
  );
};

export default PaymentGateway;
