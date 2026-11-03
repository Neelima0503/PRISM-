import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import "./index.css";
import { AuthProvider, useAuth } from "./auth";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Baseline from "./pages/Baseline";
import PmSubmission from "./pages/PmSubmission";
import PdReview from "./pages/PdReview";
import NewProject from "./pages/NewProject";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Layout>{children}</Layout>;
}

function RequireApprover({ children }: { children: ReactNode }) {
  const { user, canApprove } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canApprove) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function RequireSubmitter({ children }: { children: ReactNode }) {
  const { user, canSubmit } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canSubmit) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Portfolio /></RequireAuth>} />
      <Route path="/projects/new" element={<RequireSubmitter><NewProject /></RequireSubmitter>} />
      <Route path="/projects/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
      <Route path="/projects/:id/baseline" element={<RequireAuth><Baseline /></RequireAuth>} />
      <Route path="/projects/:id/submission" element={<RequireAuth><PmSubmission /></RequireAuth>} />
      <Route path="/projects/:id/review" element={<RequireApprover><PdReview /></RequireApprover>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
