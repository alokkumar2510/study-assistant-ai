/**
 * AttendancePage.jsx
 * ------------------
 * Calendar-based attendance tracker with mark present/absent,
 * streak counter, monthly stats, and heatmap-style color coding.
 */

import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { motion } from "framer-motion";
import { Button, Tag, message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import api from "../api/api";
import "react-calendar/dist/Calendar.css";

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [recRes, statRes] = await Promise.all([
        api.get("/attendance/"),
        api.get("/attendance/stats"),
      ]);
      setRecords(recRes.data);
      setStats(statRes.data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAttendance = async (status) => {
    setLoading(true);
    try {
      await api.post("/attendance/mark", { status });
      message.success(`Marked as ${status}!`);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  // Build a lookup map for dates
  const dateMap = {};
  records.forEach((r) => {
    dateMap[r.date] = r.status;
  });

  const today = new Date().toISOString().split("T")[0];
  const todayStatus = dateMap[today];

  const tileClassName = ({ date }) => {
    const d = date.toISOString().split("T")[0];
    if (dateMap[d] === "present") return "attendance-present";
    if (dateMap[d] === "absent") return "attendance-absent";
    return "";
  };

  const statCards = [
    {
      icon: <FireOutlined />,
      label: "Current Streak",
      value: stats.current_streak || 0,
      suffix: "days",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      icon: <CheckCircleOutlined />,
      label: "Present Days",
      value: stats.present_days || 0,
      suffix: "days",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      icon: <CalendarOutlined />,
      label: "Total Days",
      value: stats.total_days || 0,
      suffix: "days",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.1)",
    },
    {
      icon: <TrophyOutlined />,
      label: "Attendance %",
      value: stats.percentage || 0,
      suffix: "%",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          📅 Attendance Tracker
        </motion.h1>
        <p>Track your daily attendance and maintain your study streak</p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ padding: 24, textAlign: "center" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                margin: "0 auto 12px",
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
              <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4, opacity: 0.7 }}>
                {s.suffix}
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 6, fontWeight: 500 }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
        className="attendance-grid"
      >
        {/* Calendar */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{ padding: 24 }}
        >
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={tileClassName}
            className="prepify-calendar"
          />
        </motion.div>

        {/* Mark today panel */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{ padding: 28, textAlign: "center" }}
        >
          <h3 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Today's Status
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {todayStatus ? (
            <Tag
              color={todayStatus === "present" ? "green" : "red"}
              style={{
                fontSize: 16,
                padding: "8px 24px",
                borderRadius: 12,
                fontWeight: 600,
              }}
            >
              {todayStatus === "present" ? "✅ Present" : "❌ Absent"}
            </Tag>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
              Not marked yet
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={loading}
              onClick={() => markAttendance("present")}
              style={{
                borderRadius: 12,
                height: 48,
                fontWeight: 600,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                border: "none",
              }}
            >
              Mark Present
            </Button>
            <Button
              size="large"
              icon={<CloseCircleOutlined />}
              loading={loading}
              onClick={() => markAttendance("absent")}
              style={{
                borderRadius: 12,
                height: 48,
                fontWeight: 600,
                background: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)",
              }}
            >
              Mark Absent
            </Button>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "rgba(16,185,129,0.6)",
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 12 }}>Present</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "rgba(244,63,94,0.6)",
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 12 }}>Absent</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .prepify-calendar {
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          font-family: 'Inter', sans-serif !important;
        }
        .prepify-calendar .react-calendar__tile {
          border-radius: 8px !important;
          color: #94a3b8 !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          padding: 12px 8px !important;
        }
        .prepify-calendar .react-calendar__tile:hover {
          background: rgba(124,58,237,0.15) !important;
          color: #fff !important;
        }
        .prepify-calendar .react-calendar__tile--active {
          background: rgba(124,58,237,0.3) !important;
          color: #fff !important;
        }
        .prepify-calendar .react-calendar__tile--now {
          background: rgba(124,58,237,0.1) !important;
          border: 1px solid rgba(124,58,237,0.3) !important;
          color: #a78bfa !important;
        }
        .prepify-calendar .react-calendar__navigation button {
          color: #f1f5f9 !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          border-radius: 8px !important;
        }
        .prepify-calendar .react-calendar__navigation button:hover {
          background: rgba(124,58,237,0.15) !important;
        }
        .prepify-calendar .react-calendar__month-view__weekdays__weekday {
          color: #64748b !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
        }
        .prepify-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
        }
        .attendance-present {
          background: rgba(16,185,129,0.25) !important;
          color: #34d399 !important;
        }
        .attendance-absent {
          background: rgba(244,63,94,0.2) !important;
          color: #fb7185 !important;
        }
        @media (max-width: 768px) {
          .attendance-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendancePage;
