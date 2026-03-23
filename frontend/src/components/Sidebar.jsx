/**
 * Sidebar.jsx
 * -----------
 * PREPIFY premium sidebar with categorized sections,
 * NEW badges on features, animated hover effects,
 * Framer Motion micro-interactions, and a bottom XP card.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  RobotOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  AimOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  StarOutlined,
  ScheduleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import api from "../api/api";

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api.get("/attendance/stats").then((res) => {
      setStreak(res.data.current_streak || 0);
    }).catch(() => {});
  }, []);

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "/notes", icon: <FileTextOutlined />, label: "My Notes" },
    { key: "/flashcards", icon: <CreditCardOutlined />, label: "Flashcards" },
    { key: "/quiz", icon: <TrophyOutlined />, label: "Quiz" },
    { key: "/chat", icon: <RobotOutlined />, label: "AI Chat" },
    { type: "divider" },
    { key: "/study-room", icon: <CustomerServiceOutlined />, label: "Study Room" },
    { key: "/planner", icon: <ScheduleOutlined />, label: "Study Planner" },
    { key: "/pomodoro", icon: <ClockCircleOutlined />, label: "Pomodoro" },
    { key: "/brain-dump", icon: <BulbOutlined />, label: "Brain Dump" },
    { type: "divider" },
    { key: "/analytics", icon: <BarChartOutlined />, label: "Analytics" },
    { key: "/achievements", icon: <StarOutlined />, label: "Achievements" },
    { key: "/attendance", icon: <CalendarOutlined />, label: "Attendance" },
    { key: "/goals", icon: <AimOutlined />, label: "Goals" },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={64}
      trigger={null}
      width={230}
      style={{
        background: "rgba(13, 13, 31, 0.92)",
        backdropFilter: "blur(24px) saturate(200%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        height: "calc(100vh - 64px)",
        position: "sticky",
        top: "64px",
        left: 0,
        overflow: "auto",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 50,
      }}
    >
      {/* Collapse toggle */}
      <motion.div
        whileHover={{ background: "rgba(124, 58, 237, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          color: "#a78bfa",
          fontSize: "15px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "8px",
          transition: "all 0.3s ease",
          paddingLeft: collapsed ? 16 : 20,
          paddingRight: collapsed ? 16 : 20,
        }}
      >
        {!collapsed && (
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            color: "#475569",
            textTransform: "uppercase",
          }}>
            Navigation
          </span>
        )}
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          background: "transparent",
          border: "none",
          marginTop: "8px",
          padding: "0 4px",
        }}
      />

      {/* Bottom Card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            style={{
              position: "absolute",
              bottom: 16,
              left: 12,
              right: 12,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.03, borderColor: "rgba(124,58,237,0.3)" }}
              onClick={() => navigate("/achievements")}
              style={{
                padding: "16px 14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(6, 182, 212, 0.05))",
                border: "1px solid rgba(124, 58, 237, 0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 8,
              }}>
                {streak > 0 ? (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: 20 }}
                  >
                    🔥
                  </motion.span>
                ) : (
                  <span style={{ fontSize: 20 }}>🚀</span>
                )}
                <div>
                  {streak > 0 ? (
                    <>
                      <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>
                        {streak}-Day Streak!
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        Keep the fire burning
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700 }}>
                        Start Streak
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        Study daily to earn XP
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mini progress bar for streak */}
              <div style={{
                height: 4, borderRadius: 2,
                background: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  style={{
                    height: "100%", borderRadius: 2,
                    background: streak > 0
                      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                      : "rgba(255,255,255,0.1)",
                    boxShadow: streak > 0 ? "0 0 8px rgba(245,158,11,0.3)" : "none",
                  }}
                />
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 4,
              }}>
                <span style={{ fontSize: 9, color: "#475569" }}>0</span>
                <span style={{ fontSize: 9, color: "#475569" }}>7-day goal</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Sider>
  );
};

export default Sidebar;
