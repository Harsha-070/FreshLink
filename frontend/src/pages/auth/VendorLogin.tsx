import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Phone, Mail, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useStore';

export default function VendorLogin() {
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthStore();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputType === 'phone') {
      const cleaned = identifier.replace(/\s/g, '');
      if (!cleaned.match(/^\+?\d{10,13}$/)) {
        toast.error('Please enter a valid phone number');
        return;
      }
    } else {
      if (!identifier.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setIsLoading(true);
    try {
      const otp = await sendOtp(identifier.replace(/\s/g, ''), inputType);
      setStep('otp');
      if (otp) {
        toast.success(`Demo OTP: ${otp}`, {
          duration: 15000,
          description: 'Use this OTP to verify (auto-displayed for demo)',
        });
      } else {
        toast.success(`OTP sent to ${identifier}`, {
          duration: 5000,
          description: `Check your ${inputType === 'email' ? 'email inbox' : 'phone'} for the verification code`,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otpDigits];
      newOtp[index - 1] = '';
      setOtpDigits(newOtp);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(identifier.replace(/\s/g, ''), otp, 'vendor', name || undefined);
      toast.success('Welcome to FreshLink!');
      navigate('/vendor/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      <Link to="/" className="absolute top-6 left-6 p-2 rounded-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 transition-colors z-10">
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              FreshLink
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Vendor Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in or register with OTP verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <AnimatePresence mode="wait">
          {step === 'identifier' ? (
            <motion.div
              key="identifier"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100"
            >
              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setInputType('phone'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputType === 'phone'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => { setInputType('email'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputType === 'email'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {inputType === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {inputType === 'phone' ? (
                        <Phone className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Mail className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <Input
                      type={inputType === 'phone' ? 'tel' : 'email'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder={inputType === 'phone' ? '+91 98765 43210' : 'vendor@example.com'}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Name <span className="text-slate-400">(optional, for new accounts)</span>
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ravi Vegetables"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base font-semibold shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300"
                  disabled={isLoading || !identifier}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700">
                  Demo: OTP will be shown in a notification. No actual SMS/email is sent.
                </p>
              </div>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/vendor/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-slate-500">
                  I'm a Business buyer?{' '}
                  <Link to="/business/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100"
            >
              <button
                type="button"
                onClick={() => {
                  setStep('identifier');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change {inputType}
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-3">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Enter Verification Code</h3>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-slate-700">{identifier}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                        digit
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base font-semibold shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300"
                  disabled={isLoading || otpDigits.join('').length !== 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const otp = await sendOtp(identifier.replace(/\s/g, ''), inputType);
                      toast.success(`New OTP: ${otp}`, { duration: 15000, description: 'Use this OTP to verify' });
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to resend OTP');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Demo: Use the OTP shown in the notification above.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
