/**
 * NotesPage.jsx
 * -------------
 * Premium notes manager with animated card grid,
 * gradient search bar, staggered reveals, and hover transforms.
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
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getNotes, createNote, updateNote, deleteNote } from "../api/api";

const { TextArea } = Input;

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data);
    } catch (error) {
      message.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (note = null) => {
    setEditingNote(note);
    if (note) form.setFieldsValue(note);
    else form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, values);
        message.success("Note updated!");
      } else {
        await createNote(values);
        message.success("Note created!");
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      message.success("Note deleted");
      fetchNotes();
    } catch (error) {
      message.error("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1>My Notes 📝</h1>
        <p>Create and organize your study notes.</p>
      </div>

      {/* Toolbar */}
      <div
        className="animate-fade-in stagger-1"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Search notes..."
          prefix={
            <SearchOutlined
              style={{ color: "#a78bfa", fontSize: "16px" }}
            />
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            maxWidth: "340px",
            borderRadius: "14px",
            height: "44px",
          }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          className="neon-btn"
          size="large"
          style={{ borderRadius: "14px", height: "44px", fontWeight: 700 }}
        >
          New Note
        </Button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <Row gutter={[18, 18]}>
          {filteredNotes.map((note, index) => (
            <Col xs={24} sm={12} lg={8} key={note.id}>
              <div
                className={`glass-card animate-fade-in stagger-${(index % 8) + 1}`}
                style={{
                  padding: "24px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Top accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "20%",
                    right: "20%",
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)",
                    borderRadius: "2px",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      color: "#f1f5f9",
                      fontSize: "16px",
                      fontWeight: 700,
                      margin: 0,
                      flex: 1,
                      lineHeight: "1.4",
                    }}
                  >
                    {note.title}
                  </h3>
                  <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => openModal(note)}
                      style={{ color: "#a78bfa" }}
                    />
                    <Popconfirm
                      title="Delete this note?"
                      onConfirm={() => handleDelete(note.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                  </div>
                </div>

                {/* Subject badge */}
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(124, 58, 237, 0.1)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    color: "#a78bfa",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "inline-block",
                    marginBottom: "14px",
                    alignSelf: "flex-start",
                  }}
                >
                  {note.subject}
                </div>

                {/* Content preview */}
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    flex: 1,
                  }}
                >
                  {note.content}
                </p>

                <div
                  style={{
                    color: "#475569",
                    fontSize: "11px",
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
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
            📓
          </div>
          <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "20px" }}>
            {searchTerm
              ? "No notes matching your search"
              : "No notes yet — start your study journey!"}
          </p>
          {!searchTerm && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              className="neon-btn"
              size="large"
            >
              Create Note
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        title={editingNote ? "Edit Note" : "Create New Note"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: "#94a3b8" }}>Title</span>}
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input
              placeholder="e.g. Biology Chapter 3 Notes"
              style={{ borderRadius: "12px", height: "42px" }}
            />
          </Form.Item>

          <Form.Item
            name="subject"
            label={<span style={{ color: "#94a3b8" }}>Subject</span>}
          >
            <Input
              placeholder="e.g. Biology, Math, History"
              style={{ borderRadius: "12px", height: "42px" }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label={<span style={{ color: "#94a3b8" }}>Content</span>}
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <TextArea
              rows={6}
              placeholder="Write your notes here..."
              style={{ borderRadius: "12px", resize: "vertical" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: "10px", borderRadius: "10px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="neon-btn"
              style={{ borderRadius: "10px" }}
            >
              {editingNote ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;
