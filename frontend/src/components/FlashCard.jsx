/**
 * FlashCard.jsx
 * -------------
 * Premium 3D flip card with neon glow, shimmer effects,
 * and smooth spring-based animations.
 */

import React, { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

const FlashCard = ({ card, onDelete }) => {
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        perspective: "1200px",
        width: "100%",
        height: "240px",
        cursor: "pointer",
      }}
      onClick={() => setFlipped(!flipped)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
          transform: flipped
            ? "rotateY(180deg)"
            : isHovered
            ? "rotateY(5deg) scale(1.02)"
            : "rotateY(0deg)",
        }}
      >
        {/* Front (Question) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "rgba(18, 18, 42, 0.7)",
            backdropFilter: "blur(20px)",
            border: isHovered
              ? "1px solid rgba(124, 58, 237, 0.4)"
              : "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "20px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            boxShadow: isHovered
              ? "0 8px 40px rgba(124, 58, 237, 0.2)"
              : "0 4px 20px rgba(0, 0, 0, 0.3)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
          }}
        >
          {/* Shimmer line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #7c3aed, transparent)",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />

          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#a78bfa",
              marginBottom: "20px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#7c3aed",
                boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            />
            Question
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "#f1f5f9",
              lineHeight: "1.6",
              fontWeight: 500,
            }}
          >
            {card.question}
          </p>
          <div
            style={{
              position: "absolute",
              bottom: "14px",
              color: "rgba(148, 163, 184, 0.4)",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ animation: "bounceSoft 2s ease-in-out infinite" }}>👆</span>
            Tap to flip
          </div>

          {onDelete && (
            <Tooltip title="Delete card">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card.id);
                }}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease",
                }}
              />
            </Tooltip>
          )}
        </div>

        {/* Back (Answer) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(6, 182, 212, 0.08))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            borderRadius: "20px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(124, 58, 237, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Top glow line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #06b6d4, #7c3aed, #ec4899)",
            }}
          />

          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#06b6d4",
              marginBottom: "20px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#06b6d4",
                boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
              }}
            />
            Answer
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "#f1f5f9",
              lineHeight: "1.6",
              fontWeight: 500,
            }}
          >
            {card.answer}
          </p>
          <div
            style={{
              position: "absolute",
              bottom: "14px",
              color: "rgba(148, 163, 184, 0.4)",
              fontSize: "11px",
            }}
          >
            Tap to flip back
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
