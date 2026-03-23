/**
 * AchievementsPage.jsx
 * ---------------------
 * 🏆 Gamified achievements & badges system with progress tracking,
 * unlock animations, level progression, and trophy showcase.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Col, Spin, Progress, Tag } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import api from "../api/api";
import { getNotes, getFlashcards, getQuizHistory } from "../api/api";

/* ── Badge Definitions ── */
const BADGES = [
  // Streak badges
  {
    id: "streak_3",
    category: "streak",
    title: "Getting Started",
    icon: "🔥",
    desc: "3-day study streak",
    requirement: (d) => (d.streak || 0) >= 3,
    progress: (d) => Math.min(((d.streak || 0) / 3) * 100, 100),
    progressText: (d) => `${Math.min(d.streak || 0, 3)}/3 days`,
    color: "#f59e0b",
    tier: "bronze",
  },
  {
    id: "streak_7",
    category: "streak",
    title: "Consistency King",
    icon: "👑",
    desc: "7-day study streak",
    requirement: (d) => (d.streak || 0) >= 7,
    progress: (d) => Math.min(((d.streak || 0) / 7) * 100, 100),
    progressText: (d) => `${Math.min(d.streak || 0, 7)}/7 days`,
    color: "#f59e0b",
    tier: "silver",
  },
  {
    id: "streak_30",
    category: "streak",
    title: "Unstoppable",
    icon: "💎",
    desc: "30-day study streak",
    requirement: (d) => (d.streak || 0) >= 30,
    progress: (d) => Math.min(((d.streak || 0) / 30) * 100, 100),
    progressText: (d) => `${Math.min(d.streak || 0, 30)}/30 days`,
    color: "#06b6d4",
    tier: "gold",
  },

  // Notes badges
  {
    id: "notes_5",
    category: "notes",
    title: "Note Taker",
    icon: "📝",
    desc: "Create 5 study notes",
    requirement: (d) => (d.notes || 0) >= 5,
    progress: (d) => Math.min(((d.notes || 0) / 5) * 100, 100),
    progressText: (d) => `${Math.min(d.notes || 0, 5)}/5 notes`,
    color: "#7c3aed",
    tier: "bronze",
  },
  {
    id: "notes_25",
    category: "notes",
    title: "Knowledge Architect",
    icon: "🏗️",
    desc: "Create 25 study notes",
    requirement: (d) => (d.notes || 0) >= 25,
    progress: (d) => Math.min(((d.notes || 0) / 25) * 100, 100),
    progressText: (d) => `${Math.min(d.notes || 0, 25)}/25 notes`,
    color: "#7c3aed",
    tier: "silver",
  },
  {
    id: "notes_100",
    category: "notes",
    title: "Encyclopedia",
    icon: "📚",
    desc: "Create 100 study notes",
    requirement: (d) => (d.notes || 0) >= 100,
    progress: (d) => Math.min(((d.notes || 0) / 100) * 100, 100),
    progressText: (d) => `${Math.min(d.notes || 0, 100)}/100 notes`,
    color: "#7c3aed",
    tier: "gold",
  },

  // Quiz badges
  {
    id: "quiz_3",
    category: "quiz",
    title: "Quiz Starter",
    icon: "🎯",
    desc: "Complete 3 quizzes",
    requirement: (d) => (d.quizzes || 0) >= 3,
    progress: (d) => Math.min(((d.quizzes || 0) / 3) * 100, 100),
    progressText: (d) => `${Math.min(d.quizzes || 0, 3)}/3 quizzes`,
    color: "#10b981",
    tier: "bronze",
  },
  {
    id: "quiz_15",
    category: "quiz",
    title: "Quiz Master",
    icon: "🏆",
    desc: "Complete 15 quizzes",
    requirement: (d) => (d.quizzes || 0) >= 15,
    progress: (d) => Math.min(((d.quizzes || 0) / 15) * 100, 100),
    progressText: (d) => `${Math.min(d.quizzes || 0, 15)}/15 quizzes`,
    color: "#10b981",
    tier: "silver",
  },

  // Flashcard badges
  {
    id: "flash_10",
    category: "flashcards",
    title: "Card Collector",
    icon: "🃏",
    desc: "Create 10 flashcards",
    requirement: (d) => (d.flashcards || 0) >= 10,
    progress: (d) => Math.min(((d.flashcards || 0) / 10) * 100, 100),
    progressText: (d) => `${Math.min(d.flashcards || 0, 10)}/10 cards`,
    color: "#ec4899",
    tier: "bronze",
  },
  {
    id: "flash_50",
    category: "flashcards",
    title: "Memory Master",
    icon: "🧠",
    desc: "Create 50 flashcards",
    requirement: (d) => (d.flashcards || 0) >= 50,
    progress: (d) => Math.min(((d.flashcards || 0) / 50) * 100, 100),
    progressText: (d) => `${Math.min(d.flashcards || 0, 50)}/50 cards`,
    color: "#ec4899",
    tier: "silver",
  },

  // Study time badges
  {
    id: "time_60",
    category: "time",
    title: "First Hour",
    icon: "⏱️",
    desc: "Study for 60 minutes total",
    requirement: (d) => (d.studyMinutes || 0) >= 60,
    progress: (d) => Math.min(((d.studyMinutes || 0) / 60) * 100, 100),
    progressText: (d) => `${Math.min(d.studyMinutes || 0, 60)}/60 min`,
    color: "#f97316",
    tier: "bronze",
  },
  {
    id: "time_300",
    category: "time",
    title: "Deep Worker",
    icon: "⚡",
    desc: "Study for 5 hours total",
    requirement: (d) => (d.studyMinutes || 0) >= 300,
    progress: (d) => Math.min(((d.studyMinutes || 0) / 300) * 100, 100),
    progressText: (d) => `${Math.min(Math.floor((d.studyMinutes || 0) / 60), 5)}/5 hours`,
    color: "#f97316",
    tier: "silver",
  },
  {
    id: "time_1200",
    category: "time",
    title: "Study Legend",
    icon: "🌟",
    desc: "Study for 20 hours total",
    requirement: (d) => (d.studyMinutes || 0) >= 1200,
    progress: (d) => Math.min(((d.studyMinutes || 0) / 1200) * 100, 100),
    progressText: (d) => `${Math.min(Math.floor((d.studyMinutes || 0) / 60), 20)}/20 hours`,
    color: "#f97316",
    tier: "gold",
  },

  // Goals badges
  {
    id: "goals_3",
    category: "goals",
    title: "Goal Getter",
    icon: "🎖️",
    desc: "Complete 3 study goals",
    requirement: (d) => (d.goalsCompleted || 0) >= 3,
    progress: (d) => Math.min(((d.goalsCompleted || 0) / 3) * 100, 100),
    progressText: (d) => `${Math.min(d.goalsCompleted || 0, 3)}/3 goals`,
    color: "#8b5cf6",
    tier: "bronze",
  },
  {
    id: "goals_10",
    category: "goals",
    title: "Overachiever",
    icon: "🚀",
    desc: "Complete 10 study goals",
    requirement: (d) => (d.goalsCompleted || 0) >= 10,
    progress: (d) => Math.min(((d.goalsCompleted || 0) / 10) * 100, 100),
    progressText: (d) => `${Math.min(d.goalsCompleted || 0, 10)}/10 goals`,
    color: "#8b5cf6",
    tier: "silver",
  },
];

const TIER_COLORS = {
  bronze: { bg: "rgba(205, 127, 50, 0.15)", border: "rgba(205, 127, 50, 0.3)", text: "#cd7f32" },
  silver: { bg: "rgba(192, 192, 192, 0.15)", border: "rgba(192, 192, 192, 0.3)", text: "#c0c0c0" },
  gold: { bg: "rgba(255, 215, 0, 0.15)", border: "rgba(255, 215, 0, 0.3)", text: "#ffd700" },
};

const AchievementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [notesRes, cardsRes, quizRes, attRes, pomoRes, goalsRes] =
        await Promise.all([
          getNotes().catch(() => ({ data: [] })),
          getFlashcards().catch(() => ({ data: [] })),
          getQuizHistory().catch(() => ({ data: [] })),
          api.get("/attendance/stats").catch(() => ({ data: {} })),
          api.get("/pomodoro/stats").catch(() => ({ data: {} })),
          api.get("/goals/").catch(() => ({ data: [] })),
        ]);

      setData({
        notes: notesRes.data.length,
        flashcards: cardsRes.data.length,
        quizzes: quizRes.data.length,
        streak: attRes.data.current_streak || 0,
        studyMinutes: pomoRes.data.total_minutes || 0,
        goalsCompleted: goalsRes.data.filter((g) => g.status === "completed").length,
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unlockedBadges = BADGES.filter((b) => b.requirement(data));
  const lockedBadges = BADGES.filter((b) => !b.requirement(data));
  const totalXP = unlockedBadges.length * 100;
  const level = Math.floor(totalXP / 300) + 1;
  const levelProgress = (totalXP % 300) / 3;

  const LEVEL_NAMES = ["Beginner", "Learner", "Scholar", "Expert", "Master", "Legend", "Sage"];
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

  const CATEGORIES = [
    { key: "all", label: "All", icon: "🏆" },
    { key: "streak", label: "Streak", icon: "🔥" },
    { key: "notes", label: "Notes", icon: "📝" },
    { key: "quiz", label: "Quiz", icon: "🎯" },
    { key: "flashcards", label: "Cards", icon: "🃏" },
    { key: "time", label: "Time", icon: "⏱️" },
    { key: "goals", label: "Goals", icon: "🎖️" },
  ];

  const filteredBadges =
    filter === "all"
      ? BADGES
      : BADGES.filter((b) => b.category === filter);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          🏆 Achievements & Badges
        </motion.h1>
        <p>Earn badges by completing milestones — unlock new levels and track your mastery!</p>
      </div>

      {/* Level Card */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: 36,
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)",
        }}
      >
        {/* Decorative */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(124,58,237,0.1)",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Level badge */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{level}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>LEVEL</span>
          </motion.div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 800, margin: 0 }}>
                {levelName}
              </h2>
              <Tag
                style={{
                  borderRadius: 8,
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {totalXP} XP
              </Tag>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
              {unlockedBadges.length} / {BADGES.length} badges unlocked
            </p>

            {/* Level progress bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Level {level} → Level {level + 1}
                </span>
                <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>
                  {Math.round(levelProgress)}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #7c3aed, #a78bfa, #06b6d4)",
                    boxShadow: "0 0 10px rgba(124,58,237,0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(cat.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background:
                filter === cat.key
                  ? "rgba(124,58,237,0.2)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                filter === cat.key
                  ? "rgba(124,58,237,0.4)"
                  : "rgba(255,255,255,0.06)"
              }`,
              color: filter === cat.key ? "#a78bfa" : "#94a3b8",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Badges Grid */}
      <Row gutter={[16, 16]}>
        {filteredBadges.map((badge, i) => {
          const unlocked = badge.requirement(data);
          const prog = badge.progress(data);
          const tier = TIER_COLORS[badge.tier];

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={badge.id}>
              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  padding: 24,
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  opacity: unlocked ? 1 : 0.6,
                }}
                onClick={() => setSelectedBadge(badge)}
              >
                {/* Tier indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: tier.bg,
                    border: `1px solid ${tier.border}`,
                    fontSize: 9,
                    fontWeight: 700,
                    color: tier.text,
                    textTransform: "uppercase",
                  }}
                >
                  {badge.tier}
                </div>

                {/* Badge icon */}
                <motion.div
                  animate={unlocked ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontSize: 42,
                    marginBottom: 12,
                    filter: unlocked ? "none" : "grayscale(100%)",
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  {badge.icon}
                </motion.div>

                <h4
                  style={{
                    color: unlocked ? "#f1f5f9" : "#475569",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {badge.title}
                </h4>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 11,
                    margin: "0 0 12px",
                  }}
                >
                  {badge.desc}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.05)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(prog, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: unlocked
                          ? `linear-gradient(90deg, ${badge.color}, ${badge.color}aa)`
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: unlocked ? badge.color : "#475569",
                    fontWeight: 600,
                  }}
                >
                  {unlocked ? "✅ Unlocked!" : badge.progressText(data)}
                </span>
              </motion.div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AchievementsPage;
