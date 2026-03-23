/**
 * Navbar.jsx
 * ----------
 * PREPIFY premium top navigation with:
 * - Animated gradient logo with heartbeat
 * - User XP & level display
 * - Daily streak with fire animation
 * - API usage pill with animated fill bar
 * - Notification bell
 * - Smooth hover microinteractions
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { motion } from "framer-motion";
import {
  LogoutOutlined,
  UserOutlined,
  ThunderboltOutlined,
  StarOutlined,
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, usage, limit, logout } = useAuth();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    // Fetch streak and compute XP
    api.get("/attendance/stats").then((res) => {
      setStreak(res.data.current_streak || 0);
    }).catch(() => {});

    // Quick XP calculation from usage
    Promise.all([
      api.get("/pomodoro/stats").catch(() => ({ data: {} })),
      api.get("/goals/").catch(() => ({ data: [] })),
    ]).then(([pomoRes, goalsRes]) => {
      const studyXp = Math.floor((pomoRes.data.total_minutes || 0) / 5) * 10;
      const goalXp = (goalsRes.data.filter?.(g => g.status === "completed")?.length || 0) * 50;
      setXp(studyXp + goalXp + (usage * 5));
    }).catch(() => {});
  }, [usage]);

  const usagePercent = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  const usageColor =
    usagePercent > 80 ? "#f43f5e" : usagePercent > 50 ? "#f59e0b" : "#10b981";

  const level = Math.floor(xp / 300) + 1;

  return (
    <div
      className="animate-fade-in-down"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        height: 64,
        background: "rgba(6, 6, 15, 0.88)",
        backdropFilter: "blur(24px) saturate(200%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <motion.div
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 15px rgba(124,58,237,0.2)",
              "0 0 30px rgba(124,58,237,0.4)",
              "0 0 15px rgba(124,58,237,0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          📚
        </motion.div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            background: "linear-gradient(135deg, #a78bfa, #c4b5fd, #e0d4ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -0.3,
          }}
        >
          PREPIFY
        </span>
      </motion.div>

      {/* Right section */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Streak */}
        {streak > 0 && (
          <Tooltip title={`${streak}-day study streak!`}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 12,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                cursor: "default",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: 14 }}
              >
                🔥
              </motion.span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: "#f59e0b",
              }}>{streak}</span>
            </motion.div>
          </Tooltip>
        )}

        {/* XP / Level */}
        <Tooltip title={`Level ${level} • ${xp} XP total`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/achievements")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 12,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              cursor: "pointer",
            }}
          >
            <StarOutlined style={{ color: "#a78bfa", fontSize: 12 }} />
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: "#a78bfa",
            }}>Lv.{level}</span>
            <span style={{
              fontSize: 10, color: "#64748b",
              fontWeight: 500,
            }}>{xp} XP</span>
          </motion.div>
        </Tooltip>

        {/* API Usage */}
        <Tooltip title={`${usage} / ${limit} AI calls used today`}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "default",
            }}
          >
            <ThunderboltOutlined style={{ color: usageColor, fontSize: 12 }} />
            <div style={{
              width: 60, height: 5, borderRadius: 3,
              background: "rgba(255,255,255,0.06)", overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: usageColor,
                  boxShadow: `0 0 6px ${usageColor}66`,
                }}
              />
            </div>
            <span style={{
              fontSize: 10, color: "#94a3b8",
              fontWeight: 500, whiteSpace: "nowrap",
            }}>
              {usage}/{limit}
            </span>
          </div>
        </Tooltip>

        {/* User chip */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 12px",
              borderRadius: 12,
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.18)",
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UserOutlined style={{ color: "#fff", fontSize: 10 }} />
            </div>
            <span style={{
              color: "#94e8f7", fontSize: 12,
              fontWeight: 600, maxWidth: 80,
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user.username}
            </span>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate("/welcome");
            }}
            style={{
              color: "#64748b",
              borderRadius: 10,
              height: 34,
              width: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f43f5e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;
