/**
 * BrainDumpPage.jsx
 * ------------------
 * 📝 Quick Brain Dump Journal — freeform thought capture,
 * auto-tagging, mood tracking, and mental wellness features.
 *
 * Unique "clear your mind" space before studying.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Tag, Input, message, Empty } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  BulbOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const MOODS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#7c3aed" },
  { id: "stressed", emoji: "😰", label: "Stressed", color: "#f43f5e" },
  { id: "motivated", emoji: "🔥", label: "Motivated", color: "#f59e0b" },
  { id: "confused", emoji: "😕", label: "Confused", color: "#f97316" },
  { id: "calm", emoji: "😌", label: "Calm", color: "#10b981" },
  { id: "tired", emoji: "😴", label: "Tired", color: "#64748b" },
  { id: "excited", emoji: "🚀", label: "Excited", color: "#06b6d4" },
  { id: "anxious", emoji: "😟", label: "Anxious", color: "#ec4899" },
];

const AUTO_TAGS = {
  exam: ["exam", "test", "midterm", "final", "assessment", "quiz"],
  revision: ["revise", "revision", "review", "recap", "summary"],
  idea: ["idea", "thought", "concept", "maybe", "what if"],
  todo: ["todo", "need to", "must", "should", "have to", "reminder"],
  doubt: ["doubt", "confused", "don't understand", "unclear", "help"],
  important: ["important", "crucial", "critical", "essential", "remember"],
};

const TAG_COLORS = {
  exam: "#f43f5e",
  revision: "#7c3aed",
  idea: "#f59e0b",
  todo: "#06b6d4",
  doubt: "#f97316",
  important: "#ec4899",
};

const autoDetectTags = (text) => {
  const lower = text.toLowerCase();
  const detected = [];
  Object.entries(AUTO_TAGS).forEach(([tag, keywords]) => {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(tag);
    }
  });
  return detected;
};

const BrainDumpPage = () => {
  const [dumps, setDumps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("prepify_dumps") || "[]");
    } catch {
      return [];
    }
  });
  const [isWriting, setIsWriting] = useState(false);
  const [newText, setNewText] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState(null);

  // Persist
  useEffect(() => {
    localStorage.setItem("prepify_dumps", JSON.stringify(dumps));
  }, [dumps]);

  const saveDump = () => {
    if (!newText.trim()) {
      message.warning("Write something first!");
      return;
    }

    const tags = autoDetectTags(newText);
    const dump = {
      id: Date.now(),
      text: newText,
      mood: selectedMood,
      tags,
      createdAt: new Date().toISOString(),
    };

    setDumps((prev) => [dump, ...prev]);
    setNewText("");
    setSelectedMood(null);
    setIsWriting(false);
    message.success("🧠 Brain dump saved! Mind cleared.");
  };

  const deleteDump = (id) => {
    setDumps((prev) => prev.filter((d) => d.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Delete all brain dumps? This cannot be undone.")) {
      setDumps([]);
      message.success("All cleared! Fresh start.");
    }
  };

  // Filter
  const filteredDumps = dumps.filter((d) => {
    if (searchQuery && !d.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterTag && !d.tags.includes(filterTag)) {
      return false;
    }
    return true;
  });

  // Stats
  const moodCounts = {};
  dumps.forEach((d) => {
    if (d.mood) {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    }
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const allTags = [...new Set(dumps.flatMap((d) => d.tags))];

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          📝 Brain Dump
        </motion.h1>
        <p>Clear your mind before studying — capture thoughts, ideas, and worries instantly</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          {
            icon: "📝",
            label: "Total Dumps",
            value: dumps.length,
            color: "#7c3aed",
          },
          {
            icon: topMood ? MOODS.find((m) => m.id === topMood[0])?.emoji || "😊" : "😊",
            label: "Top Mood",
            value: topMood ? MOODS.find((m) => m.id === topMood[0])?.label || "—" : "—",
            color: topMood ? MOODS.find((m) => m.id === topMood[0])?.color || "#7c3aed" : "#7c3aed",
          },
          {
            icon: "🏷️",
            label: "Auto Tags",
            value: allTags.length,
            color: "#06b6d4",
          },
          {
            icon: "✨",
            label: "Today",
            value: dumps.filter((d) => new Date(d.createdAt).toDateString() === new Date().toDateString()).length,
            color: "#f59e0b",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              padding: "16px 20px",
              flex: "1 1 140px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Write New Dump */}
      <AnimatePresence>
        {!isWriting ? (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "20px 24px",
              marginBottom: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.04))",
            }}
            onClick={() => setIsWriting(true)}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(124,58,237,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a78bfa",
                fontSize: 18,
              }}
            >
              <PlusOutlined />
            </div>
            <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
              What's on your mind? Start typing to clear your head...
            </span>
          </motion.div>
        ) : (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ padding: 24, marginBottom: 24 }}
          >
            <TextArea
              placeholder="Just let it all out... worries, ideas, to-dos, random thoughts. No judgment here. 🧠"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={4}
              style={{
                borderRadius: 14,
                fontSize: 14,
                resize: "none",
                marginBottom: 16,
              }}
              autoFocus
            />

            {/* Auto-detected tags preview */}
            {newText.trim() && autoDetectTags(newText).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#64748b", marginRight: 8 }}>
                  Auto-detected:
                </span>
                {autoDetectTags(newText).map((tag) => (
                  <Tag
                    key={tag}
                    style={{
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      background: `${TAG_COLORS[tag] || "#7c3aed"}15`,
                      color: TAG_COLORS[tag] || "#7c3aed",
                      border: `1px solid ${TAG_COLORS[tag] || "#7c3aed"}25`,
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}

            {/* Mood selector */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8, display: "block" }}>
                How are you feeling?
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {MOODS.map((mood) => (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setSelectedMood(selectedMood === mood.id ? null : mood.id)
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      background:
                        selectedMood === mood.id
                          ? `${mood.color}20`
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedMood === mood.id
                          ? `${mood.color}40`
                          : "rgba(255,255,255,0.06)"
                      }`,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{mood.emoji}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: selectedMood === mood.id ? mood.color : "#64748b",
                      }}
                    >
                      {mood.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="primary"
                onClick={saveDump}
                icon={<ThunderboltOutlined />}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                Save & Clear Mind
              </Button>
              <Button
                onClick={() => {
                  setIsWriting(false);
                  setNewText("");
                  setSelectedMood(null);
                }}
                style={{
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      {dumps.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#475569" }} />}
            placeholder="Search dumps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 12, maxWidth: 280 }}
            allowClear
          />
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background:
                  filterTag === tag
                    ? `${TAG_COLORS[tag] || "#7c3aed"}20`
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  filterTag === tag
                    ? `${TAG_COLORS[tag] || "#7c3aed"}40`
                    : "rgba(255,255,255,0.06)"
                }`,
                color: filterTag === tag ? TAG_COLORS[tag] || "#7c3aed" : "#64748b",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            >
              {tag}
            </motion.button>
          ))}
          {dumps.length > 5 && (
            <Button
              type="text"
              size="small"
              onClick={clearAll}
              style={{ color: "#f43f5e", fontSize: 11, marginLeft: "auto" }}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Dumps List */}
      {filteredDumps.length === 0 && dumps.length === 0 ? (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: 60, textAlign: "center" }}
        >
          <div
            style={{
              fontSize: 56,
              marginBottom: 16,
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🧠
          </div>
          <h3 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Your Mind is Clear!
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Feeling overwhelmed? Dump your thoughts here before studying. It helps!
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsWriting(true)}
            className="neon-btn"
            size="large"
            style={{ marginTop: 16, borderRadius: 14 }}
          >
            Start Brain Dump
          </Button>
        </motion.div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <AnimatePresence>
            {filteredDumps.map((dump, i) => {
              const mood = MOODS.find((m) => m.id === dump.mood);
              return (
                <motion.div
                  key={dump.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: 20,
                    position: "relative",
                  }}
                >
                  {/* Mood + Time header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {mood && (
                        <span
                          style={{
                            fontSize: 16,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: `${mood.color}15`,
                          }}
                        >
                          {mood.emoji}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#475569" }}>
                        {formatTime(dump.createdAt)}
                      </span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => deleteDump(dump.id)}
                      style={{ color: "#475569", fontSize: 12 }}
                    />
                  </div>

                  {/* Content */}
                  <p
                    style={{
                      color: "#e2e8f0",
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: "0 0 12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {dump.text}
                  </p>

                  {/* Tags */}
                  {dump.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {dump.tags.map((tag) => (
                        <Tag
                          key={tag}
                          style={{
                            borderRadius: 6,
                            fontSize: 9,
                            fontWeight: 600,
                            background: `${TAG_COLORS[tag] || "#7c3aed"}12`,
                            color: TAG_COLORS[tag] || "#7c3aed",
                            border: `1px solid ${TAG_COLORS[tag] || "#7c3aed"}20`,
                            padding: "0 6px",
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BrainDumpPage;
