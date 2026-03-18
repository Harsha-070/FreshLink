import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Save, Loader2, Shield, Store,
  FileText, CreditCard, IndianRupee,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useStore';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function VendorSettings() {
  const { user, updateProfile, isLoading: storeLoading } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    upiId: '',
    shopName: '',
    shopAddress: '',
    shopDescription: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        upiId: user.upiId || '',
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        shopDescription: user.shopDescription || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        upiId: formData.upiId,
        shopName: formData.shopName,
        shopAddress: formData.shopAddress,
        shopDescription: formData.shopDescription,
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile, shop details, and payment preferences</p>
      </motion.div>

      {/* Profile Avatar Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(formData.name || 'V').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{formData.name || 'Vendor'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role === 'vendor' ? 'Verified Vendor' : user?.role || 'Vendor'}
                  </span>
                  {formData.email && (
                    <span className="text-sm text-slate-500">{formData.email}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Info Section */}
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.4 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shop Details Section */}
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.4 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Shop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Shop Name */}
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-slate-700 mb-2">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="shopName"
                    type="text"
                    placeholder="e.g., Ravi's Fresh Vegetables"
                    value={formData.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Shop Address */}
              <div>
                <label htmlFor="shopAddress" className="block text-sm font-medium text-slate-700 mb-2">
                  Shop Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    id="shopAddress"
                    placeholder="Full address of your shop or farm"
                    value={formData.shopAddress}
                    onChange={(e) => handleChange('shopAddress', e.target.value)}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Shop Description */}
              <div>
                <label htmlFor="shopDescription" className="block text-sm font-medium text-slate-700 mb-2">
                  Shop Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    id="shopDescription"
                    placeholder="Describe what you sell, your specialties, etc."
                    value={formData.shopDescription}
                    onChange={(e) => handleChange('shopDescription', e.target.value)}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Details Section */}
        <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.4 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* UPI ID */}
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-slate-700 mb-2">
                  UPI ID (for receiving payments)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="upiId"
                    type="text"
                    placeholder="e.g., ravi.veggies@upi"
                    value={formData.upiId}
                    onChange={(e) => handleChange('upiId', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-shadow hover:shadow-sm"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 ml-1">
                  Buyers will see this UPI ID to pay you directly
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div {...fadeUp} transition={{ delay: 0.5, duration: 0.4 }}>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl shadow-sm"
              disabled={saving || storeLoading}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
