import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import UploadPdfPage from './pages/UploadPdfPage.jsx';
import QuizSessionPage from './pages/QuizSessionPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
            <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
            <Route path="/upload-pdf" element={<PrivateRoute role="teacher"><UploadPdfPage /></PrivateRoute>} />
            <Route path="/quiz/:quizId" element={<PrivateRoute><QuizSessionPage /></PrivateRoute>} />
            <Route path="/leaderboard/:quizId" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 