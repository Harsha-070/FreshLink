import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Leaf } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you register on FreshLink, we collect the following information:

- **Account Information:** Name, email address, phone number, and business type (vendor or buyer).
- **Business Details:** Business name, FSSAI license (if applicable), GST number, and address.
- **Transaction Data:** Order history, payment details (processed securely via third-party payment gateways), and delivery information.
- **Usage Data:** Pages visited, features used, device information, and IP address for platform improvement.
- **Location Data:** Approximate location to match vendors and businesses within a 4km radius (only when you grant permission).`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your data to:

- Provide and improve the FreshLink platform and services.
- Match vendors with nearby businesses based on location and requirements.
- Process orders, payments, and deliveries.
- Send order updates, delivery notifications, and platform announcements.
- Generate anonymized analytics to improve our matching algorithms.
- Comply with legal obligations and prevent fraud.`,
  },
  {
    title: "3. Data Sharing",
    content: `We do not sell your personal data to third parties. We share information only in these cases:

- **With matched parties:** When a vendor and business are matched, relevant contact and order details are shared to facilitate the transaction.
- **Payment processors:** Payment information is shared securely with our payment partners (Razorpay / UPI providers) to process transactions.
- **Legal requirements:** We may share data if required by Indian law or to protect our legal rights.`,
  },
  {
    title: "4. Data Security",
    content: `We take reasonable measures to protect your data:

- All data transmitted between your device and our servers is encrypted using TLS/SSL.
- Passwords are hashed and never stored in plain text.
- Access to personal data is restricted to authorized team members only.
- We conduct regular security reviews of our codebase and infrastructure.`,
  },
  {
    title: "5. Your Rights",
    content: `As a user, you have the right to:

- Access the personal data we hold about you.
- Request correction of inaccurate data.
- Request deletion of your account and associated data.
- Opt out of non-essential communications.

To exercise any of these rights, contact us at hello@freshlinkpro.com.`,
  },
  {
    title: "6. Cookies",
    content: `We use essential cookies to maintain your login session and remember your preferences. We do not use third-party advertising cookies. Analytics cookies are used in anonymized form to understand platform usage patterns.`,
  },
  {
    title: "7. Changes to This Policy",
    content: `We may update this privacy policy from time to time. When we do, we will notify registered users via email and update the "Last Updated" date below. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "8. Contact Us",
    content: `If you have questions about this privacy policy or how we handle your data, please reach out:

- **Email:** hello@freshlinkpro.com
- **Phone:** +91 98765 43210
- **Address:** Hyderabad, Telangana, India`,
  },
];

export default function Privacy() {
  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen font-sans selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Your Data, Protected
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Policy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            We respect your privacy and are committed to protecting your
            personal data. This policy explains how we collect, use, and
            safeguard your information.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-slate-500"
          >
            Last Updated: March 15, 2026
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-line prose-invert">
                {section.content.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-slate-200 font-semibold">
                      {part}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </motion.div>
          ))}
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
