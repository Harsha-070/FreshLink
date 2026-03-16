import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sprout,
  TrendingDown,
  Brain,
  BarChart3,
  Layers,
  Snowflake,
  Smartphone,
  ShieldCheck,
  Truck,
  Clock,
  Globe,
  Mic,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Sprout,
    title: "Direct Farm Sourcing",
    desc: "Eliminate middlemen entirely. Connect with local mandi vendors and farmers for the freshest produce at wholesale prices.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: TrendingDown,
    title: "Surplus Marketplace",
    desc: "Automated end-of-day discounting for near-expiry produce. Turn potential waste into revenue with smart pricing.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Brain,
    title: "AI Smart Matching",
    desc: "Our algorithm matches your exact requirements with the nearest vendors based on distance, price, and availability.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "Real-Time Inventory",
    desc: "Live stock updates from vendors across Hyderabad. Know what's available, how much, and at what price right now.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Layers,
    title: "Multi-Vendor Orders",
    desc: "Combine items from multiple vendors in a single order. One checkout, one delivery, best prices across the board.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Snowflake,
    title: "Cold Storage Network",
    desc: "Partner cold storage facilities across Hyderabad. Store unsold surplus overnight to sell fresh the next morning.",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
  },
  {
    icon: Mic,
    title: "Voice-First Input",
    desc: "Add stock with voice commands in Telugu, Hindi, or English. '10kg Thakkali at 28 rupees per kg' -- done.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Verified Vendors",
    desc: "Every vendor goes through a verification process. Quality checks, hygiene standards, and reliability scores.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Truck,
    title: "Hyperlocal Delivery",
    desc: "Smart routing within 4km radius ensures produce arrives within 30 minutes. Cold-chain support for perishables.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Clock,
    title: "Recurring Orders",
    desc: "Set up daily or weekly recurring orders for your staple items. Never run out of onions or tomatoes again.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    desc: "Fully responsive platform designed for vendors on the go. Manage your entire business from your phone.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: Globe,
    title: "Demand Analytics",
    desc: "Predictive demand forecasting for seasonal produce. Know when drumstick prices will spike or mango season begins.",
    color: "text-lime-400",
    bg: "bg-lime-500/10 border-lime-500/20",
  },
];

export default function Features() {
  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen font-sans selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Platform Capabilities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Source Sustainably
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            A comprehensive suite of tools built for Hyderabad's fresh produce
            ecosystem. Designed for vendors at the mandi and kitchens across the
            city.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                className={`${feature.bg} border rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 cursor-default group`}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <feature.icon
                      className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-emerald-950/30 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join Hyderabad's growing network of vendors and businesses sourcing
            fresh produce the smart way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/vendor/login"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              Join as Vendor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/business/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-600 hover:border-slate-400 text-slate-200 font-bold px-8 py-4 rounded-full transition-all duration-300"
            >
              Join as Business <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">
              FreshLink
            </span>
          </Link>
          <p className="text-slate-500 text-sm">
            &copy; 2026 FreshLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
