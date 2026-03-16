import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  ClipboardList,
  Truck,
  Sprout,
  TrendingDown,
  Brain,
  BarChart3,
  Layers,
  Snowflake,
  Leaf,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

const priceItems = [
  "Tomato \u20B919-24/kg",
  "Onion \u20B926-33/kg",
  "Potato \u20B925-32/kg",
  "Drumstick \u20B984-105/kg",
  "Mango \u20B9120-180/kg",
  "Capsicum \u20B940-55/kg",
  "Carrot \u20B935-42/kg",
  "Beetroot \u20B928-36/kg",
  "Beans \u20B960-75/kg",
  "Spinach \u20B920-28/kg",
  "Ginger \u20B9140-180/kg",
  "Green Chilli \u20B945-60/kg",
];

const steps = [
  {
    icon: Package,
    title: "Vendor Lists Stock",
    desc: "Vendors list fresh vegetables and fruits with real Hyderabad mandi prices",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: ClipboardList,
    title: "Business Posts Needs",
    desc: 'Restaurants post daily requirements \u2014 tomatoes 10kg, onions 15kg...',
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Truck,
    title: "Smart Match & Deliver",
    desc: "System matches nearby vendors within 4km, orders confirmed in minutes",
    color: "from-amber-500 to-amber-700",
  },
];

const features = [
  {
    icon: Sprout,
    title: "Direct Farm Sourcing",
    desc: "No middlemen, best prices. Connect directly with local vendors and farmers for the freshest produce at wholesale rates.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: TrendingDown,
    title: "Surplus Reduction",
    desc: "End-of-day discounts and cold storage support. Turn unsold stock into revenue instead of waste.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Brain,
    title: "Smart Matching",
    desc: "AI matches your exact requirements with the nearest available vendors based on location, price, and quality.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "Real-Time Stock",
    desc: "Live inventory updates from local markets. Know exactly what's available before you order.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Layers,
    title: "Multi-Vendor Orders",
    desc: "Combine products from multiple vendors in a single order. One delivery, best prices across the board.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Snowflake,
    title: "Cold Storage Network",
    desc: "Reduce waste by storing surplus overnight in our partner cold storage facilities across Hyderabad.",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
  },
];

const vendorBenefits = [
  "List stock in seconds with voice or CSV upload",
  "Reach nearby restaurants, hotels & juice shops",
  "Sell surplus at smart discounted rates before it spoils",
  "Access cold storage network across Hyderabad",
  "Get paid securely via UPI within 24 hours",
  "View demand forecasts and trending items",
];

const businessBenefits = [
  "Post daily requirements and get instant vendor matches",
  "Find nearest vendors within 4km of your kitchen",
  "Compare prices across multiple verified vendors",
  "Track deliveries in real-time from dispatch to door",
  "Automated recurring orders for staple items",
  "Quality guarantee with hassle-free returns",
];

export default function Landing() {
  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen font-sans selection:bg-emerald-500/30">
      <Navbar />

      {/* ========== 1. HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8"
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Hyderabad's Fresh Produce Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]"
          >
            <span className="text-white">Fresh from Farm</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
              to Kitchen in 30 Minutes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Connecting Hyderabad's local vegetable vendors with restaurants,
            hotels & juice shops.{" "}
            <span className="text-slate-200">
              Real-time prices, zero middlemen.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/vendor/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-105"
            >
              I'm a Vendor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/business/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-slate-600 hover:border-slate-400 text-slate-200 hover:text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              I'm a Business
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-0 sm:divide-x sm:divide-slate-700 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl px-2 py-4 sm:py-0"
          >
            {[
              { label: "Fresh Items", value: "50+" },
              { label: "Verified Vendors", value: "8" },
              { label: "Business Types", value: "4" },
              { label: "Hyderabad Market", value: "\u2713" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 sm:px-6 py-3"
              >
                <span className="text-lg font-bold text-emerald-400">
                  {stat.value}
                </span>
                <span className="text-sm text-slate-400">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== 2. HOW IT WORKS ========== */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-20"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
              Simple Process
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              How It Works
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
              Three simple steps to connect vendors with businesses. No
              complexity, no hassle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i + 1}
                className="relative group"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-2 z-10 w-10 h-10 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-400">
                    {i + 1}
                  </span>
                </div>

                <div className="h-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 pt-10 backdrop-blur-sm group-hover:border-emerald-500/30 transition-all duration-500 group-hover:bg-slate-900/80">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connector arrow (visible on desktop, between cards) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-6 h-6 text-slate-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3. LIVE PRICES TICKER ========== */}
      <section className="py-12 bg-emerald-950/30 border-y border-emerald-900/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest">
            Live Hyderabad Mandi Prices &mdash; March 2026
          </p>
        </div>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />

          <div className="flex overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap">
              {[...priceItems, ...priceItems].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ========== 4. FEATURES GRID ========== */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-20"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
              Platform Features
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
              Built specifically for Hyderabad's fresh produce ecosystem.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={(i % 3) + 1}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`${feature.bg} border rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 cursor-default`}
              >
                <feature.icon
                  className={`w-10 h-10 ${feature.color} mb-6`}
                />
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 5. FOR VENDORS / FOR BUSINESSES ========== */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
              Built For Everyone
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Two Sides, One Platform
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vendor Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={1}
              className="bg-gradient-to-br from-emerald-950/80 to-emerald-900/30 border border-emerald-800/40 rounded-3xl p-8 sm:p-10"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  For Vendors
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-2">
                Sell Smarter, Waste Less
              </h3>
              <p className="text-emerald-300/70 mb-8 text-lg">
                Reach more businesses, move more stock, earn more revenue.
              </p>
              <ul className="space-y-4">
                {vendorBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/vendor/login"
                className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/25"
              >
                Start as Vendor <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Business Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={2}
              className="bg-gradient-to-br from-blue-950/80 to-blue-900/30 border border-blue-800/40 rounded-3xl p-8 sm:p-10"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">
                  For Businesses
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-2">
                Source Fresh, Save Big
              </h3>
              <p className="text-blue-300/70 mb-8 text-lg">
                Find the best local vendors for your kitchen's daily needs.
              </p>
              <ul className="space-y-4">
                {businessBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/business/login"
                className="mt-8 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Start as Business <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== 6. FOOTER ========== */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Logo & Tagline */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  FreshLink{" "}
                  <span className="text-emerald-400">Pro</span>
                </span>
              </Link>
              <p className="text-slate-400 leading-relaxed max-w-xs">
                Connecting local vendors to local kitchens while reducing food
                waste.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Features", to: "/features" },
                  { label: "How It Works", to: "/how-it-works" },
                  { label: "Marketplace", to: "/marketplace" },
                  { label: "Contact", to: "/contact" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", to: "/privacy" },
                  { label: "About Us", to: "/about" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              &copy; 2026 FreshLink. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made for Hyderabad &#127470;&#127475;
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
