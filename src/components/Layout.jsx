import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, LayoutDashboard, Target, Zap, BarChart3, Users, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InputSidebar from "./InputSidebar";

export default function Layout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Strategy", path: "/strategy", icon: Target },
    { name: "Slide Deck", path: "/pitch", icon: Zap },
    { name: "Business Plan", path: "/business-plan", icon: FileText },
    { name: "Market Bench", path: "/market", icon: BarChart3 },
    { name: "Investor CRM", path: "/investors", icon: Users },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      backgroundImage: "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 90% 80%, rgba(168,85,247,0.06) 0%, transparent 60%)",
      color: "#f0f4ff",
      position: "relative",
      overflowX: "hidden"
    }}>
      <InputSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div style={{
        marginLeft: isSidebarOpen ? 280 : 0,
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        <nav style={{
        zIndex: 100,
        height: 80,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#0d1420",
        display: "flex",
        alignItems: "center",
        padding: "0 32px"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
            }}>
              <Rocket size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#f0f4ff", letterSpacing: "-0.02em" }}>
              VenturePilot (v1.2)
            </span>
          </Link>

          <div style={{ display: "flex", gap: 8 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 10,
                    textDecoration: "none", fontSize: 13, fontWeight: 600,
                    color: isActive ? "#f0f4ff" : "#8ba3c7",
                    background: isActive ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                    border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <item.icon size={14} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              padding: "10px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f4ff", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>Log In</button>
            <button style={{
              padding: "10px 20px", borderRadius: 10,
              background: "#6366f1", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
            }}>Get Started</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px 80px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "40px 32px", background: "rgba(0,0,0,0.2)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#4a6080", fontSize: 13 }}>© 2026 VenturePilot. Built for the next generation of founders.</p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Support", "Twitter"].map(item => (
              <a key={item} href="#" style={{ color: "#4a6080", fontSize: 13, textDecoration: "none" }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
