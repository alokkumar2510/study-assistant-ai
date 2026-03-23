/**
 * QuizPage.jsx
 * ------------
 * Premium quiz page with animated progress,
 * score burst animation, and responsive design.
 */

import React, { useState } from "react";
import { Button, Input, Spin, message, Progress } from "antd";
import {
  TrophyOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { generateQuiz, gradeQuiz } from "../api/api";
import QuizCard from "../components/QuizCard";

const QuizPage = () => {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      message.warning("Please enter a topic");
      return;
    }
    setLoading(true);
    setQuiz(null);
    setResult(null);
    setAnswers({});
    try {
      const res = await generateQuiz({ topic, num_questions: 5 });
      setQuiz(res.data);
    } catch (error) {
      message.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      message.warning(`Answer all questions (${unanswered.length} remaining)`);
      return;
    }
    setGrading(true);
    try {
      const res = await gradeQuiz({ quiz_id: quiz.id, answers });
      setResult(res.data);
    } catch (error) {
      message.error("Failed to grade quiz");
    } finally {
      setGrading(false);
    }
  };

  const handleReset = () => {
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setTopic("");
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#f43f5e";
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return "🎉";
    if (score >= 60) return "👍";
    return "💪";
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Quiz Mode 🏆</h1>
        <p>Test your knowledge with AI-generated quizzes.</p>
      </div>

      {/* Quiz Generator */}
      {!quiz && !result && (
        <div
          className="glass-card animate-scale-in"
          style={{
            padding: "50px 40px",
            textAlign: "center",
            maxWidth: "520px",
            margin: "40px auto",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "36px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🏆
          </div>
          <h2
            style={{
              color: "#f1f5f9",
              fontSize: "22px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Ready to test yourself?
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "28px", fontSize: "14px" }}>
            Enter a topic and I'll create a quiz for you!
          </p>

          <Input
            placeholder="e.g. Photosynthesis, World War 2, Python..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onPressEnter={handleGenerate}
            size="large"
            style={{
              marginBottom: "16px",
              borderRadius: "14px",
              height: "48px",
              textAlign: "center",
              fontSize: "15px",
            }}
          />

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={loading}
            size="large"
            className="neon-btn"
            block
            style={{
              borderRadius: "14px",
              height: "48px",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Generate Quiz
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          className="animate-fade-in"
          style={{ textAlign: "center", padding: "80px" }}
        >
          <Spin size="large" />
          <p style={{ color: "#94a3b8", marginTop: "20px", fontSize: "15px" }}>
            Generating your quiz...
          </p>
        </div>
      )}

      {/* Quiz Questions */}
      {quiz && !result && !loading && (
        <div className="animate-fade-in">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 700, margin: 0 }}>
                📋 Quiz: {quiz.topic}
              </h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
                {quiz.questions.length} questions
              </p>
            </div>

            {/* Progress indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(18, 18, 42, 0.6)",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "14px" }}>
                {Object.keys(answers).length}
              </span>
              <span style={{ color: "#475569" }}>/</span>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                {quiz.questions.length}
              </span>
              <span style={{ color: "#475569", fontSize: "12px" }}>answered</span>
            </div>
          </div>

          {/* Progress bar */}
          <Progress
            percent={Math.round(
              (Object.keys(answers).length / quiz.questions.length) * 100
            )}
            strokeColor={{
              "0%": "#7c3aed",
              "100%": "#06b6d4",
            }}
            trailColor="rgba(255, 255, 255, 0.04)"
            showInfo={false}
            style={{ marginBottom: "24px" }}
          />

          {quiz.questions.map((question, index) => (
            <div key={question.id} className={`animate-fade-in stagger-${index + 1}`}>
              <QuizCard
                question={question}
                questionNumber={index + 1}
                selectedAnswer={answers[question.id]}
                onAnswerChange={handleAnswerChange}
                showResult={false}
              />
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={grading}
              icon={<CheckCircleOutlined />}
              className="neon-btn"
              style={{
                minWidth: "220px",
                height: "50px",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Submit Answers
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-scale-in">
          <div
            className="glass-card"
            style={{
              padding: "50px 40px",
              textAlign: "center",
              marginBottom: "36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative top line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${getScoreColor(result.score)}, transparent)`,
              }}
            />

            <Progress
              type="circle"
              percent={result.score}
              size={160}
              strokeColor={getScoreColor(result.score)}
              trailColor="rgba(255, 255, 255, 0.04)"
              strokeWidth={8}
              format={(percent) => (
                <div>
                  <div
                    style={{
                      color: getScoreColor(result.score),
                      fontSize: "36px",
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {percent}%
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    SCORE
                  </div>
                </div>
              )}
            />

            <h2
              style={{
                color: "#f1f5f9",
                fontSize: "24px",
                fontWeight: 800,
                marginTop: "24px",
              }}
            >
              {result.score >= 80
                ? "Excellent!"
                : result.score >= 60
                ? "Good job!"
                : "Keep studying!"}{" "}
              {getScoreEmoji(result.score)}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px" }}>
              You got <strong style={{ color: "#f1f5f9" }}>{result.correct}</strong> out
              of <strong style={{ color: "#f1f5f9" }}>{result.total}</strong> correct
            </p>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className="neon-btn"
              size="large"
              style={{
                marginTop: "24px",
                borderRadius: "14px",
                height: "48px",
                fontWeight: 700,
              }}
            >
              Take Another Quiz
            </Button>
          </div>

          {/* Review */}
          <h3
            style={{
              color: "#f1f5f9",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            📝 Review Your Answers
          </h3>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className={`animate-fade-in stagger-${index + 1}`}>
              <QuizCard
                question={question}
                questionNumber={index + 1}
                selectedAnswer={answers[question.id]}
                onAnswerChange={() => {}}
                showResult={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
