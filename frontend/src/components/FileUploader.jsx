/**
 * FileUploader.jsx
 * ----------------
 * Animated drag-and-drop file uploader with
 * pulsing border, gradient icon, and hover effects.
 */

import React, { useState } from "react";
import { Upload, message } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const FileUploader = ({ onFileContent, accept = ".txt,.md" }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (text && text.trim()) {
        onFileContent(text, file.name);
        message.success(`${file.name} loaded successfully!`);
      } else {
        message.warning("The file appears to be empty.");
      }
    };
    reader.onerror = () => {
      message.error("Failed to read the file.");
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={() => setIsDragging(false)}
    >
      <Dragger
        accept={accept}
        showUploadList={false}
        beforeUpload={() => false}
        onChange={handleUpload}
        style={{
          background: isDragging
            ? "rgba(124, 58, 237, 0.08)"
            : "rgba(255, 255, 255, 0.02)",
          border: isDragging
            ? "2px dashed rgba(124, 58, 237, 0.6)"
            : "2px dashed rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "24px",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: isDragging ? "0 0 30px rgba(124, 58, 237, 0.15)" : "none",
        }}
      >
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined
            style={{
              fontSize: "44px",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "transform 0.3s ease",
              transform: isDragging ? "scale(1.2) translateY(-4px)" : "scale(1)",
            }}
          />
        </p>
        <p style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: 600 }}>
          Click or drag a file here
        </p>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
          Supports .txt and .md files
        </p>
      </Dragger>
    </div>
  );
};

export default FileUploader;
