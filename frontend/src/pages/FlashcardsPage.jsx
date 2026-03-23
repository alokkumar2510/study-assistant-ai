/**
 * FlashcardsPage.jsx
 * ------------------
 * Premium flashcards page with staggered grid entrance,
 * animated buttons, and AI generation modal.
 */

import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Modal,
  Form,
  Empty,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  ThunderboltOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import {
  getFlashcards,
  createFlashcard,
  generateFlashcards,
  deleteFlashcard,
} from "../api/api";
import FlashCard from "../components/FlashCard";
import FileUploader from "../components/FileUploader";

const { TextArea } = Input;

const FlashcardsPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await getFlashcards();
      setCards(res.data);
    } catch (error) {
      message.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (values) => {
    try {
      await createFlashcard(values);
      message.success("Flashcard created!");
      setIsModalOpen(false);
      form.resetFields();
      fetchCards();
    } catch (error) {
      message.error("Failed to create flashcard");
    }
  };

  const handleGenerate = async (values) => {
    setGenerateLoading(true);
    try {
      const res = await generateFlashcards(values);
      message.success(`Generated ${res.data.length} flashcards!`);
      setIsGenerateModalOpen(false);
      generateForm.resetFields();
      fetchCards();
    } catch (error) {
      message.error("Failed to generate flashcards");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFlashcard(id);
      message.success("Flashcard deleted");
      fetchCards();
    } catch (error) {
      message.error("Failed to delete flashcard");
    }
  };

  const handleFileContent = (text) => {
    generateForm.setFieldsValue({ text });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "120px", position: "relative", zIndex: 1 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Flashcards 🃏</h1>
        <p>Create and study flashcards to boost your memory.</p>
      </div>

      {/* Toolbar */}
      <div
        className="animate-fade-in stagger-1"
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="neon-btn"
          size="large"
          style={{ borderRadius: "14px", height: "44px", fontWeight: 700 }}
        >
          Create Card
        </Button>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={() => setIsGenerateModalOpen(true)}
          size="large"
          style={{
            borderRadius: "14px",
            height: "44px",
            background: "rgba(6, 182, 212, 0.1)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            color: "#06b6d4",
            fontWeight: 700,
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(6, 182, 212, 0.18)";
            e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.5)";
            e.currentTarget.style.boxShadow = "0 0 25px rgba(6, 182, 212, 0.15)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
            e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.3)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Generate from Text
        </Button>
      </div>

      {/* Cards Count */}
      {cards.length > 0 && (
        <div
          className="animate-fade-in stagger-2"
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            marginBottom: "16px",
            fontWeight: 500,
          }}
        >
          {cards.length} card{cards.length !== 1 ? "s" : ""} in your collection
        </div>
      )}

      {/* Flashcards Grid */}
      {cards.length > 0 ? (
        <Row gutter={[18, 18]}>
          {cards.map((card, index) => (
            <Col xs={24} sm={12} lg={8} key={card.id}>
              <div className={`animate-fade-in stagger-${(index % 8) + 1}`}>
                <FlashCard card={card} onDelete={handleDelete} />
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <div
          className="glass-card animate-fade-in"
          style={{ padding: "70px", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "52px",
              marginBottom: "16px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🃏
          </div>
          <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "20px" }}>
            No flashcards yet. Create some or generate from your notes!
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="neon-btn"
              size="large"
            >
              Create Card
            </Button>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={() => setIsGenerateModalOpen(true)}
              size="large"
              style={{
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#06b6d4",
              }}
            >
              Generate with AI
            </Button>
          </div>
        </div>
      )}

      {/* Manual Create Modal */}
      <Modal
        title="Create Flashcard"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCard} style={{ marginTop: "20px" }}>
          <Form.Item
            name="question"
            label={<span style={{ color: "#94a3b8" }}>Question (Front)</span>}
            rules={[{ required: true, message: "Enter a question" }]}
          >
            <Input placeholder="e.g. What is photosynthesis?" style={{ borderRadius: "12px", height: "42px" }} />
          </Form.Item>
          <Form.Item
            name="answer"
            label={<span style={{ color: "#94a3b8" }}>Answer (Back)</span>}
            rules={[{ required: true, message: "Enter an answer" }]}
          >
            <TextArea rows={3} placeholder="The process by which plants..." style={{ borderRadius: "12px" }} />
          </Form.Item>
          <Form.Item
            name="subject"
            label={<span style={{ color: "#94a3b8" }}>Subject</span>}
          >
            <Input placeholder="e.g. Biology" style={{ borderRadius: "12px", height: "42px" }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: "10px", borderRadius: "10px" }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="neon-btn" style={{ borderRadius: "10px" }}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Generate Modal */}
      <Modal
        title="Generate Flashcards with AI ✨"
        open={isGenerateModalOpen}
        onCancel={() => setIsGenerateModalOpen(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={generateForm} layout="vertical" onFinish={handleGenerate} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <FileUploader onFileContent={handleFileContent} />
          </div>
          <Form.Item
            name="text"
            label={<span style={{ color: "#94a3b8" }}>Or paste your text here</span>}
            rules={[{ required: true, message: "Enter some text" }]}
          >
            <TextArea rows={6} placeholder="Paste your study notes..." style={{ borderRadius: "12px" }} />
          </Form.Item>
          <Form.Item name="subject" label={<span style={{ color: "#94a3b8" }}>Subject</span>}>
            <Input placeholder="e.g. Biology" style={{ borderRadius: "12px", height: "42px" }} />
          </Form.Item>
          <Form.Item name="num_cards" label={<span style={{ color: "#94a3b8" }}>Number of cards</span>} initialValue={5}>
            <Input type="number" min={1} max={20} style={{ borderRadius: "12px", height: "42px" }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button onClick={() => setIsGenerateModalOpen(false)} style={{ marginRight: "10px", borderRadius: "10px" }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={generateLoading}
              icon={<ThunderboltOutlined />}
              className="neon-btn"
              style={{ borderRadius: "10px" }}
            >
              Generate
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FlashcardsPage;
