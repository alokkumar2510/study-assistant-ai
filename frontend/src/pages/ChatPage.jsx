/**
 * ChatPage.jsx
 * ------------
 * Premium AI Chat page with conversation history,
 * message counter, and enhanced chat interface.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { message, Tag } from "antd";
import { RobotOutlined, MessageOutlined, ThunderboltOutlined } from "@ant-design/icons";
import ChatWindow from "../components/ChatWindow";
import { sendChatMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { refreshUsage } = useAuth();

  const handleSendMessage = async (text) => {
    const userMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      const assistantMessage = {
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      refreshUsage();
    } catch (error) {
      message.error("Failed to get a response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please check if the backend is running and your API key has credits.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const msgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="page-container">
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ marginBottom: 4 }}>Prepify AI 🤖</h1>
          <p style={{ margin: 0 }}>Your intelligent study companion — powered by AI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          {msgCount > 0 && (
            <Tag
              style={{
                borderRadius: 10,
                padding: "4px 12px",
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "#a78bfa",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              <MessageOutlined style={{ marginRight: 4 }} />
              {msgCount} {msgCount === 1 ? "message" : "messages"}
            </Tag>
          )}
          <Tag
            style={{
              borderRadius: 10,
              padding: "4px 12px",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#10b981",
              fontWeight: 600,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
              animation: "pulseGlow 2s infinite",
            }} />
            Online
          </Tag>
        </motion.div>
      </div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </motion.div>
    </div>
  );
};

export default ChatPage;
