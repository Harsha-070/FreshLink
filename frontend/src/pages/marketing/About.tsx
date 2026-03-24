import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Leaf,
  Target,
  Heart,
  TrendingDown,
  Users,
  Truck,
  ArrowRight,
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

const impactStats = [
  { value: "40%", label: "Food Waste Reduced", desc: "For partnered vendors" },
  { value: "50+", label: "Fresh Products", desc: "Listed on the platform" },
  { value: "30 min", label: "Average Delivery", desc: "Farm to kitchen speed" },
  { value: "8+", label: "Active Vendors", desc: "Across Hyderabad" },
];

const team = [
  {
    name: "Harsha Vardhan",
    role: "Founder & Full-Stack Developer",
    initials: "HV",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    name: "Priya Sharma",
    role: "Operations & Vendor Relations",
    initials: "PS",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Ravi Kumar",
    role: "Supply Chain & Logistics",
    initials: "RK",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Sneha Reddy",
    role: "Product Design & UX",
    initials: "SR",
    color: "from-purple-500 to-pink-500",
  },
];

const values = [
  {
    icon: TrendingDown,
    title: "Zero Waste",
    desc: "Every kilogram of produce saved from the landfill is a win for the planet and the economy.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "We build for the local vendor at the mandi, not for large corporations with unlimited budgets.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Truck,
    title: "Speed Matters",
    desc: "Fresh produce has a ticking clock. Our systems are built for speed at every step.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

export default function About() {
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
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Reducing Food Waste,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              One City at a Time
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            India wastes nearly 67 million tonnes of food every year. In
            Hyderabad alone, local mandi vendors discard unsold produce daily
            while restaurants struggle to find fresh stock at fair prices.
            FreshLink bridges this gap with technology.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
                  Our Mission
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                Build the infrastructure that makes fresh food accessible and
                waste unacceptable.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                We started FreshLink after seeing rows of fresh vegetables
                rot at Bowenpally mandi while restaurants just 3 kilometers away
                were paying premium prices to middlemen. The disconnect was
                staggering.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our platform directly connects these two sides -- giving vendors
                a digital storefront and giving businesses a reliable, affordable
                supply chain. No middlemen. No markup. No waste.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="space-y-6"
            >
              {values.map((value, i) => (
                <div
                  key={i}
                  className={`${value.bg} border rounded-2xl p-6 flex items-start gap-5`}
                >
                  <div className="flex-shrink-0">
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {value.title}
                    </h3>
                    <p className="text-slate-400">{value.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-950/20 border-y border-emerald-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
              Our Impact
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold">
              Numbers That Matter
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-500">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
              The Team
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold">
              Built by People Who Care
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
              A small, focused team obsessed with solving Hyderabad's fresh
              produce supply chain.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center hover:border-slate-700 transition-colors"
              >
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-5`}
                >
                  <span className="text-2xl font-bold text-white">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-emerald-950/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Join Us in Building a Zero-Waste Future
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Whether you're a vendor looking to reach more customers or a
            business seeking fresh, affordable produce -- we'd love to have you
            on board.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/vendor/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full transition-all duration-300"
            >
              Join as Vendor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-600 hover:border-slate-400 text-slate-200 font-bold px-8 py-4 rounded-full transition-all duration-300"
            >
              Get in Touch
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
