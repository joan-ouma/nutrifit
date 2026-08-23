import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';

function App() {
    return (
        <ToastProvider>
        <Router>
            <div className="text-slate-900 font-sans" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", backgroundColor: "#faf8f2" }}>
                
                {/* Aura Gradient Layers */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(20,184,166,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.08) 1px, transparent 1px)", backgroundSize: "48px 48px", mixBlendMode: "normal", opacity: 0.8, pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 45% at 48% 45%, rgba(45,212,191,0.22) 0%, transparent 75%)", mixBlendMode: "normal", filter: "blur(234px)", pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 25%, rgba(125,211,252,0.18) 0%, transparent 35%)", mixBlendMode: "normal", filter: "blur(180px)", pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                
                {/* Content Wrapper */}
                <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/app/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </Router>
        </ToastProvider>
    );
}

export default App;