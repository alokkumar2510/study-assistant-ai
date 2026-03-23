/**
 * api.js
 * ------
 * Centralized API helper using Axios.
 * All HTTP requests to the Flask backend go through this file.
 * Components import these functions instead of calling axios directly.
 */

import axios from "axios";
import { API_BASE_URL } from "../config";

// Create an Axios instance with the base URL pre-configured
const api = axios.create({
  baseURL: https://prepify-knk8.onrender.com,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================
// NOTES API
// =====================

/** Fetch all notes */
export const getNotes = () => api.get("/notes/");

/** Fetch a single note by ID */
export const getNoteById = (id) => api.get(`/notes/${id}`);

/** Create a new note */
export const createNote = (data) => api.post("/notes/", data);

/** Update an existing note */
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);

/** Delete a note */
export const deleteNote = (id) => api.delete(`/notes/${id}`);

// =====================
// FLASHCARDS API
// =====================

/** Fetch all flashcards */
export const getFlashcards = () => api.get("/flashcards/");

/** Create a new flashcard manually */
export const createFlashcard = (data) => api.post("/flashcards/", data);

/** Generate flashcards from text using AI */
export const generateFlashcards = (data) =>
  api.post("/flashcards/generate", data);

/** Delete a flashcard */
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}`);

// =====================
// QUIZ API
// =====================

/** Generate a new quiz */
export const generateQuiz = (data) => api.post("/quiz/generate", data);

/** Grade a completed quiz */
export const gradeQuiz = (data) => api.post("/quiz/grade", data);

/** Fetch quiz history */
export const getQuizHistory = () => api.get("/quiz/history");

// =====================
// CHAT API
// =====================

/** Send a message to the AI assistant */
export const sendChatMessage = (message) =>
  api.post("/chat/", { message });

export default api;
