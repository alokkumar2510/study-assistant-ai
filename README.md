# 📚 Study Assistant AI

A full-stack AI-powered study assistant that helps you manage notes, create flashcards, take quizzes, and chat with an AI tutor.

## Tech Stack

| Layer       | Technology         |
|-------------|--------------------|
| Frontend    | React + Ant Design |
| Backend     | Flask (Python)     |
| Communication | REST API         |
| Storage     | JSON files         |

## Project Structure

```
study-assistant-ai/
├── frontend/          # React + Vite application
│   └── src/
│       ├── api/       # Axios API helpers
│       ├── components/# Reusable UI components
│       ├── pages/     # Page views (routed)
│       └── styles/    # Global CSS
├── backend/           # Flask application
│   ├── app/
│   │   ├── routes/    # API endpoint blueprints
│   │   ├── services/  # Business logic
│   │   ├── models/    # Data validation
│   │   └── utils/     # Shared utilities
│   └── data/          # JSON file storage
└── README.md
```

## Getting Started

### Prerequisites

- **Python 3.8+** installed
- **Node.js 18+** and **npm** installed

### 1. Set up the Backend

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python run.py
```

The backend will start on **http://localhost:5000**.

### 2. Set up the Frontend

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**.

### 3. Open the App

Open your browser and go to **http://localhost:5173** 🎉

## Features

- 📝 **Notes** — Create, edit, search, and organize study notes
- 🃏 **Flashcards** — Create manually or generate from text with AI
- 🏆 **Quizzes** — Generate topic-based quizzes and track scores
- 🤖 **AI Chat** — Ask study questions and get instant help

## API Endpoints

| Method   | Endpoint                   | Description                    |
|----------|----------------------------|--------------------------------|
| `GET`    | `/api/notes/`              | Get all notes                  |
| `POST`   | `/api/notes/`              | Create a note                  |
| `PUT`    | `/api/notes/<id>`          | Update a note                  |
| `DELETE` | `/api/notes/<id>`          | Delete a note                  |
| `GET`    | `/api/flashcards/`         | Get all flashcards             |
| `POST`   | `/api/flashcards/`         | Create a flashcard             |
| `POST`   | `/api/flashcards/generate` | Generate flashcards from text  |
| `DELETE` | `/api/flashcards/<id>`     | Delete a flashcard             |
| `POST`   | `/api/quiz/generate`       | Generate a quiz                |
| `POST`   | `/api/quiz/grade`          | Grade a quiz                   |
| `GET`    | `/api/quiz/history`        | Get quiz history               |
| `POST`   | `/api/chat/`               | Send a chat message            |
| `GET`    | `/api/health`              | Health check                   |
