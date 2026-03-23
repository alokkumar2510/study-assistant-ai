/**
 * QuizCard.jsx
 * ------------
 * Quiz question card with animated selection states,
 * pulsing result indicators, and smooth transitions.
 */

import React from "react";
import { Radio, Space, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const QuizCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
  showResult,
}) => {
  return (
    <div
      className="animate-fade-in"
      style={{
        background: "rgba(18, 18, 42, 0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "20px",
        padding: "28px",
        marginBottom: "20px",
        transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!showResult) {
          e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
          e.currentTarget.style.boxShadow = "0 4px 30px rgba(124, 58, 237, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: showResult
            ? selectedAnswer === question.correct_answer
              ? "linear-gradient(90deg, transparent, #10b981, transparent)"
              : "linear-gradient(90deg, transparent, #f43f5e, transparent)"
            : "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent)",
          transition: "all 0.5s ease",
        }}
      />

      {/* Question header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "13px",
            borderRadius: "10px",
            padding: "6px 14px",
            boxShadow: "0 0 15px rgba(124, 58, 237, 0.2)",
          }}
        >
          Q{questionNumber}
        </div>
        <h3
          style={{
            color: "#f1f5f9",
            fontSize: "16px",
            fontWeight: 600,
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <Radio.Group
        value={selectedAnswer}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        disabled={showResult}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          {question.options.map((option, index) => {
            const isCorrect = showResult && index === question.correct_answer;
            const isWrong =
              showResult &&
              index === selectedAnswer &&
              index !== question.correct_answer;
            const isSelected = !showResult && index === selectedAnswer;

            return (
              <Radio
                key={index}
                value={index}
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: isCorrect
                    ? "1px solid rgba(16, 185, 129, 0.5)"
                    : isWrong
                    ? "1px solid rgba(244, 63, 94, 0.5)"
                    : isSelected
                    ? "1px solid rgba(124, 58, 237, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isCorrect
                    ? "rgba(16, 185, 129, 0.08)"
                    : isWrong
                    ? "rgba(244, 63, 94, 0.08)"
                    : isSelected
                    ? "rgba(124, 58, 237, 0.08)"
                    : "rgba(255, 255, 255, 0.02)",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  cursor: showResult ? "default" : "pointer",
                  boxShadow: isCorrect
                    ? "0 0 20px rgba(16, 185, 129, 0.1)"
                    : isWrong
                    ? "0 0 20px rgba(244, 63, 94, 0.1)"
                    : "none",
                }}
              >
                <span style={{ color: "#f1f5f9", marginLeft: "8px", flex: 1 }}>
                  {option}
                </span>
                {isCorrect && (
                  <CheckCircleOutlined
                    style={{
                      color: "#10b981",
                      fontSize: "18px",
                      animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                )}
                {isWrong && (
                  <CloseCircleOutlined
                    style={{
                      color: "#f43f5e",
                      fontSize: "18px",
                      animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                )}
              </Radio>
            );
          })}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default QuizCard;
