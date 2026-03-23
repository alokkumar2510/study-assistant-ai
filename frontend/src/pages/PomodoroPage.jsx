/**
 * PomodoroPage.jsx
 * -----------------
 * Animated pomodoro timer with circular SVG progress ring,
 * work/break/long-break modes, session log, and stats chart.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button, message } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/api";

const MODES = {
  work: { label: "Focus", minutes: 25, color: "#7c3aed" },
  break: { label: "Break", minutes: 5, color: "#10b981" },
  long_break: { label: "Long Break", minutes: 15, color: "#06b6d4" },
};

const PomodoroPage = () => {
  const [mode, setMode] = useState("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({});
  const intervalRef = useRef(null);

  const totalTime = MODES[mode].minutes * 60;
  const progress = (totalTime - timeLeft) / totalTime;
  const strokeDasharray = 2 * Math.PI * 120; // radius 120
  const strokeDashoffset = strokeDasharray * (1 - progress);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/pomodoro/stats");
      setStats(res.data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Save session
      if (mode === "work") {
        api
          .post("/pomodoro/session", {
            duration_minutes: MODES[mode].minutes,
            session_type: mode,
          })
          .then(() => {
            message.success("🎉 Session completed! Great work!");
            fetchStats();
          })
          .catch(() => {});
      } else {
        message.info("Break over! Time to focus 💪");
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, fetchStats]);

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Chart data from daily_breakdown
  const chartData = Object.entries(stats.daily_breakdown || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, mins]) => ({
      date: date.slice(5), // MM-DD
      minutes: mins,
    }));

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⏱️ Pomodoro Timer
        </motion.h1>
        <p>Stay focused with the Pomodoro technique — work in intervals, take breaks</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 24,
          alignItems: "start",
        }}
        className="pomodoro-grid"
      >
        {/* Timer card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 40,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              padding: 4,
            }}
          >
            {Object.entries(MODES).map(([key, m]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: mode === key ? "#fff" : "#64748b",
                  background:
                    mode === key
                      ? `linear-gradient(135deg, ${m.color}, ${m.color}cc)`
                      : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Circular timer */}
          <div style={{ position: "relative", width: 280, height: 280, marginBottom: 32 }}>
            <svg width="280" height="280" style={{ transform: "rotate(-90deg)" }}>
              {/* Background ring */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke={MODES[mode].color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  filter: `drop-shadow(0 0 12px ${MODES[mode].color}66)`,
                }}
              />
            </svg>
            {/* Time display */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 2,
                }}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                {MODES[mode].label} Session
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 16 }}>
            <Button
              type="primary"
              size="large"
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsRunning(!isRunning)}
              style={{
                borderRadius: 14,
                height: 52,
                width: 140,
                fontWeight: 700,
                fontSize: 15,
                background: `linear-gradient(135deg, ${MODES[mode].color}, ${MODES[mode].color}cc)`,
                border: "none",
                boxShadow: `0 0 20px ${MODES[mode].color}33`,
              }}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={reset}
              style={{
                borderRadius: 14,
                height: 52,
                width: 52,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            />
          </div>
        </motion.div>

        {/* Stats panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick stats */}
          {[
            {
              icon: <ClockCircleOutlined />,
              label: "Today",
              value: `${stats.today_minutes || 0} min`,
              color: "#7c3aed",
            },
            {
              icon: <FireOutlined />,
              label: "This Week",
              value: `${stats.week_minutes || 0} min`,
              color: "#f59e0b",
            },
            {
              icon: <PlayCircleOutlined />,
              label: "Total Sessions",
              value: stats.total_sessions || 0,
              color: "#10b981",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${s.color}1a`,
                  color: s.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}

          {/* Weekly chart */}
          {chartData.length > 0 && (
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ padding: 20 }}
            >
              <h4 style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                Weekly Study Minutes
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(13,13,31,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#f1f5f9",
                    }}
                  />
                  <Bar dataKey="minutes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pomodoro-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default PomodoroPage;
