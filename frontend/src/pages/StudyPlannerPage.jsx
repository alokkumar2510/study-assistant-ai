/**
 * StudyPlannerPage.jsx
 * ---------------------
 * 📅 Smart Study Planner with AI-generated weekly schedules,
 * daily micro-tasks, subject time allocation, and exam countdown.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Select, DatePicker, message, Tag, Modal, Empty } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  RocketOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECTS = ["Math", "Science", "CS", "English", "History", "Physics", "Chemistry", "Biology", "General"];
const SUBJECT_COLORS = {
  Math: "#f59e0b",
  Science: "#10b981",
  CS: "#06b6d4",
  English: "#ec4899",
  History: "#f97316",
  Physics: "#8b5cf6",
  Chemistry: "#ef4444",
  Biology: "#22c55e",
  General: "#7c3aed",
};

const TASK_TEMPLATES = [
  "Read Chapter {n}",
  "Solve {n} practice problems",
  "Watch lecture video",
  "Review notes on {topic}",
  "Complete assignment",
  "Practice flashcards",
  "Take practice quiz",
  "Summarize key concepts",
  "Do revision exercise",
  "Prepare for lab",
];

const StudyPlannerPage = () => {
  const [exams, setExams] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("prepify_exams") || "[]");
    } catch { return []; }
  });
  const [weekPlan, setWeekPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("prepify_weekplan") || "{}");
    } catch { return {}; }
  });
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [examForm, setExamForm] = useState({ name: "", subject: "Math", date: "" });
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState("");

  // Persist
  useEffect(() => {
    localStorage.setItem("prepify_exams", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("prepify_weekplan", JSON.stringify(weekPlan));
  }, [weekPlan]);

  const addExam = () => {
    if (!examForm.name.trim() || !examForm.date) {
      message.warning("Please fill in all exam details");
      return;
    }
    const newExam = {
      id: Date.now(),
      ...examForm,
      color: SUBJECT_COLORS[examForm.subject] || "#7c3aed",
    };
    setExams((prev) => [...prev, newExam]);
    setAddExamOpen(false);
    setExamForm({ name: "", subject: "Math", date: "" });
    message.success("📅 Exam added!");
  };

  const removeExam = (id) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const generateAIPlan = () => {
    // Generate a smart study plan based on exams
    const plan = {};
    DAYS_OF_WEEK.forEach((day, di) => {
      const tasks = [];
      exams.forEach((exam, ei) => {
        const daysUntilExam = Math.max(
          Math.ceil(
            (new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)
          ),
          1
        );
        // Distribute tasks
        if (di % Math.max(Math.floor(7 / Math.min(daysUntilExam, 7)), 1) === ei % 3) {
          const template =
            TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)]
              .replace("{n}", Math.floor(Math.random() * 5 + 1))
              .replace("{topic}", exam.name);

          tasks.push({
            id: Date.now() + Math.random(),
            text: `${exam.subject}: ${template}`,
            subject: exam.subject,
            completed: false,
            duration: Math.floor(Math.random() * 30 + 20),
          });
        }
      });

      // Add at least 1-2 general tasks per day
      if (tasks.length === 0) {
        tasks.push({
          id: Date.now() + Math.random(),
          text: "Review all subjects - 30 min recap",
          subject: "General",
          completed: false,
          duration: 30,
        });
      }
      plan[day] = tasks;
    });

    setWeekPlan(plan);
    message.success("🤖 AI study plan generated!");
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: [
        ...(prev[selectedDay] || []),
        {
          id: Date.now(),
          text: newTask,
          subject: "General",
          completed: false,
          duration: 30,
        },
      ],
    }));
    setNewTask("");
    setAddingTask(false);
  };

  const toggleTask = (day, taskId) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const removeTask = (day, taskId) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((t) => t.id !== taskId),
    }));
  };

  const dayTasks = weekPlan[selectedDay] || [];
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const totalMinutes = dayTasks.reduce((a, t) => a + (t.duration || 0), 0);

  // Exam countdown
  const upcomingExams = exams
    .map((e) => ({
      ...e,
      daysLeft: Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24)),
    }))
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          📅 Smart Study Planner
        </motion.h1>
        <p>AI-powered weekly study schedule tailored to your exams and goals</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
        className="planner-grid"
      >
        {/* Main Planner */}
        <div>
          {/* AI Generate Bar */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "16px 24px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              background: "linear-gradient(135deg, rgba(124,58,237,0.1),rgba(6,182,212,0.05))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BulbOutlined style={{ color: "#f59e0b", fontSize: 20 }} />
              <div>
                <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>
                  AI Study Plan Generator
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>
                  Auto-create tasks based on your exams
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={generateAIPlan}
              disabled={exams.length === 0}
              style={{
                borderRadius: 12,
                fontWeight: 600,
                background: exams.length === 0
                  ? undefined
                  : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                border: "none",
              }}
            >
              Generate Plan
            </Button>
          </motion.div>

          {/* Day Selector */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 20,
              overflowX: "auto",
              padding: "4px 0",
            }}
          >
            {DAYS_OF_WEEK.map((day, i) => {
              const tasks = weekPlan[day] || [];
              const completed = tasks.filter((t) => t.completed).length;
              const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    background:
                      selectedDay === day
                        ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      selectedDay === day
                        ? "rgba(124,58,237,0.5)"
                        : isToday
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(255,255,255,0.06)"
                    }`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    minWidth: 72,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selectedDay === day ? "#a78bfa" : "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    {day.slice(0, 3)}
                  </div>
                  {tasks.length > 0 && (
                    <div
                      style={{
                        fontSize: 9,
                        color: completed === tasks.length ? "#10b981" : "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {completed}/{tasks.length}
                    </div>
                  )}
                  {isToday && (
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#10b981",
                        margin: "4px auto 0",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Day header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, margin: 0 }}>
                {selectedDay}
              </h2>
              <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
                {dayTasks.length} tasks • ~{totalMinutes} min •{" "}
                {completedCount}/{dayTasks.length} done
              </p>
            </div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setAddingTask(true)}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              Add Task
            </Button>
          </div>

          {/* Add task input */}
          <AnimatePresence>
            {addingTask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    placeholder="e.g., Review Chapter 3 - Data Structures"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onPressEnter={addTask}
                    style={{ borderRadius: 12 }}
                    autoFocus
                  />
                  <Button
                    type="primary"
                    onClick={addTask}
                    style={{ borderRadius: 12 }}
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => setAddingTask(false)}
                    style={{
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tasks List */}
          {dayTasks.length === 0 ? (
            <motion.div
              className="glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: 48, textAlign: "center" }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#64748b", marginBottom: 16 }}>
                No tasks for {selectedDay}. Add exams and generate an AI plan!
              </p>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <AnimatePresence>
                {dayTasks.map((task, i) => {
                  const color = SUBJECT_COLORS[task.subject] || "#7c3aed";
                  return (
                    <motion.div
                      key={task.id}
                      className="glass-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                      onClick={() => toggleTask(selectedDay, task.id)}
                    >
                      {/* Checkbox */}
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          border: `2px solid ${task.completed ? color : "rgba(255,255,255,0.15)"}`,
                          background: task.completed ? `${color}30` : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {task.completed && (
                          <CheckCircleOutlined
                            style={{ fontSize: 14, color }}
                          />
                        )}
                      </motion.div>

                      {/* Task text */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: task.completed ? "#475569" : "#f1f5f9",
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: task.completed ? "line-through" : "none",
                          }}
                        >
                          {task.text}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 4,
                          }}
                        >
                          <Tag
                            style={{
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 500,
                              background: `${color}15`,
                              color,
                              border: `1px solid ${color}25`,
                              padding: "0 6px",
                            }}
                          >
                            {task.subject}
                          </Tag>
                          <span style={{ fontSize: 10, color: "#475569" }}>
                            <ClockCircleOutlined /> {task.duration} min
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTask(selectedDay, task.id);
                        }}
                        style={{ color: "#475569" }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Progress for the day */}
          {dayTasks.length > 0 && (
            <motion.div
              className="glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: 20, marginTop: 16, textAlign: "center" }}
            >
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <motion.div
                  animate={{
                    width: `${dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    background:
                      completedCount === dayTasks.length
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : "linear-gradient(90deg, #7c3aed, #a78bfa)",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {completedCount === dayTasks.length && dayTasks.length > 0
                  ? "🎉 All tasks completed!"
                  : `${completedCount} of ${dayTasks.length} tasks done`}
              </span>
            </motion.div>
          )}
        </div>

        {/* Right Panel — Exams & Countdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Exam Countdown */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  color: "#f1f5f9",
                  fontSize: 15,
                  fontWeight: 700,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CalendarOutlined style={{ color: "#f43f5e" }} />
                Exam Countdown
              </h3>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setAddExamOpen(true)}
                style={{ color: "#a78bfa" }}
              />
            </div>

            {upcomingExams.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#475569" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                <p style={{ fontSize: 12 }}>No upcoming exams. Add one!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingExams.map((exam) => (
                  <motion.div
                    key={exam.id}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: `${exam.color}0a`,
                      border: `1px solid ${exam.color}20`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#f1f5f9",
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {exam.name}
                        </div>
                        <Tag
                          style={{
                            borderRadius: 6,
                            fontSize: 10,
                            background: `${exam.color}15`,
                            color: exam.color,
                            border: `1px solid ${exam.color}25`,
                          }}
                        >
                          {exam.subject}
                        </Tag>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: exam.daysLeft <= 3 ? "#f43f5e" : exam.daysLeft <= 7 ? "#f59e0b" : "#10b981",
                          }}
                        >
                          {exam.daysLeft}
                        </div>
                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 500 }}>
                          DAYS LEFT
                        </div>
                      </div>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeExam(exam.id)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        color: "#475569",
                        fontSize: 10,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tips */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ padding: 20 }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>🧠</div>
              <h4 style={{ color: "#10b981", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Spaced Repetition
              </h4>
              <p style={{ color: "#94a3b8", fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                Review material at increasing intervals (1 day, 3 days, 7 days).
                This technique boosts long-term retention by up to 150%!
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Exam Modal */}
      <Modal
        title="📚 Add Upcoming Exam"
        open={addExamOpen}
        onOk={addExam}
        onCancel={() => setAddExamOpen(false)}
        okText="Add Exam"
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
              Exam Name
            </label>
            <Input
              placeholder="e.g., Data Structures Mid-Term"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              style={{ borderRadius: 10 }}
            />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              Subject
            </label>
            <Select
              value={examForm.subject}
              onChange={(val) => setExamForm({ ...examForm, subject: val })}
              style={{ width: "100%" }}
              options={SUBJECTS.map((s) => ({ label: s, value: s }))}
            />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              Exam Date
            </label>
            <Input
              type="date"
              value={examForm.date}
              onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              style={{ borderRadius: 10 }}
            />
          </div>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .planner-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default StudyPlannerPage;
