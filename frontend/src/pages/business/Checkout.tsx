import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Copy, Check, ExternalLink, Loader2,
  ShieldCheck, Package, ArrowLeft, QrCode, CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  pricePerKg?: number;
  unit?: string;
}

interface OrderData {
  id: string;
  _id?: string;
  vendorId: string;
  vendorName?: string;
  vendorUpiId?: string;
  items: OrderItem[];
  totalAmount?: number;
  status?: string;
}

export default function Checkout() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      // Try to get the specific order; fall back to fetching all orders and filtering
      let orderData: any;
      try {
        orderData = await api.getOrders();
      } catch {
        orderData = { orders: [] };
      }

      const orders = orderData.orders || orderData || [];
      const found = orders.find(
        (o: any) => (o.id || o._id) === orderId
      );

      if (found) {
        setOrder({
          id: found.id || found._id,
          _id: found._id,
          vendorId: found.vendorId,
          vendorName: found.vendorName || 'Vendor',
          vendorUpiId: found.vendorUpiId || found.upiId || '',
          items: found.items || [],
          totalAmount: found.totalAmount || 0,
          status: found.status,
        });
      } else {
        // Use fallback mock data for display
        setOrder({
          id: orderId!,
          vendorId: '',
          vendorName: 'Vendor',
          vendorUpiId: '',
          items: [],
          totalAmount: 0,
          status: 'pending',
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = order
    ? order.totalAmount ||
      order.items.reduce(
        (sum, item) => sum + (item.price || item.pricePerKg || 0) * (item.quantity || 1),
        0
      )
    : 0;

  const upiId = order?.vendorUpiId || '';
  const vendorName = order?.vendorName || 'Vendor';
  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(vendorName)}&am=${totalAmount}&cu=INR&tn=FreshLink+Order+${orderId}`
    : '';
  const qrUrl = upiLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`
    : '';

  const handleCopyUpi = async () => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      await api.updateOrderStatus(order.id || order._id!, 'confirmed');
      setPaymentDone(true);
      toast.success('Payment confirmed! Order is being processed.');
      setTimeout(() => {
        navigate('/business/orders');
      }, 3000);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
        <span className="ml-3 text-slate-500 font-medium">Loading order...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center">
        <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <p className="text-slate-500 mt-2">This order may have been removed or does not exist.</p>
        <Button
          onClick={() => navigate('/business/orders')}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Go to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Success Animation */}
      <AnimatePresence>
        {paymentDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-slate-900 mt-6"
              >
                Payment Confirmed!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-slate-500 mt-2"
              >
                Redirecting to your orders...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Complete Payment</h1>
        <p className="text-slate-500 mt-1">
          Order #{(orderId || '').slice(-8).toUpperCase()}
        </p>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-600" />
              Order Summary
            </h3>

            <div className="text-sm text-slate-500 mb-3">
              Vendor: <span className="font-medium text-slate-800">{vendorName}</span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.length > 0 ? (
                order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} {item.unit || 'kg'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      <IndianRupee className="w-3 h-3 inline" />
                      {((item.price || item.pricePerKg || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 text-center py-4">
                  No item details available
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-bold text-emerald-600 flex items-center">
                  <IndianRupee className="w-5 h-5" />
                  {totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Pay via UPI
            </h3>

            {upiId ? (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-sm">
                    <img
                      src={qrUrl}
                      alt="UPI Payment QR Code"
                      className="w-[250px] h-[250px]"
                      loading="eager"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Scan with any UPI app to pay
                  </p>
                </div>

                {/* UPI ID Display */}
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-2">
                    UPI ID
                  </p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-lg font-mono font-semibold text-emerald-900 bg-white/60 px-4 py-2.5 rounded-lg border border-emerald-200">
                      {upiId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUpi}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Pay via UPI App button (useful on mobile) */}
                <a
                  href={upiLink}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
                >
                  <Smartphone className="w-5 h-5" />
                  Pay via UPI App
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>

                {/* Amount highlight */}
                <div className="text-center bg-slate-50 rounded-xl py-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6" />
                    {totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IndianRupee className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">UPI details not available</p>
                <p className="text-sm text-slate-400 mt-1">
                  The vendor has not set up their UPI ID yet. Please contact them directly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-6 text-xs text-slate-400"
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-500" />
          <span>Verified Vendor</span>
        </div>
      </motion.div>

      {/* Confirm Payment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handlePaymentConfirm}
          disabled={confirming || paymentDone}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-base font-semibold shadow-lg shadow-emerald-200"
        >
          {confirming ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Confirming...
            </>
          ) : paymentDone ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Payment Confirmed
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              I've Completed the Payment
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
