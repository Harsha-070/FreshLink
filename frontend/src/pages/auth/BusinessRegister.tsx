import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, ArrowLeft, User, MapPin, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useStore';

const businessTypes = ['Restaurant', 'Hotel', 'Juice Shop', 'Mess/Canteen', 'Catering', 'Cloud Kitchen', 'Bakery', 'Cafe', 'Other'];

export default function BusinessRegister() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    deliveryAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      toast.error('Please enter your business name');
      return;
    }

    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!cleanPhone.match(/^\+?\d{10,13}$/)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.businessType) {
      toast.error('Please select your business type');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        phone: cleanPhone,
        password: formData.password,
        role: 'business',
        email: formData.email || undefined,
        businessType: formData.businessType,
        deliveryAddress: formData.deliveryAddress || undefined,
      });
      toast.success('Registration successful! Welcome to FreshLink!');
      navigate('/business/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      <Link to="/" className="absolute top-6 left-6 p-2 rounded-full bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 transition-colors z-10">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-cyan-600 p-2.5 rounded-xl shadow-lg shadow-cyan-200">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              FreshLink
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Business Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Create your business account to start ordering
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Business Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="The Grand Restaurant"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="business@example.com"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Business Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                  className="w-full pl-10 h-12 text-base rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select business type...</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Delivery Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Banjara Hills, Hyderabad"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10 pr-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 h-12 text-base rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-base font-semibold shadow-lg shadow-cyan-200 transition-all hover:shadow-cyan-300 mt-2"
              disabled={isLoading || !formData.name || !formData.phone || !formData.businessType || !formData.password || !formData.confirmPassword}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/business/login" className="font-medium text-cyan-600 hover:text-cyan-500">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Are you a Vendor?{' '}
              <Link to="/vendor/register" className="font-medium text-cyan-600 hover:text-cyan-500">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
