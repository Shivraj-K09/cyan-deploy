"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MemberManagement } from "./components/MemberManagement";
import { ShoppingOptions } from "./components/ShoppingOptions";
import { Events } from "./components/Events";
import { Notices } from "./components/Notices";
import { UserGuide } from "./components/UserGuide";
import { CustomerCenter } from "./components/CustomerCenter";
import { Advertisement } from "./components/Advertisement";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const renderSection = () => {
    const components = {
      dashboard: Dashboard,
      memberManagement: MemberManagement,
      shoppingOptions: ShoppingOptions,
      events: Events,
      notices: Notices,
      userGuide: UserGuide,
      customerCenter: CustomerCenter,
      advertisement: Advertisement,
    };
    const Component = components[activeSection] || Dashboard;
    return <Component />;
  };

  return (
    <div
      className={`flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${theme}`}
    >
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-200">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
