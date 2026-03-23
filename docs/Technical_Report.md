# Study Assistant AI — Technical Report

---

**Project Title:** Study Assistant AI  
**Version:** 1.0.0  
**Date:** March 2026  
**Authors:** Alok K  
**Technology:** React · Flask · Groq AI (LLaMA 3.3 70B)  

---

## Table of Contents

1. [Abstract](#1-abstract)  
2. [Introduction](#2-introduction)  
3. [Problem Statement](#3-problem-statement)  
4. [Objectives](#4-objectives)  
5. [Technology Stack](#5-technology-stack)  
6. [System Architecture](#6-system-architecture)  
7. [Module Descriptions](#7-module-descriptions)  
8. [API Design](#8-api-design)  
9. [AI Integration](#9-ai-integration)  
10. [Frontend Design & UI/UX](#10-frontend-design--uiux)  
11. [Data Management](#11-data-management)  
12. [Security Considerations](#12-security-considerations)  
13. [Testing & Verification](#13-testing--verification)  
14. [Deployment Guide](#14-deployment-guide)  
15. [Future Enhancements](#15-future-enhancements)  
16. [Conclusion](#16-conclusion)  
17. [References](#17-references)  

---

## 1. Abstract

**Study Assistant AI** is a full-stack web application designed to help students learn more effectively using artificial intelligence. The application provides four core study tools — **Notes Management**, **AI-powered Flashcard Generation**, **Dynamic Quiz Creation**, and an **AI Chat Tutor** — all integrated into a single, modern, dark-themed interface. The backend is built with Python Flask and integrates with the Groq cloud AI platform (LLaMA 3.3 70B model) for intelligent content generation. The frontend is a React single-page application styled with Ant Design and features glassmorphism aesthetics, animated backgrounds, and a fully responsive layout. Data persistence is handled through JSON file storage, making the system lightweight and easy to deploy without an external database.

---

## 2. Introduction

The rapid evolution of AI technologies has opened new possibilities in the education sector. Modern students need tools that go beyond simple note-taking — they need intelligent systems that can generate study material, quiz them on topics, and provide instant explanations.

**Study Assistant AI** addresses this need by combining traditional study management features (notes, flashcards) with AI-powered capabilities (automatic flashcard generation, dynamic quiz creation, conversational tutoring). The application is designed to be:

- **Accessible** — Runs in any modern web browser.
- **Intelligent** — Leverages a 70-billion-parameter language model for high-quality content generation.
- **Beautiful** — Features a premium dark-mode UI with glassmorphism, animations, and micro-interactions.
- **Lightweight** — No external database required; data is stored as JSON files.

---

## 3. Problem Statement

Students often struggle with:

1. **Disorganized study materials** — Notes scattered across multiple platforms.
2. **Passive learning** — Simply reading notes without active recall practice.
3. **Lack of instant feedback** — No way to quickly test understanding of a topic.
4. **Limited access to tutoring** — Human tutors are expensive and not always available.

Existing solutions either focus on a single feature (e.g., only flashcards, or only note-taking) or require expensive subscriptions. There is a need for an **integrated, AI-powered, free-to-use study platform** that combines all major study tools in one place.

---

## 4. Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Build a notes management system with CRUD operations | ✅ Completed |
| 2 | Implement flashcard creation (manual + AI-generated) | ✅ Completed |
| 3 | Create AI-powered quiz generation with auto-grading | ✅ Completed |
| 4 | Integrate an AI chat tutor for Q&A assistance | ✅ Completed |
| 5 | Design a premium, responsive UI with dark mode | ✅ Completed |
| 6 | Ensure lightweight deployment (no external DB) | ✅ Completed |

---

## 5. Technology Stack

### 5.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI component framework |
| Vite | 8.0.1 | Build tool & dev server |
| Ant Design | 6.3.3 | UI component library |
| React Router DOM | 7.13.1 | Client-side routing |
| Axios | 1.13.6 | HTTP client for API calls |
| @ant-design/icons | 6.1.0 | Icon library |

### 5.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Server-side language |
| Flask | 3.1.0 | Web framework |
| Flask-CORS | 5.0.1 | Cross-Origin Resource Sharing |
| OpenAI SDK | ≥1.0.0 | AI API client (Groq-compatible) |
| python-dotenv | ≥1.0.0 | Environment variable management |

### 5.3 AI Platform

| Component | Detail |
|-----------|--------|
| Provider | Groq Cloud |
| Model | LLaMA 3.3 70B Versatile |
| API Compatibility | OpenAI-compatible REST API |
| Tier | Free tier |

---

## 6. System Architecture

### 6.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React + Vite SPA (Port 5173)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐ │   │
│  │  │Dashboard │ │Notes Page│ │Quiz Page│ │Flashcard Page│ │   │
│  │  └──────────┘ └──────────┘ └─────────┘ └──────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────────┐│   │
│  │  │                Chat Page                              ││   │
│  │  └──────────────────────────────────────────────────────┘│   │
│  │                    │ Axios HTTP                           │   │
│  └────────────────────┼─────────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────┘
                        │ REST API (JSON)
┌───────────────────────┼─────────────────────────────────────────┐
│                 FLASK SERVER (Port 5000)                         │
│  ┌────────────────────┼─────────────────────────────────────┐   │
│  │              Route Blueprints                             │   │
│  │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────────────┐ │   │
│  │  │  Chat  │ │  Notes   │ │  Quiz  │ │   Flashcards    │ │   │
│  │  └────┬───┘ └────┬─────┘ └───┬────┘ └───────┬─────────┘ │   │
│  │       │          │           │               │           │   │
│  │  ┌────┴──────────┴───────────┴───────────────┴─────────┐ │   │
│  │  │               Service Layer                          │ │   │
│  │  │  ┌──────────────┐  ┌─────────────┐  ┌────────────┐  │ │   │
│  │  │  │  AI Service   │  │ Notes Svc   │  │ Quiz Svc   │  │ │   │
│  │  │  └──────┬───────┘  └──────┬──────┘  └─────┬──────┘  │ │   │
│  │  │         │                 │                │         │ │   │
│  │  └─────────┼─────────────────┼────────────────┼─────────┘ │   │
│  └────────────┼─────────────────┼────────────────┼───────────┘   │
│               │                 │                │               │
│        ┌──────┴──────┐   ┌──────┴──────┐  ┌──────┴──────┐       │
│        │  Groq API   │   │ notes.json  │  │ quizzes.json│       │
│        │  (External) │   │ cards.json  │  │             │       │
│        └─────────────┘   └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Design Pattern

The application follows a **layered architecture** pattern:

1. **Presentation Layer** — React components & pages.
2. **API Layer** — Flask route blueprints (thin controllers).
3. **Service Layer** — Business logic, data transformation, AI orchestration.
4. **Data Layer** — JSON file read/write utilities.
5. **External Layer** — Groq AI API for LLM capabilities.

### 6.3 Communication Protocol

- **Frontend ↔ Backend:** RESTful HTTP/JSON via Axios.
- **Backend ↔ AI:** OpenAI-compatible SDK over HTTPS to Groq cloud.
- **CORS:** Configured to allow requests from `http://localhost:5173`.

---

## 7. Module Descriptions

### 7.1 Notes Module

**Purpose:** Full CRUD management of study notes organized by subject.

**Backend:**
- **Route:** `app/routes/notes.py` — Defines 5 endpoints (GET all, GET by ID, POST, PUT, DELETE).
- **Service:** `app/services/notes_service.py` — Handles note creation (UUID generation, timestamps), updates, deletion, and JSON file persistence.
- **Validation:** Notes require `title` (string) and `content` (string) fields; `subject` defaults to "General".

**Frontend:**
- **Page:** `src/pages/NotesPage.jsx` — Full notes management UI with search, create, edit, and delete functionality.

### 7.2 Flashcards Module

**Purpose:** Manual and AI-powered flashcard creation for active recall study.

**Backend:**
- **Route:** `app/routes/flashcards.py` — 4 endpoints including AI generation.
- **Service:** `app/services/flashcard_service.py` — Manages flashcard CRUD and coordinates with AI service for auto-generation.
- **AI Generation:** Accepts a text block, sends it to the LLM with a structured prompt, and parses the JSON response into `{question, answer}` pairs.

**Frontend:**
- **Page:** `src/pages/FlashcardsPage.jsx` — Interactive flashcard viewer with flip animation.
- **Component:** `src/components/FlashCard.jsx` — Individual flashcard with 3D flip effect.

### 7.3 Quiz Module

**Purpose:** AI-generated topic-based quizzes with auto-grading and score history.

**Backend:**
- **Route:** `app/routes/quiz.py` — 3 endpoints (generate, grade, history).
- **Service:** `app/services/quiz_service.py` — Generates quizzes via AI, implements grading logic, and maintains quiz history.
- **Quiz Format:** Each question has 4 multiple-choice options with a 0-based `correct_answer` index.

**Frontend:**
- **Page:** `src/pages/QuizPage.jsx` — Quiz taking interface with progress tracking.
- **Component:** `src/components/QuizCard.jsx` — Individual question card with option selection.

### 7.4 Chat Module

**Purpose:** Conversational AI tutor that answers student questions in real-time.

**Backend:**
- **Route:** `app/routes/chat.py` — Single POST endpoint for sending messages.
- **Service:** `app/services/ai_service.py` — Wraps the LLM call with a study-tutor system prompt.
- **System Prompt:** Configured to be "smart, friendly, and encouraging," using markdown formatting and responding in the user's language.

**Frontend:**
- **Page:** `src/pages/ChatPage.jsx` — Chat interface entry point.
- **Component:** `src/components/ChatWindow.jsx` — Full chat window with message history, input field, and loading states.

---

## 8. API Design

### 8.1 Endpoint Summary

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| `GET` | `/api/notes/` | Get all notes | — |
| `GET` | `/api/notes/<id>` | Get note by ID | — |
| `POST` | `/api/notes/` | Create a note | `{title, content, subject?}` |
| `PUT` | `/api/notes/<id>` | Update a note | `{title?, content?, subject?}` |
| `DELETE` | `/api/notes/<id>` | Delete a note | — |
| `GET` | `/api/flashcards/` | Get all flashcards | — |
| `POST` | `/api/flashcards/` | Create a flashcard | `{question, answer, subject?}` |
| `POST` | `/api/flashcards/generate` | AI-generate flashcards | `{text, subject?, num_cards?}` |
| `DELETE` | `/api/flashcards/<id>` | Delete a flashcard | — |
| `POST` | `/api/quiz/generate` | Generate a quiz | `{topic, num_questions?}` |
| `POST` | `/api/quiz/grade` | Grade a quiz | `{quiz_id, answers}` |
| `GET` | `/api/quiz/history` | Get quiz history | — |
| `POST` | `/api/chat/` | Chat with AI | `{message}` |
| `GET` | `/api/health` | Health check | — |

### 8.2 Response Format

All endpoints return JSON. Successful responses include the data directly; error responses follow the format:

```json
{
  "error": "Description of the error"
}
```

### 8.3 Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `404` | Resource not found |
| `500` | Internal server error |

---

## 9. AI Integration

### 9.1 Architecture

The AI integration is centralized in `app/services/ai_service.py`:

```python
# Client setup (OpenAI-compatible SDK pointing to Groq)
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
MODEL = "llama-3.3-70b-versatile"
```

### 9.2 AI Functions

| Function | Purpose | Temperature |
|----------|---------|-------------|
| `generate_response(message)` | Chat tutor responses | 0.7 (balanced) |
| `generate_flashcards_from_text(text, n)` | Flashcard Q&A pairs | 0.5 (focused) |
| `generate_quiz_questions(topic, n)` | MCQ generation | 0.6 (moderate) |

### 9.3 Prompt Engineering

Each AI function uses a specialized system prompt:

- **Chat:** Study assistant persona — friendly, encouraging, concise, markdown-formatted.
- **Flashcards:** JSON-only output instruction — generates `[{question, answer}]` arrays.
- **Quiz:** Structured MCQ generation — 4 options per question with a 0-based correct answer index.

### 9.4 Response Parsing

AI responses are parsed with defensive coding:
1. Strip whitespace.
2. Remove markdown code fences (` ```json ... ``` `) if present.
3. Parse via `json.loads()`.

---

## 10. Frontend Design & UI/UX

### 10.1 Design Philosophy

The frontend follows a **premium dark-mode glassmorphism** design language:

- **Color Palette:** Deep indigo base (`#12122a`) with vibrant purple primary (`#7c3aed`).
- **Typography:** Inter font family with system font fallbacks.
- **Glass Effects:** Semi-transparent containers with backdrop blur.
- **Animations:** Animated gradient background, smooth page transitions, and micro-interactions.

### 10.2 Component Hierarchy

```
App
├── AnimatedBackground          (Ambient gradient animation)
├── Navbar                      (Top navigation bar)
├── Sidebar                     (Side navigation menu)
└── Content (Routes)
    ├── Dashboard               (Overview & quick stats)
    ├── NotesPage               (Notes CRUD interface)
    ├── FlashcardsPage          (Flashcard browser + generator)
    ├── QuizPage                (Quiz interface + history)
    └── ChatPage
        └── ChatWindow          (Chat message display + input)
```

### 10.3 Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard` | Home page with feature overview |
| `/notes` | `NotesPage` | Notes management |
| `/flashcards` | `FlashcardsPage` | Flashcard viewer |
| `/quiz` | `QuizPage` | Quiz generation & taking |
| `/chat` | `ChatPage` | AI chat interface |

### 10.4 Ant Design Theme Configuration

```javascript
{
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#7c3aed",
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, ...",
    colorBgContainer: "rgba(18, 18, 42, 0.65)",
    colorBgElevated: "rgba(13, 13, 31, 0.95)",
    colorBorder: "rgba(255, 255, 255, 0.06)",
  }
}
```

---

## 11. Data Management

### 11.1 Storage Strategy

The application uses **JSON file-based storage** instead of a traditional database:

| File | Contents |
|------|----------|
| `backend/data/notes.json` | Array of note objects |
| `backend/data/flashcards.json` | Array of flashcard objects |
| `backend/data/quizzes.json` | Array of quiz objects with history |

### 11.2 Data Models

**Note:**
```json
{
  "id": "uuid-string",
  "title": "Photosynthesis",
  "content": "The process by which plants...",
  "subject": "Biology",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Flashcard:**
```json
{
  "id": "uuid-string",
  "question": "What is the powerhouse of the cell?",
  "answer": "Mitochondria",
  "subject": "Biology",
  "created_at": "ISO-8601 timestamp"
}
```

**Quiz:**
```json
{
  "id": "uuid-string",
  "topic": "Physics",
  "questions": [
    {
      "question": "What is Newton's first law?",
      "options": ["Inertia", "Force", "Momentum", "Energy"],
      "correct_answer": 0
    }
  ],
  "score": null,
  "created_at": "ISO-8601 timestamp"
}
```

### 11.3 Advantages of JSON Storage

- **Zero Setup:** No database installation or configuration needed.
- **Portability:** Data files can be easily shared, backed up, or versioned.
- **Simplicity:** Perfect for single-user, educational applications.
- **Human-Readable:** Data can be inspected and edited directly.

---

## 12. Security Considerations

| Concern | Implementation |
|---------|---------------|
| API Key Protection | Keys stored in `.env` file (gitignored) |
| CORS | Restricted to frontend origin (`localhost:5173`) |
| Input Validation | All endpoints validate request bodies via `schemas.py` |
| Error Handling | Structured error responses with appropriate HTTP codes |
| Environment Isolation | Python virtual environment (`venv`) for dependencies |

### 12.1 Recommendations for Production

- [ ] Replace `SECRET_KEY` with a cryptographically secure value.
- [ ] Use HTTPS in production.
- [ ] Add rate limiting to AI endpoints to prevent API key abuse.
- [ ] Implement user authentication (JWT / OAuth 2.0).
- [ ] Migrate from JSON files to a proper database (PostgreSQL / MongoDB).

---

## 13. Testing & Verification

### 13.1 Manual Testing

All features have been manually verified:

- ✅ Notes: Create, read, update, delete operations.
- ✅ Flashcards: Manual creation and AI generation from text.
- ✅ Quiz: Topic-based generation, question answering, and grading.
- ✅ Chat: Multi-turn conversations with AI tutor.
- ✅ UI/UX: Dark theme, animations, responsive layout across screen sizes.

### 13.2 API Testing

Endpoints can be tested using tools like:
- **curl** / **Postman** for direct API testing.
- **Browser DevTools** for frontend-backend communication inspection.

### 13.3 Health Check

```bash
curl http://localhost:5000/api/health
# Response: {"status": "ok", "message": "Study Assistant API is running!"}
```

---

## 14. Deployment Guide

### 14.1 Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- A Groq API key (free at https://console.groq.com)

### 14.2 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# Create .env file
echo GROQ_API_KEY=your_key_here > .env

python run.py                  # Starts on port 5000
```

### 14.3 Frontend Setup

```bash
cd frontend
npm install
npm run dev                    # Starts on port 5173
```

### 14.4 Access the Application

Open **http://localhost:5173** in a web browser.

---

## 15. Future Enhancements

| Priority | Feature | Description |
|----------|---------|-------------|
| High | User Authentication | JWT-based login system for multi-user support |
| High | Database Migration | Replace JSON files with PostgreSQL or MongoDB |
| Medium | File Upload & OCR | Extract text from PDF/images for AI processing |
| Medium | Spaced Repetition | Implement SM-2 algorithm for flashcard scheduling |
| Medium | Export & Share | PDF export for notes, shareable quiz links |
| Low | Voice Input | Speech-to-text for chat and note dictation |
| Low | Mobile App | React Native companion app |
| Low | Analytics Dashboard | Study time tracking and performance trends |

---

## 16. Conclusion

**Study Assistant AI** successfully demonstrates how modern AI can be integrated into educational tools to create a powerful, personalized learning experience. The application combines the reliability of a traditional full-stack web architecture (React + Flask) with the intelligence of a state-of-the-art language model (LLaMA 3.3 70B via Groq).

The modular architecture ensures maintainability and extensibility — new features can be added by simply creating new route blueprints and service modules. The JSON-based storage makes the system immediately deployable without any database configuration, while the premium glassmorphism UI provides an engaging and modern user experience.

The project serves as both a practical study tool and a reference implementation for building AI-powered web applications with Python and JavaScript.

---

## 17. References

1. **Flask Documentation** — https://flask.palletsprojects.com/
2. **React Documentation** — https://react.dev/
3. **Ant Design** — https://ant.design/
4. **Vite** — https://vite.dev/
5. **Groq AI Platform** — https://console.groq.com/docs
6. **OpenAI Python SDK** — https://github.com/openai/openai-python
7. **LLaMA Model Family** — Meta AI Research
8. **React Router** — https://reactrouter.com/

---

*This document is auto-generated as part of the Study Assistant AI project documentation.*
