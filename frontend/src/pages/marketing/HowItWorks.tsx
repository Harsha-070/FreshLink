import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  ClipboardList,
  Search,
  Truck,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  ArrowDown,
  Leaf,
  Store,
  Sprout,
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

const vendorSteps = [
  {
    icon: Sprout,
    title: "Source Fresh Produce",
    desc: "Collect fresh vegetables and fruits from local mandis, farms, or your own inventory across Hyderabad.",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Package,
    title: "List on FreshLink",
    desc: "Upload your daily stock with prices using CSV, voice input, or our quick-add interface. Takes under 60 seconds.",
    color: "from-emerald-600 to-teal-600",
  },
  {
    icon: Search,
    title: "Get Matched Automatically",
    desc: "Our system matches your stock with nearby restaurant and hotel requirements within a 4km radius.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: CreditCard,
    title: "Deliver & Get Paid",
    desc: "Deliver the order, get confirmation, and receive payment via UPI within 24 hours. Simple and secure.",
    color: "from-cyan-500 to-blue-600",
  },
];

const businessSteps = [
  {
    icon: ClipboardList,
    title: "Post Your Requirements",
    desc: "List your daily needs -- '10kg tomatoes, 15kg onions, 5kg capsicum.' Set quality preferences and budget.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Search,
    title: "Browse & Compare",
    desc: "See matched vendors with live prices, distance, ratings, and available stock. Choose the best fit for your kitchen.",
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: Truck,
    title: "Track Your Delivery",
    desc: "Real-time tracking from vendor dispatch to your door. Know exactly when your produce will arrive.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: CheckCircle2,
    title: "Receive & Confirm",
    desc: "Inspect produce quality on arrival, confirm the order, and the vendor gets paid. Quality guarantee included.",
    color: "from-purple-500 to-pink-600",
  },
];

export default function HowItWorks() {
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
            <Truck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Step-by-Step Guide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            From Farm to Kitchen{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              in 4 Simple Steps
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Whether you're a vendor selling fresh produce or a business buying
            for your kitchen, FreshLink makes the process seamless.
          </motion.p>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center mt-12"
          >
            <ArrowDown className="w-8 h-8 text-emerald-500" />
          </motion.div>
        </div>
      </section>

      {/* Two-Column Flows */}
      <section className="py-12 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Vendor Flow */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
                <Store className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  Vendor Flow
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                How Vendors Sell
              </h2>
              <p className="mt-3 text-slate-400 text-lg">
                From listing your stock to receiving payment.
              </p>
            </motion.div>

            <div className="space-y-6 relative">
              {/* Vertical line */}
              <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-emerald-800/50" />

              {vendorSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i + 1}
                  className="relative flex items-start gap-6"
                >
                  {/* Step icon */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 hover:border-emerald-500/30 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Step {i + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Business Flow */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">
                  Business Flow
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                How Businesses Buy
              </h2>
              <p className="mt-3 text-slate-400 text-lg">
                From posting requirements to receiving fresh produce.
              </p>
            </motion.div>

            <div className="space-y-6 relative">
              {/* Vertical line */}
              <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-blue-800/50" />

              {businessSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i + 1}
                  className="relative flex items-start gap-6"
                >
                  {/* Step icon */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 hover:border-blue-500/30 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        Step {i + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-emerald-950/30 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join the platform that's connecting Hyderabad's vendors with
            kitchens across the city.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/vendor/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              Join as Vendor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/business/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25"
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
