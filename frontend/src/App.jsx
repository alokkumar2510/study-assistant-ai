/**
 * App.jsx
 * -------
 * PREPIFY root component with auth flow, protected routes,
 * animated background, glassmorphism layout, and responsive routing.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, Layout, theme } from "antd";
import { Toaster } from "react-hot-toast";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import AttendancePage from "./pages/AttendancePage";
import PomodoroPage from "./pages/PomodoroPage";
import GoalsPage from "./pages/GoalsPage";
import StudyRoomPage from "./pages/StudyRoomPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AchievementsPage from "./pages/AchievementsPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import BrainDumpPage from "./pages/BrainDumpPage";

const { Content } = Layout;

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a78bfa",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * AppLayout — wraps protected pages with Navbar + Sidebar.
 */
const AppLayout = ({ children }) => (
  <Layout style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
    <Navbar />
    <Layout>
      <Sidebar />
      <Content
        style={{
          minHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        {children}
      </Content>
    </Layout>
  </Layout>
);

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          borderRadius: 10,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgContainer: "rgba(18, 18, 42, 0.65)",
          colorBgElevated: "rgba(13, 13, 31, 0.95)",
          colorBorder: "rgba(255, 255, 255, 0.06)",
        },
      }}
    >
      <AuthProvider>
        <Router>
          {/* Animated ambient background */}
          <AnimatedBackground />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(13, 13, 31, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#f1f5f9",
                borderRadius: 12,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FlashcardsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuizPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChatPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AttendancePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pomodoro"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PomodoroPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GoalsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-room"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <StudyRoomPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AchievementsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <StudyPlannerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/brain-dump"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BrainDumpPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all → Welcome */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
