/**
 * WelcomePage.jsx
 * ---------------
 * Animated splash screen with particle background,
 * spring-animated logo, typewriter tagline, & "Get Started" CTA.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 8 + 8,
  delay: Math.random() * 4,
}));

const tagline = "Your Personal Study Buddy";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [typedText, setTypedText] = useState("");
  const [showButton, setShowButton] = useState(false);

  // Auto-skip if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const t = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, loading, navigate]);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= tagline.length) {
        setTypedText(tagline.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 300);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#06060f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(124, 58, 237, ${0.3 + Math.random() * 0.4})`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Large blur orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          top: "10%",
          right: "10%",
          filter: "blur(60px)",
          animation: "float 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          bottom: "5%",
          left: "5%",
          filter: "blur(60px)",
          animation: "float 16s ease-in-out infinite reverse",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: "linear-gradient(135deg, #7c3aed, #a78bfa, #c4b5fd)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          boxShadow: "0 0 60px rgba(124,58,237,0.4), 0 0 120px rgba(124,58,237,0.2)",
          marginBottom: 32,
        }}
      >
        📚
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        style={{
          fontSize: 56,
          fontWeight: 900,
          background: "linear-gradient(135deg, #a78bfa, #c4b5fd, #e0d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -2,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        PREPIFY
      </motion.h1>

      {/* Typewriter tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          fontSize: 20,
          color: "#94a3b8",
          fontWeight: 400,
          minHeight: 30,
          textAlign: "center",
        }}
      >
        {typedText}
        <span
          style={{
            animation: "blink 0.8s steps(1) infinite",
            marginLeft: 2,
          }}
        >
          |
        </span>
      </motion.p>

      {/* Get Started button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            style={{
              marginTop: 48,
              padding: "16px 48px",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(124,58,237,0.3)",
              letterSpacing: 0.5,
              fontFamily: "inherit",
            }}
          >
            Get Started →
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
