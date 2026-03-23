/**
 * GoalsPage.jsx
 * -------------
 * Study goals management with add/edit/delete,
 * progress sliders, filters, and animated progress bars.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Select, Slider, Tag, Modal, message, Empty } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  AimOutlined,
  TrophyOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "../api/api";

const SUBJECTS = ["General", "Math", "Science", "English", "History", "CS", "Physics", "Chemistry", "Biology"];
const SUBJECT_COLORS = {
  General: "#7c3aed",
  Math: "#f59e0b",
  Science: "#10b981",
  English: "#ec4899",
  History: "#f97316",
  CS: "#06b6d4",
  Physics: "#8b5cf6",
  Chemistry: "#ef4444",
  Biology: "#22c55e",
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ title: "", subject: "General", target: 100 });

  const fetchGoals = useCallback(async () => {
    try {
      const res = await api.get("/goals/");
      setGoals(res.data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      message.error("Please enter a goal title");
      return;
    }
    try {
      if (editGoal) {
        await api.put(`/goals/${editGoal.id}`, form);
        message.success("Goal updated!");
      } else {
        await api.post("/goals/", form);
        message.success("Goal created! 🎯");
      }
      setModalOpen(false);
      setEditGoal(null);
      setForm({ title: "", subject: "General", target: 100 });
      fetchGoals();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to save goal");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      message.success("Goal deleted");
      fetchGoals();
    } catch {
      message.error("Failed to delete goal");
    }
  };

  const handleProgressChange = async (id, progress) => {
    try {
      await api.put(`/goals/${id}`, { progress });
      fetchGoals();
    } catch {
      // Silently fail
    }
  };

  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({ title: goal.title, subject: goal.subject, target: goal.target });
    setModalOpen(true);
  };

  const openNew = () => {
    setEditGoal(null);
    setForm({ title: "", subject: "General", target: 100 });
    setModalOpen(true);
  };

  const filteredGoals =
    filter === "all"
      ? goals
      : goals.filter((g) => g.status === filter);

  const completedCount = goals.filter((g) => g.status === "completed").length;
  const activeCount = goals.filter((g) => g.status === "active").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎯 Study Goals
        </motion.h1>
        <p>Set your study targets and track progress towards achieving them</p>
      </div>

      {/* Stats summary */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: <AimOutlined />, label: "Active", value: activeCount, color: "#7c3aed" },
          { icon: <TrophyOutlined />, label: "Completed", value: completedCount, color: "#10b981" },
          { icon: <CheckCircleOutlined />, label: "Total", value: goals.length, color: "#06b6d4" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: "1 1 140px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${s.color}1a`,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((f) => (
            <Button
              key={f.key}
              type={filter === f.key ? "primary" : "default"}
              icon={<FilterOutlined />}
              onClick={() => setFilter(f.key)}
              size="small"
              style={{
                borderRadius: 10,
                fontWeight: 500,
                ...(filter !== f.key && {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }),
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openNew}
          style={{ borderRadius: 12, fontWeight: 600 }}
        >
          New Goal
        </Button>
      </div>

      {/* Goals list */}
      {filteredGoals.length === 0 ? (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: 48 }}
        >
          <Empty
            description={
              <span style={{ color: "#64748b" }}>
                {filter === "all"
                  ? "No goals yet. Create one to start tracking!"
                  : `No ${filter} goals`}
              </span>
            }
          />
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence>
            {filteredGoals.map((goal, i) => {
              const pct = goal.target > 0 ? Math.round((goal.progress / goal.target) * 100) : 0;
              const color = SUBJECT_COLORS[goal.subject] || "#7c3aed";

              return (
                <motion.div
                  key={goal.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: 24 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <h3
                          style={{
                            color: goal.status === "completed" ? "#64748b" : "#f1f5f9",
                            fontSize: 16,
                            fontWeight: 600,
                            margin: 0,
                            textDecoration:
                              goal.status === "completed" ? "line-through" : "none",
                          }}
                        >
                          {goal.title}
                        </h3>
                        <Tag
                          style={{
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 11,
                            background: `${color}1a`,
                            color: color,
                            border: `1px solid ${color}33`,
                          }}
                        >
                          {goal.subject}
                        </Tag>
                        {goal.status === "completed" && (
                          <Tag color="green" style={{ borderRadius: 8 }}>
                            ✅ Done
                          </Tag>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(goal)}
                        style={{ color: "#94a3b8" }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(goal.id)}
                        style={{ color: "#f43f5e" }}
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                        Progress
                      </span>
                      <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>
                        {goal.progress} / {goal.target} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.05)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                          boxShadow: `0 0 10px ${color}33`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Progress slider */}
                  {goal.status === "active" && (
                    <Slider
                      min={0}
                      max={goal.target}
                      value={goal.progress}
                      onChange={(val) => handleProgressChange(goal.id, val)}
                      styles={{
                        track: { background: color },
                        rail: { background: "rgba(255,255,255,0.06)" },
                      }}
                      tooltip={{
                        formatter: (val) => `${val} / ${goal.target}`,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editGoal ? "Edit Goal" : "Create New Goal"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          setEditGoal(null);
        }}
        okText={editGoal ? "Update" : "Create"}
        okButtonProps={{ style: { borderRadius: 10 } }}
        cancelButtonProps={{
          style: {
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              Goal Title
            </label>
            <Input
              placeholder="e.g., Complete Chapter 5 exercises"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ borderRadius: 10 }}
            />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              Subject
            </label>
            <Select
              value={form.subject}
              onChange={(val) => setForm({ ...form, subject: val })}
              style={{ width: "100%", borderRadius: 10 }}
              options={SUBJECTS.map((s) => ({ label: s, value: s }))}
            />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              Target (total units)
            </label>
            <Input
              type="number"
              min={1}
              placeholder="100"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 100 })}
              style={{ borderRadius: 10 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
