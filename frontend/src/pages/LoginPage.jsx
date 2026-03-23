/**
 * LoginPage.jsx
 * -------------
 * Animated login/register page with split card design,
 * tab switching, form validation, and JWT handling.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === "login") {
        if (!formData.username || !formData.password) {
          toast.error("Please fill in all fields");
          return;
        }
        await login(formData.username, formData.password);
        toast.success("Welcome back! 🎉");
      } else {
        if (!formData.username || !formData.email || !formData.password) {
          toast.error("Please fill in all fields");
          return;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        await register(formData.username, formData.email, formData.password);
        toast.success("Account created! Welcome! 🚀");
      }
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    fontSize: 15,
    fontWeight: 500,
    color: "#f1f5f9",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#06060f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          top: "-10%",
          left: "-10%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          bottom: "-10%",
          right: "-10%",
          filter: "blur(80px)",
        }}
      />

      {/* Card container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          display: "flex",
          width: 900,
          maxWidth: "95vw",
          minHeight: 520,
          borderRadius: 24,
          overflow: "hidden",
          background: "rgba(13,13,31,0.85)",
          backdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 16px 64px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.1)",
        }}
      >
        {/* Left branding panel */}
        <div
          style={{
            flex: "0 0 360px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
            position: "relative",
            overflow: "hidden",
          }}
          className="login-brand-panel"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: "1px solid rgba(124,58,237,0.08)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              boxShadow: "0 0 40px rgba(124,58,237,0.3)",
              marginBottom: 24,
              zIndex: 1,
            }}
          >
            📚
          </motion.div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 900,
              background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 12,
              zIndex: 1,
            }}
          >
            PREPIFY
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 1.6,
              zIndex: 1,
            }}
          >
            AI-powered study assistant with flashcards, quizzes, attendance tracking & more
          </p>
        </div>

        {/* Right form panel */}
        <div
          style={{
            flex: 1,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 32,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              padding: 4,
            }}
          >
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: activeTab === tab ? "#fff" : "#64748b",
                  background:
                    activeTab === tab
                      ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                      : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textTransform: "capitalize",
                  fontFamily: "inherit",
                }}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {activeTab === "register" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#7c3aed";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              )}

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {activeTab === "register" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#7c3aed";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 8,
                  padding: "16px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  border: "none",
                  borderRadius: 12,
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                  fontFamily: "inherit",
                  opacity: submitting ? 0.7 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                {submitting
                  ? "Please wait..."
                  : activeTab === "login"
                  ? "Sign In"
                  : "Create Account"}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Back to welcome */}
          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            <span
              onClick={() => navigate("/welcome")}
              style={{
                color: "#a78bfa",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ← Back to Welcome
            </span>
          </p>
        </div>
      </motion.div>

      {/* Hide brand panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
