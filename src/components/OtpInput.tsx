import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, ShieldCheck, Info, Sparkles, Check } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';

interface OtpInputProps {
  onVerify: (otp: string) => boolean | Promise<boolean>;
  onResend?: () => void;
  language: SupportedLanguage;
  isLoading?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  onVerify,
  onResend,
  language,
  isLoading = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [attempts, setAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyButtonRef = useRef<HTMLButtonElement | null>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 30s resend timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Lockout countdown timer
  useEffect(() => {
    if (isLockedOut) {
      if (lockoutRemaining > 0) {
        const timer = setTimeout(() => {
          setLockoutRemaining((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Unlock
        setIsLockedOut(false);
        setAttempts(0);
        setErrorMsg('');
        setLockoutRemaining(30);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    }
  }, [isLockedOut, lockoutRemaining]);

  const handleChange = (index: number, value: string) => {
    if (isLockedOut || isVerifying || isLoading) return;
    setErrorMsg('');

    // Handle single character
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Take the last character typed if input already had something
    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLockedOut || isVerifying || isLoading) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (isLockedOut || isVerifying || isLoading) return;
    setErrorMsg('');

    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!numbers) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numbers[i] || '';
    }
    setDigits(newDigits);

    if (numbers.length === 6) {
      // Focus verify button if 6 digits pasted
      setTimeout(() => verifyButtonRef.current?.focus(), 50);
    } else {
      inputRefs.current[Math.min(numbers.length, 5)]?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    if (isLockedOut || isVerifying || isLoading) return;
    setErrorMsg('');
    setDigits(['1', '2', '3', '4', '5', '6']);
    setTimeout(() => {
      verifyButtonRef.current?.focus();
    }, 50);
  };

  const checkOtp = async (fullOtp: string) => {
    if (isLockedOut || isVerifying || isLoading) return;
    setIsVerifying(true);
    setErrorMsg('');

    // Spinner for 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const isValid = await onVerify(fullOtp);
      if (!isValid) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        // Shake animation
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 450);

        if (nextAttempts >= 3) {
          setIsLockedOut(true);
          setLockoutRemaining(30);
          setErrorMsg('Too many failed attempts. Try again in 30 seconds.');
        } else {
          setErrorMsg('Incorrect code. Demo code is 123456.');
        }

        // Clear digits
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          if (nextAttempts < 3) {
            inputRefs.current[0]?.focus();
          }
        }, 50);
      }
    } catch {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setErrorMsg('Incorrect code. Demo code is 123456.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0 || isLockedOut) return;
    setCountdown(30);
    setErrorMsg('');
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    if (onResend) onResend();
  };

  const isComplete = digits.every((d) => d.length === 1 && /\d/.test(d));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#1B2A6B]">
          {t.enterOtp}
        </label>

        {/* 6 OTP boxes with shake animation on error */}
        <div
          className={`flex items-center justify-between gap-2 sm:gap-2.5 ${
            isShaking ? 'animate-shake' : ''
          }`}
          onPaste={handlePaste}
        >
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={isLockedOut || isVerifying || isLoading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border-2 transition-all outline-none ${
                errorMsg
                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                  : digit
                  ? 'border-[#1E7B34] bg-emerald-50/30 text-[#1B2A6B]'
                  : 'border-slate-300 bg-white text-slate-800 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20'
              } disabled:opacity-50 disabled:bg-slate-100 shadow-2xs`}
            />
          ))}
        </div>
      </div>

      {/* Inline Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {isLockedOut
              ? `Too many failed attempts. Try again in ${lockoutRemaining}s.`
              : errorMsg}
          </span>
        </div>
      )}

      {/* 1) Clear Demo Mode Info Box with "Fill demo OTP" button */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
          <span className="font-medium text-amber-900 leading-snug">
            Demo mode: no SMS is sent. Use the code <strong className="font-mono font-extrabold text-amber-950">123456</strong>.
          </span>
        </div>
        <button
          type="button"
          onClick={handleFillDemoOtp}
          disabled={isLockedOut || isVerifying || isLoading}
          className="px-3 py-1.5 bg-[#F28C28] hover:bg-[#d97706] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fill demo OTP</span>
        </button>
      </div>

      {/* Resend Countdown Link */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-[11px] text-slate-500">
          Didn't receive code?
        </span>

        {countdown > 0 ? (
          <span className="text-slate-400 font-medium text-[11px]">
            {t.resendOtp} in <strong className="text-slate-700 font-mono font-bold">{countdown}s</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLockedOut}
            className="text-[#1E7B34] hover:text-[#18682B] font-bold underline cursor-pointer disabled:opacity-50 text-xs"
          >
            {t.resendOtp}
          </button>
        )}
      </div>

      {/* 2) Verify & Sign In Button with 800ms spinner & "Verifying..." label */}
      <button
        ref={verifyButtonRef}
        type="button"
        onClick={() => checkOtp(digits.join(''))}
        disabled={!isComplete || isLockedOut || isVerifying || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isVerifying || isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>{t.verifyAndSignIn}</span>
          </>
        )}
      </button>
    </div>
  );
};
