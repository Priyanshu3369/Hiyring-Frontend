// App.jsx
// Root component — sets up React Router routes and wraps everything in AuthProvider.
// Public routes: /login, /signup
// Protected routes: /dashboard, /profile, /profile/edit (wrapped in ProtectedRoute)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Jobs from "./pages/Jobs";
import SystemCheck from "./pages/SystemCheck";
import Interview from "./pages/Interview";
import InterviewResult from "./pages/InterviewResult";
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* AuthProvider wraps the router so all pages can access auth state */}
        <AuthProvider>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ── Protected routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/saved" element={<Jobs />} />
              <Route path="/jobs/:id" element={<Jobs />} />
              <Route path="/applications" element={<Jobs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/system-check" element={<SystemCheck />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/interview/result" element={<InterviewResult />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;