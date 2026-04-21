import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const PaymentGateway = ({ amount, bookingDetails, onBack, onPaymentSuccess, addNotification }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment States
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [upiId, setUpiId] = useState('');

  // 1. COMPREHENSIVE VALIDATION LOGIC
  const validation = useMemo(() => {
    const checks = {
        card: {
            name: cardDetails.name.length >= 3,
            number: /^\d{16}$/.test(cardDetails.number.replace(/\s/g, '')),
            expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry),
            cvc: /^\d{3,4}$/.test(cardDetails.cvc)
        },
        upi: {
            id: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)
        },
        other: true // Apple/Google Pay skip internal validation for this mock
    };

    const method = paymentMethod === 'card' ? 'card' : (paymentMethod === 'upi' ? 'upi' : 'other');
    const isValid = method === 'other' ? true : Object.values(checks[method]).every(Boolean);

    return { isValid, checks: checks[method], method };
  }, [cardDetails, upiId, paymentMethod]);

  // 2. DEBUG LOGGING (Requirement 4)
  useEffect(() => {
    console.group(`🛡️ Payment Validation - ${paymentMethod.toUpperCase()}`);
    console.log("Current State:", paymentMethod === 'card' ? cardDetails : (paymentMethod === 'upi' ? { upiId } : "External"));
    console.log("Field Checks:", validation.checks);
    console.log("FINAL VALIDITY:", validation.isValid);
    console.groupEnd();
  }, [validation, paymentMethod, cardDetails, upiId]);

  // 3. SECURE ASYNC HANDLER (Requirement 2 & 3)
  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (!validation.isValid || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    
    try {
        // Step 1: Create Secure Order
        const orderResponse = await api.post('/payments/order', {
            amount: amount,
            bookingData: {
                ...bookingDetails,
                bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }
        });

        // Step 2: Simulate Gateway Wait
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Step 3: Verify Signature
        const verifyResponse = await api.post('/payments/verify', {
            razorpay_order_id: orderResponse.data.orderId,
            razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 12)}`,
            razorpay_signature: "verified_signature_string"
        });

        if (verifyResponse.data.success) {
            setSuccess(true);
            setTimeout(() => onPaymentSuccess(), 2000);
        } else {
            throw new Error("Payment Verification Failed");
        }

    } catch (err) {
        setError(err.response?.data?.message || err.message || "Transaction Error");
        addNotification?.({
            title: "Transaction Failed",
            message: "Unable to process payment. Please check your bank status.",
            type: "error"
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const methods = [
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '⚡' },
    { id: 'apple', name: 'Apple', icon: '🍎' },
    { id: 'google', name: 'Google', icon: '💎' },
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/5 hover:bg-white hover:text-black rounded-xl flex items-center justify-center transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Checkout</span>
        </div>
        <div className="text-[10px] font-black text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/10 italic">
            TOTAL: ${amount}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Method Selector */}
        <div className="grid grid-cols-4 gap-2 mb-8">
            {methods.map(m => (
                <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${paymentMethod === m.id ? 'bg-white border-white text-black' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                    <span className="text-xl mb-1">{m.icon}</span>
                    <span className="text-[7px] font-black uppercase tracking-tighter">{m.name}</span>
                </button>
            ))}
        </div>

        {/* Dynamic Form Area */}
        <div className="space-y-6">
            {paymentMethod === 'card' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <input 
                        type="text" placeholder="NAME ON CARD"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-cyan-500 transition-all uppercase font-bold"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    />
                    <input 
                        type="text" placeholder="CARD NUMBER (16 DIGITS)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono outline-none focus:border-cyan-500 transition-all"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" placeholder="MM/YY"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono outline-none focus:border-cyan-500 transition-all"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        />
                        <input 
                            type="password" placeholder="CVC"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono outline-none focus:border-cyan-500 transition-all"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.slice(0, 4)})}
                        />
                    </div>
                </div>
            )}

            {paymentMethod === 'upi' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="text-[8px] font-black text-gray-500 uppercase ml-1">UPI Address</label>
                    <input 
                        type="text" placeholder="NAME@BANK"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono outline-none focus:border-cyan-500 transition-all lowercase"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-[8px] text-gray-500 font-bold uppercase text-center tracking-widest">A request will be sent to your UPI app</p>
                </div>
            )}

            {(paymentMethod === 'apple' || paymentMethod === 'google') && (
                <div className="text-center py-12 animate-in fade-in duration-300">
                    <div className="text-5xl mb-4">{methods.find(m => m.id === paymentMethod)?.icon}</div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Ready to secure checkout via {paymentMethod} Pay</p>
                </div>
            )}
        </div>
      </div>

      {/* Confirmation Area */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-500 font-bold uppercase text-center">
                {error}
            </div>
        )}
        
        <button 
            onClick={handlePayment}
            disabled={!validation.isValid || isProcessing || success}
            className={`w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                success 
                ? 'bg-green-500 text-white cursor-default' 
                : (!validation.isValid ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#f84464] text-white hover:scale-[1.02] shadow-xl shadow-[#f84464]/20 active:scale-95')
            }`}
        >
            {isProcessing ? (
                <>
                    <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                </>
            ) : success ? (
                <>
                    <span className="text-xl">✅</span> Payment Successful
                </>
            ) : (
                <>Complete Process <span className="text-xl">›</span></>
            )}
        </button>
        <p className="text-[7px] text-center text-gray-600 mt-4 uppercase font-bold tracking-widest">
            By clicking you agree to the cinematic terms of service
        </p>
      </div>
    </div>
  );
};

export default PaymentGateway;
