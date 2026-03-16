import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Loader2, Building2, Mail, Phone, MapPin, Briefcase, Shield, User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useStore';

export default function BusinessSettings() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    businessName: user?.name || '',
    businessType: user?.businessType || '',
    email: user?.email || '',
    phone: user?.phone || '',
    deliveryAddress: user?.location
      ? typeof user.location === 'string'
        ? user.location
        : user.location.address || ''
      : '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      id: 'businessName',
      label: 'Business Name',
      icon: <Building2 className="w-4 h-4" />,
      type: 'text',
      placeholder: 'Your business name',
      value: formData.businessName,
    },
    {
      id: 'businessType',
      label: 'Business Type',
      icon: <Briefcase className="w-4 h-4" />,
      type: 'select',
      options: ['Restaurant', 'Hotel', 'Cafe', 'Catering', 'Juice Bar', 'Cloud Kitchen', 'Other'],
      value: formData.businessType,
    },
    {
      id: 'email',
      label: 'Email Address',
      icon: <Mail className="w-4 h-4" />,
      type: 'email',
      placeholder: 'your@email.com',
      value: formData.email,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: <Phone className="w-4 h-4" />,
      type: 'tel',
      placeholder: '+91 XXXXX XXXXX',
      value: formData.phone,
    },
    {
      id: 'deliveryAddress',
      label: 'Delivery Address',
      icon: <MapPin className="w-4 h-4" />,
      type: 'textarea',
      placeholder: 'Full delivery address',
      value: formData.deliveryAddress,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your business profile and preferences</p>
      </div>

      {/* Profile Avatar Section */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200">
              {(user?.name || 'B').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Business'}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role === 'business' ? 'Business Account' : user?.role || 'User'}
                </span>
                {user?.businessType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {user.businessType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Business Profile</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="text-slate-400">{field.icon}</span>
                  {field.label}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  >
                    <option value="">Select type...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt.toLowerCase()}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
