import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyPhone = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const phone = location.state?.phone;
  const email = location.state?.email;

  // Redirect if no phone data
  useEffect(() => {
    if (!phone) {
      toast.error('Please complete registration first');
      navigate('/register');
    }
  }, [phone, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setLoading(true);

    try {
      // Mock verification - in real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      if (otpValue === '123456') {
        toast.success('Phone verified successfully!');
        // Login user automatically and redirect to profile
        navigate('/profile');
      } else {
        toast.error('Invalid verification code. Try 123456 for demo.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      // Mock resend - in real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification code sent!');
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <motion.div 
        className="max-w-md w-full mx-auto bg-white rounded-xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            📱
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to <br />
            <span className="font-medium text-orange-600">{formatPhone(phone)}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center space-x-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
              maxLength={1}
            />
          ))}
        </div>

        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 text-center">
            <strong>Demo:</strong> Use code <strong>123456</strong> to verify
          </p>
        </div>

        {/* Verify Button */}
        <motion.button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
          }`}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify Phone Number'
          )}
        </motion.button>

        {/* Resend Section */}
        <div className="text-center mt-6">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend code in {timeLeft}s
            </p>
          )}
        </div>

        {/* Back to Register */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/register')}
            className="text-gray-600 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Registration
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyPhone; 