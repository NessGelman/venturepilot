import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, LayoutDashboard, Target, Zap, BarChart3, Users, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import InputSidebar from "./InputSidebar";
import { useApp } from "../context/AppContext";

export default function Layout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toasts, undo, redo } = useApp();

  useEffect(() => {
    const handler = (e) => {
      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z";
      const isRedo = ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
                     ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y");
      if (isUndo) { e.preventDefault(); undo?.(); }
      if (isRedo) { e.preventDefault(); redo?.(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const navItems = [
    { name: "Dashboard",     path: "/",              icon: LayoutDashboard },
    { name: "Strategy",      path: "/strategy",      icon: Target },
    { name: "Slide Deck",    path: "/pitch",         icon: Zap },
    { name: "Business Plan", path: "/business-plan", icon: FileText },
    { name: "Market Bench",  path: "/market",        icon: BarChart3 },
    { name: "Investor CRM",  path: "/investors",     icon: Users },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080c14",
      backgroundImage: "radial-gradient(ellipse 60% 50% at 10% 0%,rgba(99,102,241,0.08) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 90% 80%,rgba(168,85,247,0.06) 0%,transparent 60%)",
      color: "#f0f4ff", position: "relative", overflowX: "hidden"
    }}>
      <InputSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div style={{
        marginLeft: isSidebarOpen ? 290 : 0,
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        minHeight: "100vh", display: "flex", flexDirection: "column"
      }}>
        <nav style={{
          position: "sticky", top: 0, zIndex: 100, height: 72,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(13,20,32,0.92)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", padding: "0 28px"
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)"
              }}>
                <Rocket size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#f0f4ff", letterSpacing: "-0.02em" }}>
                VenturePilot <span style={{ color: "#475569", fontWeight: 500, fontSize: 13 }}>v1.5</span>
              </span>
            </Link>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 10,
                    textDecoration: "none", fontSize: 13, fontWeight: 600,
                    color: active ? "#f0f4ff" : "#8ba3c7",
                    background: active ? "rgba(99,102,241,0.15)" : "transparent",
                    border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                    transition: "all 0.15s ease"
                  }}>
                    <item.icon size={13} />{item.name}
                  </Link>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <button style={{
                padding: "9px 18px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#f0f4ff", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>Log In</button>
              <button style={{
                padding: "9px 18px", borderRadius: 10,
                background: "#6366f1", border: "none",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
              }}>Get Started</button>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 28px 80px", width: "100%" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 28px", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "#4a6080", fontSize: 13 }}>© 2026 VenturePilot. Built for the next generation of founders.</p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy","Terms","Support","Twitter"].map(item => (
                <a key={item} href="#" style={{ color: "#4a6080", fontSize: 13, textDecoration: "none" }}>{item}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* Toast notifications */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 400, pointerEvents: "none" }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(99,102,241,0.95)", color: "#fff", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", fontSize: 13 }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
