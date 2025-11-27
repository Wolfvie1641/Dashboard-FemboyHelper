import {
  Home,
  Terminal,
  Heart,
  Send,
  Scroll,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Layout({ children }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = (() => {
    if (location.pathname.startsWith("/broadcast")) return "Broadcast";
    if (location.pathname.startsWith("/wedding")) return "Wedding Settings";
    return "Dashboard";
  })();

  return (
    <div className="flex h-screen bg-[#0d0f15] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b0d13] border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md" />
          <h1 className="text-2xl font-bold tracking-wide">NEXUS</h1>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1 mt-3 px-3">
          <SidebarLink icon={<Home size={18} />} label="Dashboard" to="/" />
          <SidebarLink icon={<Terminal size={18} />} label="Commands" to="/commands" />

          <p className="mt-4 mb-1 text-xs uppercase tracking-wider text-white/40">
            Wedding System
          </p>
          <SidebarLink icon={<Heart size={18} />} label="Wedding Settings" to="/wedding" />

          <SidebarLink icon={<Send size={18} />} label="Broadcast" to="/broadcast" />
          <SidebarLink icon={<Scroll size={18} />} label="System Logs" to="/logs" />
          <SidebarLink icon={<Settings size={18} />} label="Settings" to="/settings" />
        </nav>

        {/* Bottom Status */}
        <div className="mt-auto p-4">
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/40 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
            <div>
              <p className="text-sm font-semibold">System Online</p>
              <p className="text-xs text-white/50">Live</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 overflow-y-auto px-10 py-6">
        {/* TOPBAR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide">{pageTitle.toUpperCase()}</h1>

          <div className="flex items-center gap-4">
            <div className="px-4 py-1 rounded-full bg-green-700/20 border border-green-500/40 text-green-400 text-sm">
              WS: CONNECTED
            </div>

            <div className="relative">
              <img
                src="https://i.pravatar.cc/40"
                className="w-10 h-10 rounded-full border border-white/20 cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              />

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0f1117] border border-white/10 rounded-lg shadow-xl p-2 glass z-50">
                  <div className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded-md cursor-pointer">
                    <User size={16} />
                    Profile
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded-md cursor-pointer">
                    <Settings size={16} />
                    Dashboard Settings
                  </div>

                  <div className="border-t border-white/10 my-2"></div>

                  <div className="flex items-center gap-2 px-2 py-2 hover:bg-red-900/30 rounded-md cursor-pointer text-red-400">
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all text-sm font-medium
        ${isActive ? "bg-white/10 text-blue-400" : "text-white/70 hover:bg-white/5 hover:text-white"}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
