import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

interface MultiLayerParallaxProps {
  children: React.ReactNode;
  bgImage?: string;
  className?: string;
}

export const MultiLayerParallax: React.FC<MultiLayerParallaxProps> = ({
  children,
  bgImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scroll Parallax
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yClouds = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yForeground = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 40; // max 20px movement
      const y = (e.clientY / innerHeight - 0.5) * 40;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={ref}
      className={`relative h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center ${className}`}
    >
      {/* Layer 1: Distant bg (-30 speed) */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          y: yBg,
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "bottom",
          backgroundSize: "cover",
          opacity: 0.4,
        }}
      />

      {/* Layer 2: Clouds/patterns (-15) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          y: yClouds,
          backgroundImage: "radial-gradient(circle at center, transparent 0%, #0f172a 100%)",
        }}
      />

      {/* Layer 3: Main content (0) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>

      {/* Layer 4: Foreground elements (+8) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none bg-gradient-to-t from-slate-900 to-transparent"
        style={{ y: yForeground }}
      />

      {/* Layer 5: Mouse-follow particles (+20) */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          x: mouseXSpring,
          y: mouseYSpring,
        }}
      >
        {/* Add some floating particles here */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-emerald-500 rounded-full blur-sm opacity-50" />
        <div className="absolute top-3/4 left-2/3 w-6 h-6 bg-emerald-400 rounded-full blur-md opacity-30" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-300 rounded-full blur-sm opacity-60" />
      </motion.div>
    </div>
  );
};
