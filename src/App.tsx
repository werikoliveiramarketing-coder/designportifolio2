/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  const [colors, setColors] = useState({ brandColor: "#7b2cff", brandColorLight: "#f5f0ff" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setColors(data);
          
          // Apply to root
          document.documentElement.style.setProperty('--brand', data.brandColor);
          document.documentElement.style.setProperty('--brand-light', data.brandColorLight);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();

    // Listener for storage events if we want cross-tab sync, 
    // but here we just need it on load and when Admin updates (Admin can reload or we can use a custom event)
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setColors(e.detail);
        document.documentElement.style.setProperty('--brand', e.detail.brandColor);
        document.documentElement.style.setProperty('--brand-light', e.detail.brandColorLight);
      }
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-[#0a0a0a] selection:text-[#f5f5f4]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}
