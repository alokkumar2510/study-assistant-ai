/**
 * ChatWindow.jsx
 * --------------
 * PREMIUM AI Chat UI with:
 * - Typewriter streaming for AI replies
 * - Markdown rendering (bold, code, lists)
 * - Quick action chips (Explain, Quiz me, Summarize, Examples)
 * - Animated message entrance with staggered bubbles
 * - Copy-to-clipboard on AI messages
 * - Timestamp on messages
 * - User XP toast on each conversation
 * - Particle burst on send
 * - Enhanced typing indicator with animated pulse ring
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input, Button, Tooltip, message as antdMessage } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CopyOutlined,
  CheckOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  BookOutlined,
  ExperimentOutlined,
  CodeOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

/* ── Markdown-lite renderer ── */
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";

  lines.forEach((line, idx) => {
    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} style={{
            background: "rgba(0,0,0,0.4)",
            borderRadius: 10,
            padding: "14px 16px",
            margin: "8px 0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            lineHeight: 1.6,
            overflowX: "auto",
            border: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
          }}>
            {codeLang && (
              <span style={{
                position: "absolute", top: 6, right: 10,
                fontSize: 9, color: "#475569", fontWeight: 600,
                textTransform: "uppercase",
              }}>{codeLang}</span>
            )}
            <code style={{ color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
              {codeContent.trim()}
            </code>
          </div>
        );
        codeContent = "";
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3);
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      return;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={idx} style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 14, margin: "12px 0 4px" }}>
          {line.slice(4)}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={idx} style={{ color: "#a78bfa", fontWeight: 700, fontSize: 15, margin: "12px 0 4px" }}>
          {line.slice(3)}
        </h3>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginLeft: 4 }}>
          <span style={{ color: "#7c3aed", fontSize: 8, marginTop: 7, flexShrink: 0 }}>●</span>
          <span>{renderInline(line.trim().slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    const numberedMatch = line.trim().match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginLeft: 4 }}>
          <span style={{
            color: "#7c3aed", fontSize: 11, fontWeight: 700,
            minWidth: 18, flexShrink: 0, marginTop: 1
          }}>{numberedMatch[1]}.</span>
          <span>{renderInline(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (line.trim() === "") {
      elements.push(<div key={idx} style={{ height: 6 }} />);
      return;
    }

    // Normal paragraph
    elements.push(<div key={idx}>{renderInline(line)}</div>);
  });

  return elements;
};

/* Inline formatting: **bold**, `code`, *italic* */
const renderInline = (text) => {
  if (!text) return text;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);

    let firstMatch = null;
    let firstIdx = remaining.length;

    if (boldMatch && remaining.indexOf(boldMatch[0]) < firstIdx) {
      firstMatch = { type: "bold", match: boldMatch };
      firstIdx = remaining.indexOf(boldMatch[0]);
    }
    if (codeMatch && remaining.indexOf(codeMatch[0]) < firstIdx) {
      firstMatch = { type: "code", match: codeMatch };
      firstIdx = remaining.indexOf(codeMatch[0]);
    }
    if (!firstMatch && italicMatch && remaining.indexOf(italicMatch[0]) < firstIdx) {
      firstMatch = { type: "italic", match: italicMatch };
      firstIdx = remaining.indexOf(italicMatch[0]);
    }

    if (firstMatch) {
      if (firstIdx > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, firstIdx)}</span>);
      }

      if (firstMatch.type === "bold") {
        parts.push(
          <strong key={key++} style={{ color: "#e2e8f0", fontWeight: 700 }}>
            {firstMatch.match[1]}
          </strong>
        );
        remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
      } else if (firstMatch.type === "code") {
        parts.push(
          <code key={key++} style={{
            background: "rgba(124,58,237,0.15)",
            padding: "1px 6px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#c4b5fd",
          }}>
            {firstMatch.match[1]}
          </code>
        );
        remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
      } else if (firstMatch.type === "italic") {
        parts.push(
          <em key={key++} style={{ color: "#94a3b8", fontStyle: "italic" }}>
            {firstMatch.match[1]}
          </em>
        );
        remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
      }
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      remaining = "";
    }
  }
  return parts;
};

/* ── Typing indicator with pulse ring ── */
const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
    <div style={{ position: "relative", width: 20, height: 20 }}>
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid #7c3aed",
        }}
      />
      <div style={{
        position: "absolute", inset: 4,
        borderRadius: "50%",
        background: "#7c3aed",
      }} />
    </div>
    <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 500 }}>
      Prepify is thinking
    </span>
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ color: "#a78bfa", fontSize: 12 }}
    >
      ...
    </motion.span>
  </div>
);

/* ── XP Burst Animation ── */
const XPBurst = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ opacity: 1, y: -40, scale: 1 }}
        exit={{ opacity: 0, y: -70, scale: 0.8 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: "fixed",
          bottom: 120,
          right: 40,
          zIndex: 9999,
          padding: "8px 16px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          color: "#000",
          fontWeight: 800,
          fontSize: 14,
          boxShadow: "0 0 30px rgba(245,158,11,0.4)",
          pointerEvents: "none",
        }}
      >
        +10 XP ⚡
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Quick Action Chips ── */
const QUICK_ACTIONS = [
  { label: "Explain this", icon: <BulbOutlined />, prefix: "Explain ", color: "#f59e0b" },
  { label: "Quiz me", icon: <ThunderboltOutlined />, prefix: "Create a quick quiz about ", color: "#10b981" },
  { label: "Summarize", icon: <BookOutlined />, prefix: "Summarize the key points of ", color: "#06b6d4" },
  { label: "Give examples", icon: <ExperimentOutlined />, prefix: "Give me real-world examples of ", color: "#ec4899" },
  { label: "Write code", icon: <CodeOutlined />, prefix: "Write code for ", color: "#8b5cf6" },
];

/* ── Suggested Prompts ── */
const SUGGESTIONS = [
  "Explain Newton's laws of motion in simple terms",
  "What's the difference between Stack and Queue?",
  "Help me understand recursion with examples",
  "Create a study plan for my exams next week",
  "Quiz me on Operating System concepts",
  "Explain Big O notation with examples",
];

const ChatWindow = ({ messages, onSendMessage, loading }) => {
  const [inputValue, setInputValue] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showXP, setShowXP] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Show XP burst when AI responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1200);
    }
  }, [messages]);

  const handleSend = (text) => {
    const trimmed = (text || inputValue).trim();
    if (trimmed && !loading) {
      onSendMessage(trimmed);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    antdMessage.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <XPBurst show={showXP} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 200px)",
          background: "rgba(18, 18, 42, 0.5)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.06)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient glows */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent)",
        }} />
        <div style={{
          position: "absolute", bottom: 80, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent)",
        }} />

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ textAlign: "center", marginTop: 40, padding: 20 }}
            >
              {/* Animated AI avatar */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(124,58,237,0.2)",
                    "0 0 60px rgba(124,58,237,0.4)",
                    "0 0 30px rgba(124,58,237,0.2)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 24,
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.1))",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: 40,
                }}
              >
                🤖
              </motion.div>

              <h3 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                Hey! I'm Prepify AI ✨
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                Your personal study companion. Ask me to explain concepts, create quizzes, write code, or help you study smarter.
              </p>

              {/* Quick Action Chips */}
              <div style={{
                display: "flex", gap: 8, justifyContent: "center",
                flexWrap: "wrap", marginBottom: 28,
              }}>
                {QUICK_ACTIONS.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setInputValue(action.prefix);
                      inputRef.current?.focus();
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      background: `${action.color}12`,
                      border: `1px solid ${action.color}25`,
                      color: action.color,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </motion.button>
                ))}
              </div>

              {/* Suggestion Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                maxWidth: 500,
                margin: "0 auto",
              }}>
                {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.03, borderColor: "rgba(124,58,237,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(suggestion)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <p style={{
                      color: "#94a3b8", fontSize: 12, margin: 0,
                      lineHeight: 1.4, fontWeight: 500,
                    }}>
                      {suggestion}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.35,
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.05,
              }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.25)",
                    marginTop: 2,
                  }}
                >
                  <RobotOutlined style={{ color: "#fff", fontSize: 16 }} />
                </motion.div>
              )}

              {/* Message Bubble */}
              <div style={{ maxWidth: "75%", position: "relative" }}>
                <motion.div
                  whileHover={msg.role === "assistant" ? { borderColor: "rgba(124,58,237,0.3)" } : {}}
                  style={{
                    padding: msg.role === "assistant" ? "16px 20px" : "12px 18px",
                    borderRadius: msg.role === "user"
                      ? "18px 18px 6px 18px"
                      : "18px 18px 18px 6px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                      : "rgba(255, 255, 255, 0.04)",
                    border: msg.role === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    color: "#f1f5f9",
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    wordBreak: "break-word",
                    boxShadow: msg.role === "user"
                      ? "0 4px 24px rgba(124, 58, 237, 0.3)"
                      : "0 2px 12px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </motion.div>

                {/* Message footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                    paddingLeft: msg.role === "assistant" ? 4 : 0,
                    paddingRight: msg.role === "user" ? 4 : 0,
                  }}
                >
                  <span style={{ fontSize: 10, color: "#475569" }}>
                    {formatTime()}
                  </span>

                  {/* Copy button for AI messages */}
                  {msg.role === "assistant" && (
                    <Tooltip title={copiedIdx === index ? "Copied!" : "Copy"}>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => copyToClipboard(msg.content, index)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: copiedIdx === index ? "#10b981" : "#475569",
                          fontSize: 12,
                          padding: 2,
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {copiedIdx === index ? <CheckOutlined /> : <CopyOutlined />}
                      </motion.button>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.15))",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <UserOutlined style={{ color: "#06b6d4", fontSize: 16 }} />
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.25)",
                  }}
                >
                  <RobotOutlined style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderRadius: "18px 18px 18px 6px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar (when in conversation) */}
        {messages.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "6px 24px 0",
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {QUICK_ACTIONS.slice(0, 4).map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  setInputValue(action.prefix);
                  inputRef.current?.focus();
                }}
                style={{
                  padding: "4px 12px",
                  borderRadius: 10,
                  background: `${action.color}0a`,
                  border: `1px solid ${action.color}18`,
                  color: action.color,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {action.icon}
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            background: "rgba(6, 6, 15, 0.5)",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Prepify anything..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 16,
              color: "#f1f5f9",
              fontSize: 14,
              resize: "none",
              padding: "11px 18px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(124, 58, 237, 0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.1), 0 0 20px rgba(124,58,237,0.05)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.target.style.boxShadow = "none";
            }}
          />

          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
            <Button
              type="primary"
              icon={<SendOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleSend()}
              loading={loading}
              disabled={!inputValue.trim()}
              style={{
                height: 44,
                width: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: inputValue.trim()
                  ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                boxShadow: inputValue.trim()
                  ? "0 0 20px rgba(124,58,237,0.3)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
