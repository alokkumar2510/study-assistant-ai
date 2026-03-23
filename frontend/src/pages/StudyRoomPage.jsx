/**
 * StudyRoomPage.jsx
 * -----------------
 * 🎧 Virtual Study Room with ambient sounds, live focus timer,
 * customizable ambience, session tracking, and immersive UI.
 *
 * Innovative feature: combines ambient sound mixing with focus tracking
 * for a "study with me" experience.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Slider, message } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  CloudOutlined,
  CoffeeOutlined,
  ThunderboltOutlined,
  FireOutlined,
  MoonOutlined,
  ExpandOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import api from "../api/api";

/* ── Ambient sound definitions ── */
const AMBIENCES = [
  {
    id: "rain",
    label: "Rain",
    icon: "🌧️",
    color: "#06b6d4",
    desc: "Gentle rainfall",
    // We use Web Audio API oscillators to simulate ambient sounds
  },
  {
    id: "cafe",
    label: "Café",
    icon: "☕",
    color: "#f59e0b",
    desc: "Coffee shop buzz",
  },
  {
    id: "forest",
    label: "Forest",
    icon: "🌲",
    color: "#10b981",
    desc: "Nature sounds",
  },
  {
    id: "lofi",
    label: "Lo-Fi",
    icon: "🎵",
    color: "#ec4899",
    desc: "Chill beats",
  },
  {
    id: "fireplace",
    label: "Fireplace",
    icon: "🔥",
    color: "#f97316",
    desc: "Crackling fire",
  },
  {
    id: "ocean",
    label: "Ocean",
    icon: "🌊",
    color: "#3b82f6",
    desc: "Waves & breeze",
  },
  {
    id: "library",
    label: "Library",
    icon: "📚",
    color: "#8b5cf6",
    desc: "Quiet whispers",
  },
  {
    id: "space",
    label: "Space",
    icon: "🚀",
    color: "#6366f1",
    desc: "Cosmic hum",
  },
];

/* ── Ambient sound generator using Web Audio API ── */
const createAmbientSound = (audioCtx, type) => {
  const nodes = [];

  const createNoise = (frequency, type, gain) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = frequency;
    filter.type = "lowpass";
    filter.frequency.value = 800;
    gainNode.gain.value = gain;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();

    return { osc, gainNode, filter };
  };

  switch (type) {
    case "rain":
      nodes.push(createNoise(200, "sawtooth", 0.02));
      nodes.push(createNoise(400, "sawtooth", 0.015));
      break;
    case "cafe":
      nodes.push(createNoise(300, "triangle", 0.015));
      nodes.push(createNoise(150, "sine", 0.01));
      break;
    case "forest":
      nodes.push(createNoise(180, "sine", 0.02));
      nodes.push(createNoise(320, "triangle", 0.01));
      break;
    case "lofi":
      nodes.push(createNoise(220, "sine", 0.03));
      nodes.push(createNoise(330, "sine", 0.02));
      nodes.push(createNoise(440, "triangle", 0.01));
      break;
    case "fireplace":
      nodes.push(createNoise(100, "sawtooth", 0.02));
      nodes.push(createNoise(60, "square", 0.01));
      break;
    case "ocean":
      nodes.push(createNoise(120, "sine", 0.025));
      nodes.push(createNoise(80, "triangle", 0.015));
      break;
    case "library":
      nodes.push(createNoise(250, "sine", 0.005));
      break;
    case "space":
      nodes.push(createNoise(60, "sine", 0.02));
      nodes.push(createNoise(90, "sine", 0.015));
      break;
    default:
      nodes.push(createNoise(200, "sine", 0.01));
  }

  return nodes;
};

const StudyRoomPage = () => {
  const [isStudying, setIsStudying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [selectedAmbience, setSelectedAmbience] = useState(null);
  const [volume, setVolume] = useState(50);
  const [isZenMode, setIsZenMode] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [breathePhase, setBreathePhase] = useState("inhale");

  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);
  const startTimeRef = useRef(null);

  // Breathing exercise cycle
  useEffect(() => {
    if (!isStudying) return;
    const cycle = setInterval(() => {
      setBreathePhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        return "inhale";
      });
    }, 4000);
    return () => clearInterval(cycle);
  }, [isStudying]);

  // Timer
  useEffect(() => {
    if (isStudying) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isStudying]);

  // Sound management
  const startSound = useCallback(
    (ambienceId) => {
      stopSound();
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const nodes = createAmbientSound(ctx, ambienceId);
        audioNodesRef.current = nodes;
        // Set volume
        nodes.forEach((n) => {
          if (n.gainNode) {
            n.gainNode.gain.value = n.gainNode.gain.value * (volume / 100);
          }
        });
      } catch (e) {
        console.warn("Audio not supported:", e);
      }
    },
    [volume]
  );

  const stopSound = () => {
    audioNodesRef.current.forEach((n) => {
      try {
        n.osc.stop();
      } catch {}
    });
    audioNodesRef.current = [];
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  // Update volume on nodes
  useEffect(() => {
    audioNodesRef.current.forEach((n) => {
      if (n.gainNode) {
        n.gainNode.gain.value = (volume / 100) * 0.03;
      }
    });
  }, [volume]);

  const handleAmbienceSelect = (amb) => {
    if (selectedAmbience?.id === amb.id) {
      setSelectedAmbience(null);
      stopSound();
    } else {
      setSelectedAmbience(amb);
      if (isStudying) {
        startSound(amb.id);
      }
    }
  };

  const toggleSession = () => {
    if (isStudying) {
      // Ending session
      const mins = Math.floor(elapsed / 60);
      if (mins > 0) {
        api
          .post("/pomodoro/session", {
            duration_minutes: mins,
            session_type: "study_room",
          })
          .catch(() => {});
        setTodayMinutes((p) => p + mins);
        setTotalSessions((p) => p + 1);
        message.success(`🎉 Great session! ${mins} minutes of deep focus!`);
      }
      setIsStudying(false);
      setElapsed(0);
      stopSound();
    } else {
      setIsStudying(true);
      if (selectedAmbience) {
        startSound(selectedAmbience.id);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopSound();
      clearInterval(intervalRef.current);
    };
  }, []);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Zen mode (fullscreen-like minimal UI)
  if (isZenMode) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "linear-gradient(135deg, #06060f 0%, #0d0d1f 50%, #13132b 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "none",
        }}
      >
        {/* Animated gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: selectedAmbience
              ? `radial-gradient(circle, ${selectedAmbience.color}15 0%, transparent 70%)`
              : "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />

        {/* Breathing circle */}
        <motion.div
          animate={{
            scale: breathePhase === "inhale" ? 1.3 : breathePhase === "hold" ? 1.3 : 0.9,
            opacity: breathePhase === "hold" ? 0.8 : 1,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `2px solid ${selectedAmbience?.color || "#7c3aed"}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#f1f5f9",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {timeStr}
          </span>
          <span style={{ fontSize: 12, color: "#64748b", marginTop: 8, textTransform: "capitalize" }}>
            {breathePhase}...
          </span>
        </motion.div>

        {/* Ambience label */}
        {selectedAmbience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            <span style={{ fontSize: 20 }}>{selectedAmbience.icon}</span>
            {selectedAmbience.label}
          </motion.div>
        )}

        <Button
          onClick={() => setIsZenMode(false)}
          icon={<CompressOutlined />}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Exit Zen
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          🎧 Study Room
        </motion.h1>
        <p>Immerse yourself in focus with ambient sounds and a distraction-free environment</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
        className="study-room-grid"
      >
        {/* Main Timer Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: 500,
          }}
        >
          {/* Animated background glow */}
          {isStudying && selectedAmbience && (
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 50% 50%, ${selectedAmbience.color}15 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Status badge */}
          <motion.div
            animate={isStudying ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              background: isStudying
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(255,255,255,0.05)",
              border: `1px solid ${isStudying ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: isStudying ? "#10b981" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 40,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isStudying ? "#10b981" : "#64748b",
                display: "inline-block",
                animation: isStudying ? "pulseGlow 2s infinite" : "none",
              }}
            />
            {isStudying ? "In Deep Focus" : "Ready to Study"}
          </motion.div>

          {/* Timer display */}
          <div style={{ position: "relative", marginBottom: 40 }}>
            {/* Outer ring */}
            <svg width="260" height="260" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="4"
              />
              {isStudying && (
                <motion.circle
                  cx="130"
                  cy="130"
                  r="115"
                  fill="none"
                  stroke={selectedAmbience?.color || "#7c3aed"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 115}
                  animate={{
                    strokeDashoffset: [2 * Math.PI * 115, 0],
                  }}
                  transition={{ duration: 3600, ease: "linear", repeat: Infinity }}
                  style={{
                    filter: `drop-shadow(0 0 8px ${selectedAmbience?.color || "#7c3aed"}66)`,
                  }}
                />
              )}
            </svg>
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
                  fontSize: 52,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 3,
                }}
              >
                {timeStr}
              </span>
              {selectedAmbience && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    color: selectedAmbience.color,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <span>{selectedAmbience.icon}</span>
                  {selectedAmbience.label}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={isStudying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleSession}
              style={{
                borderRadius: 16,
                height: 56,
                width: 180,
                fontWeight: 700,
                fontSize: 16,
                background: isStudying
                  ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                  : `linear-gradient(135deg, ${selectedAmbience?.color || "#7c3aed"}, ${selectedAmbience?.color || "#a78bfa"}cc)`,
                border: "none",
                boxShadow: `0 0 30px ${isStudying ? "rgba(244,63,94,0.3)" : (selectedAmbience?.color || "rgba(124,58,237,0.3)")}`,
              }}
            >
              {isStudying ? "End Session" : "Start Studying"}
            </Button>
            {isStudying && (
              <Button
                size="large"
                icon={<ExpandOutlined />}
                onClick={() => setIsZenMode(true)}
                style={{
                  borderRadius: 14,
                  height: 56,
                  width: 56,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ambience Selector */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ padding: 24 }}
          >
            <h3
              style={{
                color: "#f1f5f9",
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <SoundOutlined style={{ color: "#a78bfa" }} />
              Pick Your Vibe
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {AMBIENCES.map((amb) => (
                <motion.div
                  key={amb.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAmbienceSelect(amb)}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 14,
                    background:
                      selectedAmbience?.id === amb.id
                        ? `${amb.color}20`
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      selectedAmbience?.id === amb.id
                        ? `${amb.color}40`
                        : "rgba(255,255,255,0.06)"
                    }`,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{amb.icon}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color:
                        selectedAmbience?.id === amb.id ? amb.color : "#94a3b8",
                    }}
                  >
                    {amb.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Volume slider */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  <SoundOutlined /> Volume
                </span>
                <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
                  {volume}%
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                value={volume}
                onChange={setVolume}
                styles={{
                  track: {
                    background:
                      selectedAmbience?.color || "#7c3aed",
                  },
                  rail: { background: "rgba(255,255,255,0.06)" },
                }}
              />
            </div>
          </motion.div>

          {/* Session Stats */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ padding: 24 }}
          >
            <h3
              style={{
                color: "#f1f5f9",
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FireOutlined style={{ color: "#f59e0b" }} />
              Today's Focus
            </h3>
            {[
              {
                label: "Focus Time",
                value: `${todayMinutes + Math.floor(elapsed / 60)} min`,
                color: "#7c3aed",
                icon: "⏱️",
              },
              {
                label: "Sessions",
                value: totalSessions + (isStudying ? 1 : 0),
                color: "#10b981",
                icon: "📊",
              },
              {
                label: "Current Streak",
                value: isStudying ? "Active 🔥" : "Idle",
                color: isStudying ? "#f59e0b" : "#64748b",
                icon: isStudying ? "🔥" : "💤",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  {stat.icon} {stat.label}
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Tips */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{ padding: 20 }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 6 }}>💡 Study Tip</div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 12,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                The 52-17 rule: Study for 52 minutes, then take a 17-minute break.
                Research shows this rhythm maximizes deep focus and prevents burnout.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .study-room-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default StudyRoomPage;
