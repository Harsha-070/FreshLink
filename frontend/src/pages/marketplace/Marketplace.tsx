import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShoppingCart,
  ChevronDown,
  Loader2,
  Tag,
  X,
  Plus,
  Minus,
  Trash2,
  Check,
  Package,
  Truck,
  SlidersHorizontal,
  ArrowUpDown,
  Leaf,
  Apple,
  Salad,
  Cherry,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useCartStore, CartItem } from '@/store/cartStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StockItem {
  id: string;
  vendorId: string;
  produceId: string;
  name: string;
  localName: string;
  category: string;
  quantity: number;
  pricePerKg: number;
  unit: string;
  image: string;
  status: string;
  expiryDate: string;
  listedAt: string;
  isSurplus: boolean;
  discountPrice: number | null;
  vendorName?: string;
  vendorRating?: number;
  vendorDistance?: number;
  mandiPriceMin?: number;
  mandiPriceMax?: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type CategoryKey = 'All' | 'Vegetables' | 'Leafy Greens' | 'Fruits' | 'Exotic';

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ReactNode }[] = [
  { key: 'All', label: 'All', icon: <Package className="w-4 h-4" /> },
  { key: 'Vegetables', label: 'Vegetables', icon: <Salad className="w-4 h-4" /> },
  { key: 'Leafy Greens', label: 'Leafy Greens', icon: <Leaf className="w-4 h-4" /> },
  { key: 'Fruits', label: 'Fruits', icon: <Apple className="w-4 h-4" /> },
  { key: 'Exotic', label: 'Exotic', icon: <Cherry className="w-4 h-4" /> },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

const PAGE_SIZE = 12;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop';

// ---------------------------------------------------------------------------
// Skeleton Card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-6 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-10 bg-slate-200 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quantity Selector
// ---------------------------------------------------------------------------

function QuantitySelector({
  value,
  max,
  unit,
  onChange,
}: {
  value: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const unitLabel = unit === 'piece' || unit === 'bunch' || unit === 'dozen' ? unit : 'kg';
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-600"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-12 text-center text-sm font-semibold text-slate-800">
        {value} {unitLabel}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-slate-600"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: StockItem }) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.stockId === product.id);
  const [qty, setQty] = useState(1);
  const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE);

  const unitLabel =
    product.unit === 'piece' || product.unit === 'bunch' || product.unit === 'dozen'
      ? `/${product.unit}`
      : '/kg';

  const effectivePrice =
    product.isSurplus && product.discountPrice ? product.discountPrice : product.pricePerKg;

  const discountPercent =
    product.isSurplus && product.discountPrice
      ? Math.round(((product.pricePerKg - product.discountPrice) / product.pricePerKg) * 100)
      : 0;

  const isLowStock = product.quantity <= 5;
  const vendorName = product.vendorName || 'Local Vendor';
  const vendorRating = product.vendorRating || 4.2;
  const vendorDistance = product.vendorDistance || 2.4;
  const mandiMin = product.mandiPriceMin || Math.round(product.pricePerKg * 0.85);
  const mandiMax = product.mandiPriceMax || Math.round(product.pricePerKg * 1.1);

  const handleAddToCart = () => {
    addItem({
      stockId: product.id,
      name: product.name,
      vendorId: product.vendorId,
      vendorName,
      quantity: qty,
      pricePerKg: effectivePrice,
      unit: product.unit,
      image: product.image,
      maxQuantity: product.quantity,
    });
    toast.success(`${product.name} added to cart`, {
      description: `${qty} ${product.unit === 'kg' ? 'kg' : product.unit} from ${vendorName}`,
    });
    setQty(1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 bg-white relative">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />

          {/* Surplus badge */}
          {product.isSurplus && discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
              {discountPercent}% OFF
            </div>
          )}

          {/* Category chip */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 shadow-sm">
            {product.category}
          </div>

          {/* Low stock */}
          {isLowStock && (
            <div className="absolute bottom-3 left-3 bg-orange-500/90 text-white px-2 py-0.5 rounded text-[11px] font-bold">
              Low Stock
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col gap-2">
          {/* Name */}
          <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          {product.localName && product.localName !== product.name && (
            <p className="text-[11px] text-slate-400 italic -mt-1">{product.localName}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {'\u20B9'}{effectivePrice}
            </span>
            <span className="text-sm text-slate-400">{unitLabel}</span>
            {product.isSurplus && product.discountPrice && (
              <span className="text-sm text-slate-400 line-through">
                {'\u20B9'}{product.pricePerKg}
              </span>
            )}
          </div>

          {/* Mandi price */}
          <p className="text-[11px] text-slate-400">
            Mandi: {'\u20B9'}{mandiMin}-{mandiMax}{unitLabel}
          </p>

          {/* Vendor info */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{vendorName}</span>
            <span className="text-slate-300">|</span>
            <span>{vendorDistance} km</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{vendorRating}</span>
            </div>
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {isLowStock ? (
              <>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-orange-600 font-medium">
                  Low Stock ({product.quantity} {product.unit})
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-600 font-medium">
                  In Stock ({product.quantity} {product.unit})
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 pt-3 mt-1">
            {cartItem ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  In Cart
                </div>
                <QuantitySelector
                  value={cartItem.quantity}
                  max={product.quantity}
                  unit={product.unit}
                  onChange={(v) => updateQuantity(product.id, v)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <QuantitySelector
                  value={qty}
                  max={product.quantity}
                  unit={product.unit}
                  onChange={setQty}
                />
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm h-9"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Cart Drawer
// ---------------------------------------------------------------------------

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = getTotal();
  const deliveryEstimate = total > 500 ? 0 : 40;
  const grandTotal = total + deliveryEstimate;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      // Group items by vendor
      const vendorGroups: Record<string, CartItem[]> = {};
      items.forEach((item) => {
        if (!vendorGroups[item.vendorId]) vendorGroups[item.vendorId] = [];
        vendorGroups[item.vendorId].push(item);
      });

      let lastOrderId = '';
      for (const vendorId of Object.keys(vendorGroups)) {
        const vendorItems = vendorGroups[vendorId];
        const result = await api.createOrder({
          vendorId,
          items: vendorItems.map((i) => ({
            stockId: i.stockId,
            name: i.name,
            quantity: i.quantity,
            pricePerKg: i.pricePerKg,
            unit: i.unit,
          })),
          totalAmount: vendorItems.reduce((s, i) => s + i.pricePerKg * i.quantity, 0),
        });
        const newOrder = result.order || result;
        lastOrderId = newOrder.id || newOrder._id || lastOrderId;
      }

      clearCart();
      toast.success('Order placed! Redirecting to payment...');
      onClose();

      if (lastOrderId) {
        navigate(`/business/checkout/${lastOrderId}`);
      } else {
        setOrderPlaced(true);
        setTimeout(() => {
          setOrderPlaced(false);
        }, 2500);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {getItemCount()} items
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {orderPlaced ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900">Order Placed!</h3>
                  <p className="text-slate-500 text-center text-sm">
                    Your order has been confirmed. You can track it from your dashboard.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600">Your cart is empty</h3>
                  <p className="text-slate-400 text-sm text-center">
                    Browse the marketplace and add fresh produce to your cart.
                  </p>
                  <Button variant="outline" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const unitLabel =
                      item.unit === 'piece' || item.unit === 'bunch' || item.unit === 'dozen'
                        ? item.unit
                        : 'kg';
                    return (
                      <div key={item.stockId} className="flex gap-3 px-5 py-4">
                        <img
                          src={item.image || FALLBACK_IMAGE}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{item.vendorName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <QuantitySelector
                              value={item.quantity}
                              max={item.maxQuantity}
                              unit={item.unit}
                              onChange={(v) => updateQuantity(item.stockId, v)}
                            />
                            <span className="text-sm font-bold text-slate-900">
                              {'\u20B9'}{(item.pricePerKg * item.quantity).toFixed(0)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {'\u20B9'}{item.pricePerKg}/{unitLabel}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.stockId)}
                          className="p-1.5 hover:bg-red-50 rounded-lg self-start transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !orderPlaced && (
              <div className="border-t border-slate-200 px-5 py-4 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{'\u20B9'}{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Delivery
                    </span>
                    <span>
                      {deliveryEstimate === 0 ? (
                        <span className="text-emerald-600 font-medium">FREE</span>
                      ) : (
                        `\u20B9${deliveryEstimate}`
                      )}
                    </span>
                  </div>
                  {deliveryEstimate > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Free delivery on orders above {'\u20B9'}500
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-1.5 border-t border-slate-200">
                    <span>Total</span>
                    <span>{'\u20B9'}{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 font-bold text-base rounded-xl"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order \u2022 \u20B9${grandTotal.toFixed(0)}`
                  )}
                </Button>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Filters Sidebar
// ---------------------------------------------------------------------------

interface Filters {
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
  surplusOnly: boolean;
  sort: SortOption;
}

function FiltersSidebar({
  filters,
  onChange,
  open,
  onClose,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  open: boolean;
  onClose: () => void;
}) {
  const content = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
          Sort By
        </label>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sort: opt.value })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.sort === opt.value
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
          Price Range ({'\u20B9'})
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <span className="text-slate-400 text-sm">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Availability
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-slate-700">In Stock Only</span>
          <button
            onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              filters.inStockOnly ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                filters.inStockOnly ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-slate-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            Surplus Deals
          </span>
          <button
            onClick={() => onChange({ ...filters, surplusOnly: !filters.surplusOnly })}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              filters.surplusOnly ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                filters.surplusOnly ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={() =>
          onChange({
            priceMin: '',
            priceMax: '',
            inStockOnly: false,
            surplusOnly: false,
            sort: 'default',
          })
        }
        className="w-full text-sm text-slate-500 hover:text-red-500 transition-colors py-2"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-28 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </h3>
          {content}
        </div>
      </aside>

      {/* Mobile filter modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-40 lg:hidden max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              {content}
              <Button
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={onClose}
              >
                Apply Filters
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Marketplace Component
// ---------------------------------------------------------------------------

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<StockItem[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceMin: '',
    priceMax: '',
    inStockOnly: false,
    surplusOnly: false,
    sort: 'default',
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const cartItemCount = useCartStore((s) => s.getItemCount());

  // Fetch stock from API
  const fetchStock = useCallback(async (category: CategoryKey, search: string) => {
    setIsLoading(true);
    try {
      const params: string[] = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (search.trim()) {
        params.push(`search=${encodeURIComponent(search.trim())}`);
      }
      const data = await api.getAllStock(params.length > 0 ? params.join('&') : undefined);
      const items: StockItem[] = data.stock || [];
      setAllItems(items);
      setDisplayedCount(PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch stock:', err);
      toast.error('Failed to load produce. Please try again.');
      setAllItems([]);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStock('All', '');
  }, [fetchStock]);

  // Fetch when category changes
  useEffect(() => {
    fetchStock(activeCategory, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStock(activeCategory, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Client-side filtering + sorting
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // In-stock filter
    if (filters.inStockOnly) {
      items = items.filter((i) => i.quantity > 0);
    }

    // Surplus filter
    if (filters.surplusOnly) {
      items = items.filter((i) => i.isSurplus);
    }

    // Price range
    const min = parseFloat(filters.priceMin);
    const max = parseFloat(filters.priceMax);
    if (!isNaN(min)) {
      items = items.filter((i) => {
        const price = i.isSurplus && i.discountPrice ? i.discountPrice : i.pricePerKg;
        return price >= min;
      });
    }
    if (!isNaN(max)) {
      items = items.filter((i) => {
        const price = i.isSurplus && i.discountPrice ? i.discountPrice : i.pricePerKg;
        return price <= max;
      });
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        items.sort((a, b) => {
          const pa = a.isSurplus && a.discountPrice ? a.discountPrice : a.pricePerKg;
          const pb = b.isSurplus && b.discountPrice ? b.discountPrice : b.pricePerKg;
          return pa - pb;
        });
        break;
      case 'price-desc':
        items.sort((a, b) => {
          const pa = a.isSurplus && a.discountPrice ? a.discountPrice : a.pricePerKg;
          const pb = b.isSurplus && b.discountPrice ? b.discountPrice : b.pricePerKg;
          return pb - pa;
        });
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return items;
  }, [allItems, filters]);

  const displayedProducts = filteredItems.slice(0, displayedCount);
  const hasMore = displayedCount < filteredItems.length;

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
  }, [filteredItems.length]);

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  const activeFilterCount = [
    filters.priceMin,
    filters.priceMax,
    filters.inStockOnly,
    filters.surplusOnly,
    filters.sort !== 'default',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* Top Bar */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search row */}
          <div className="flex items-center gap-3 py-3">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for vegetables, fruits, leafy greens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.span>
              )}
            </button>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Mobile filter button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Content */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results info */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {initialLoading ? (
              'Loading...'
            ) : (
              <>
                <span className="font-semibold text-slate-700">{filteredItems.length}</span>{' '}
                {filteredItems.length === 1 ? 'product' : 'products'} found
                {searchQuery && (
                  <span>
                    {' '}
                    for "<span className="font-medium text-slate-700">{searchQuery}</span>"
                  </span>
                )}
              </>
            )}
          </p>
          {/* Desktop sort dropdown */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <ArrowUpDown className="w-4 h-4" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortOption })}
              className="bg-transparent border-none text-sm text-slate-600 font-medium focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Initial Loading Skeleton */}
            {initialLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!initialLoading && !isLoading && filteredItems.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No products found</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                    setFilters({
                      priceMin: '',
                      priceMax: '',
                      inStockOnly: false,
                      surplusOnly: false,
                      sort: 'default',
                    });
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Product Grid */}
            {!initialLoading && filteredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProducts.map((product, i) => {
                  const isLast = i === displayedProducts.length - 1;
                  return (
                    <div key={product.id} ref={isLast ? lastProductElementRef : undefined}>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading more indicator */}
            {isLoading && !initialLoading && (
              <div className="mt-10 flex justify-center items-center py-8">
                <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                <span className="ml-3 text-slate-500 font-medium text-sm">Loading more...</span>
              </div>
            )}

            {/* End of list */}
            {!hasMore && filteredItems.length > 0 && !initialLoading && (
              <div className="mt-10 text-center py-6 text-sm text-slate-400">
                Showing all {filteredItems.length} products
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-emerald-500 mb-4">FreshLink</h2>
            <p className="max-w-sm text-sm leading-relaxed">
              Connecting farmers directly to businesses, reducing waste, and ensuring the freshest
              produce reaches your kitchen.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-emerald-400 transition-colors">
                  For Vendors
                </Link>
              </li>
              <li>
                <Link to="/business/dashboard" className="hover:text-emerald-400 transition-colors">
                  For Restaurants
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/* Cart Drawer */}
      {/* ------------------------------------------------------------------ */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
