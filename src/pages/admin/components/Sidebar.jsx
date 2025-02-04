import { Home, Users, ShoppingCart, Calendar, Bell, Book, HelpCircle, Image, Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

export function Sidebar({ setActiveSection, activeSection, theme, toggleTheme }) {
  const menuItems = [
    { name: "Dashboard", icon: Home, section: "dashboard" },
    { name: "Member Management", icon: Users, section: "memberManagement" },
    { name: "Shopping Options", icon: ShoppingCart, section: "shoppingOptions" },
    { name: "Events", icon: Calendar, section: "events" },
    { name: "Notices", icon: Bell, section: "notices" },
    { name: "User Guide", icon: Book, section: "userGuide" },
    { name: "Customer Center", icon: HelpCircle, section: "customerCenter" },
    { name: "Advertisement", icon: Image, section: "advertisement" },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <motion.button
            key={item.section}
            className={`flex w-full items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              activeSection === item.section ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : ""
            }`}
            onClick={() => setActiveSection(item.section)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.name}
          </motion.button>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </div>
  )
}

