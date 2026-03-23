/**
 * Dashboard.jsx
 * -------------
 * PREPIFY premium dashboard with greeting, animated stat counters,
 * attendance streak, goals progress, pomodoro stats, quick actions,
 * and recent notes.
 */

import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FileTextOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  RobotOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  AimOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  StarOutlined,
  ScheduleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { getNotes, getFlashcards, getQuizHistory } from "../api/api";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

/* Animated counter that counts up from 0 */
const AnimatedCounter = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 1200;
    const step = (timestamp) => {
      if (!ref.current) ref.current = timestamp;
      const progress = Math.min((timestamp - ref.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { ref.current = null; };
  }, [value]);

  return <span>{display}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, usage, limit } = useAuth();
  const [stats, setStats] = useState({ notes: 0, flashcards: 0, quizzes: 0 });
  const [attendanceStats, setAttendanceStats] = useState({});
  const [pomodoroStats, setPomodoroStats] = useState({});
  const [goalsData, setGoalsData] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [notesRes, cardsRes, quizzesRes, attRes, pomoRes, goalsRes] =
          await Promise.all([
            getNotes().catch(() => ({ data: [] })),
            getFlashcards().catch(() => ({ data: [] })),
            getQuizHistory().catch(() => ({ data: [] })),
            api.get("/attendance/stats").catch(() => ({ data: {} })),
            api.get("/pomodoro/stats").catch(() => ({ data: {} })),
            api.get("/goals/").catch(() => ({ data: [] })),
          ]);
        setStats({
          notes: notesRes.data.length,
          flashcards: cardsRes.data.length,
          quizzes: quizzesRes.data.length,
        });
        setAttendanceStats(attRes.data);
        setPomodoroStats(pomoRes.data);
        setGoalsData(goalsRes.data);
        setRecentNotes(notesRes.data.slice(-3).reverse());
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const completedGoals = goalsData.filter((g) => g.status === "completed").length;
  const activeGoals = goalsData.filter((g) => g.status === "active").length;

  const statCards = [
    {
      label: "Streak",
      value: attendanceStats.current_streak || 0,
      icon: <FireOutlined />,
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))",
      iconBg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      glow: "rgba(245, 158, 11, 0.15)",
    },
    {
      label: "Notes",
      value: stats.notes,
      icon: <FileTextOutlined />,
      gradient: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.05))",
      iconBg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      glow: "rgba(124, 58, 237, 0.15)",
    },
    {
      label: "Flashcards",
      value: stats.flashcards,
      icon: <CreditCardOutlined />,
      gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))",
      iconBg: "linear-gradient(135deg, #06b6d4, #22d3ee)",
      glow: "rgba(6, 182, 212, 0.15)",
    },
    {
      label: "Quizzes",
      value: stats.quizzes,
      icon: <TrophyOutlined />,
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))",
      iconBg: "linear-gradient(135deg, #10b981, #34d399)",
      glow: "rgba(16, 185, 129, 0.15)",
    },
    {
      label: "Study Min",
      value: pomodoroStats.total_minutes || 0,
      icon: <ClockCircleOutlined />,
      gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))",
      iconBg: "linear-gradient(135deg, #ec4899, #f472b6)",
      glow: "rgba(236, 72, 153, 0.15)",
    },
    {
      label: "Goals Done",
      value: completedGoals,
      icon: <CheckCircleOutlined />,
      gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))",
      iconBg: "linear-gradient(135deg, #f97316, #fb923c)",
      glow: "rgba(249, 115, 22, 0.15)",
    },
  ];

  const quickActions = [
    {
      title: "Create Note",
      desc: "Write study materials",
      icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      onClick: () => navigate("/notes"),
    },
    {
      title: "Flashcards",
      desc: "Review with flip cards",
      icon: <CreditCardOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
      onClick: () => navigate("/flashcards"),
    },
    {
      title: "Take Quiz",
      desc: "Test your knowledge",
      icon: <TrophyOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      onClick: () => navigate("/quiz"),
    },
    {
      title: "Ask AI",
      desc: "Get instant help",
      icon: <RobotOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
      onClick: () => navigate("/chat"),
    },
    {
      title: "Attendance",
      desc: "Mark today's attendance",
      icon: <CalendarOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      onClick: () => navigate("/attendance"),
    },
    {
      title: "Pomodoro",
      desc: "Start a focus session",
      icon: <ClockCircleOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
      onClick: () => navigate("/pomodoro"),
    },
    {
      title: "Goals",
      desc: "Track study targets",
      icon: <AimOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #f97316, #fb923c)",
      onClick: () => navigate("/goals"),
    },
    {
      title: "Study Room",
      desc: "Focus with ambience",
      icon: <CustomerServiceOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
      onClick: () => navigate("/study-room"),
    },
    {
      title: "Analytics",
      desc: "View your progress",
      icon: <BarChartOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
      onClick: () => navigate("/analytics"),
    },
    {
      title: "Achievements",
      desc: "Earn badges & XP",
      icon: <StarOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #eab308, #facc15)",
      onClick: () => navigate("/achievements"),
    },
    {
      title: "Planner",
      desc: "AI study schedule",
      icon: <ScheduleOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
      onClick: () => navigate("/planner"),
    },
    {
      title: "Brain Dump",
      desc: "Clear your mind",
      icon: <BulbOutlined style={{ fontSize: "24px" }} />,
      gradient: "linear-gradient(135deg, #a855f7, #c084fc)",
      onClick: () => navigate("/brain-dump"),
    },
  ];

  const MOTIVATIONAL_QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Small progress is still progress.", author: "Unknown" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
    { text: "Study hard, and you'll get far in life.", author: "Prepify AI" },
  ];
  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  const dailyMissions = [
    {
      title: "Complete a Quiz",
      xp: 20,
      done: stats.quizzes > 0,
      icon: "🎯",
      color: "#f59e0b",
    },
    {
      title: "Create a Note",
      xp: 10,
      done: stats.notes > 0,
      icon: "📝",
      color: "#7c3aed",
    },
    {
      title: "20 min Focus Session",
      xp: 30,
      done: (pomodoroStats.today_minutes || 0) >= 20,
      icon: "⏱️",
      color: "#10b981",
    },
    {
      title: "Review Flashcards",
      xp: 15,
      done: stats.flashcards > 0,
      icon: "🃏",
      color: "#06b6d4",
    },
    {
      title: "Mark Attendance",
      xp: 5,
      done: (attendanceStats.current_streak || 0) > 0,
      icon: "✅",
      color: "#ec4899",
    },
  ];
  const missionsCompleted = dailyMissions.filter((m) => m.done).length;
  const totalMissionXP = dailyMissions.reduce((a, m) => a + m.xp, 0);
  const earnedMissionXP = dailyMissions.filter((m) => m.done).reduce((a, m) => a + m.xp, 0);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "120px", position: "relative", zIndex: 1 }}>
        <Spin size="large" />
      </div>
    );
  }

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good morning" : greetHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="page-header animate-fade-in" style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "34px" }}>
          {greeting}, {user?.username || "Learner"}! 🎓
        </h1>
        <p style={{ fontSize: "15px", maxWidth: 600 }}>
          <em style={{ color: "#64748b" }}>"{todayQuote.text}"</em>
          <span style={{ color: "#475569", fontSize: 12 }}> — {todayQuote.author}</span>
        </p>
      </div>

      {/* Daily Missions Card */}
      <div
        className="glass-card animate-fade-in stagger-1"
        style={{
          padding: "24px 28px",
          marginBottom: 28,
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(245,158,11,0.05) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative */}
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(245,158,11,0.08)", filter: "blur(40px)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚔️</span>
            <div>
              <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, margin: 0 }}>
                Today's Missions
              </h3>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                {missionsCompleted}/{dailyMissions.length} completed • {earnedMissionXP}/{totalMissionXP} XP
              </span>
            </div>
          </div>
          <div style={{
            padding: "4px 14px", borderRadius: 10,
            background: missionsCompleted === dailyMissions.length 
              ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.12)",
            border: `1px solid ${missionsCompleted === dailyMissions.length 
              ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.25)"}`,
            color: missionsCompleted === dailyMissions.length ? "#10b981" : "#f59e0b",
            fontSize: 12, fontWeight: 700,
          }}>
            {missionsCompleted === dailyMissions.length ? "🎉 All Done!" : `${earnedMissionXP} XP earned`}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{
            width: `${dailyMissions.length > 0 ? (missionsCompleted / dailyMissions.length) * 100 : 0}%`,
            height: "100%", borderRadius: 3,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 0 10px rgba(245,158,11,0.3)",
          }} />
        </div>

        {/* Mission items */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {dailyMissions.map((mission, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 160px",
                padding: "10px 14px",
                borderRadius: 12,
                background: mission.done ? `${mission.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${mission.done ? `${mission.color}30` : "rgba(255,255,255,0.05)"}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: mission.done ? 0.7 : 1,
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 18, filter: mission.done ? "none" : "grayscale(50%)" }}>{mission.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: mission.done ? "#64748b" : "#e2e8f0",
                  textDecoration: mission.done ? "line-through" : "none",
                }}>{mission.title}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: mission.done ? "#10b981" : "#f59e0b",
                padding: "2px 6px", borderRadius: 6,
                background: mission.done ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
              }}>
                {mission.done ? "✓" : `+${mission.xp} XP`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: "36px" }}>
        {statCards.map((stat, index) => (
          <Col xs={12} sm={8} md={4} key={stat.label}>
            <div
              className={`glass-card animate-fade-in stagger-${index + 1}`}
              style={{
                padding: "24px 16px",
                textAlign: "center",
                background: stat.gradient,
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "20px",
                  color: "#fff",
                  boxShadow: `0 0 20px ${stat.glow}`,
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-value" style={{ fontSize: "32px" }}>
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="stat-label" style={{ fontSize: "11px" }}>{stat.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <h2
        className="animate-fade-in stagger-7"
        style={{
          color: "#f1f5f9",
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <ThunderboltOutlined style={{ color: "#f59e0b" }} />
        Quick Actions
      </h2>
      <Row gutter={[12, 12]} style={{ marginBottom: "36px" }}>
        {quickActions.map((action, index) => (
          <Col xs={12} sm={8} md={6} lg={Math.floor(24 / quickActions.length)} key={action.title}>
            <div
              className="glass-card"
              onClick={action.onClick}
              style={{
                padding: "24px 12px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: action.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                }}
              >
                {action.icon}
              </div>
              <h3
                style={{
                  color: "#f1f5f9",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {action.title}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>
                {action.desc}
              </p>
            </div>
          </Col>
        ))}
      </Row>

      {/* Active Goals preview */}
      {activeGoals > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                color: "#f1f5f9",
                fontSize: "20px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              🎯 Active Goals
            </h2>
            <Button
              type="link"
              onClick={() => navigate("/goals")}
              style={{ color: "#a78bfa", fontWeight: 600 }}
            >
              View All <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: "36px" }}>
            {goalsData
              .filter((g) => g.status === "active")
              .slice(0, 3)
              .map((goal) => {
                const pct =
                  goal.target > 0
                    ? Math.round((goal.progress / goal.target) * 100)
                    : 0;
                return (
                  <Col xs={24} sm={8} key={goal.id}>
                    <div
                      className="glass-card"
                      style={{ padding: "20px", cursor: "pointer" }}
                      onClick={() => navigate("/goals")}
                    >
                      <h3
                        style={{
                          color: "#f1f5f9",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        {goal.title}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#64748b" }}>Progress</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#a78bfa",
                            fontWeight: 600,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.05)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 3,
                            background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                );
              })}
          </Row>
        </>
      )}

      {/* Recent Notes */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            color: "#f1f5f9",
            fontSize: "20px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          📄 Recent Notes
        </h2>
        <Button
          type="link"
          onClick={() => navigate("/notes")}
          style={{ color: "#a78bfa", fontWeight: 600 }}
        >
          View All <ArrowRightOutlined />
        </Button>
      </div>

      {recentNotes.length > 0 ? (
        <Row gutter={[16, 16]}>
          {recentNotes.map((note) => (
            <Col xs={24} sm={8} key={note.id}>
              <div
                className="glass-card"
                style={{ padding: "24px", cursor: "pointer" }}
                onClick={() => navigate("/notes")}
              >
                <h3
                  style={{
                    color: "#f1f5f9",
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {note.title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {note.content}
                </p>
                <div
                  style={{
                    marginTop: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(124, 58, 237, 0.1)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    color: "#a78bfa",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {note.subject}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            📝
          </div>
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            No notes yet. Start your learning journey!
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/notes")}
            className="neon-btn"
            size="large"
          >
            Create Your First Note
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
