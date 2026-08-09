import {
  LayoutDashboard,
  AlertCircle,
  GitBranch,
  Users,
  BarChart3,
  PencilRuler,
  Box,
  FileText,
  Settings,
  LayoutTemplate,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "/assets/default-avatar.svg";
import { useAuth } from "../../context/AuthContext";
import dashboardPic from "../../assets/dashboard_pic.png";

export const nav = {
  workspace: [
    { label: "Overview", icon: LayoutDashboard, view: "overview" },
    { label: "Teams", icon: Users, view: "team" },
    { label: "Issues", icon: AlertCircle, view: "issues" },
    { label: "Chisels", icon: GitBranch, view: "changes" },
    { label: "Analytics", icon: BarChart3, view: "analytics" },
  ],
  tools: [
    { label: "Drawings", icon: PencilRuler, view: "drawings" },
    { label: "3D Viewer", icon: Box, view: "viewer" },
    { label: "Reports", icon: FileText, view: "reports" },
  ],
  config: [
    { label: "Settings", icon: Settings, view: "settings" },
    { label: "Templates", icon: LayoutTemplate, view: "templates" },
  ],
};

function Avatar({ name, size = 36, img }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        style={{ width: size, height: size, fontSize: size / 2.4 }}
        className="rounded-full object-cover shrink-0 bg-slate-200"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-medium shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.4 }}
    >
      {initials}
    </div>
  );
}

function Sidebar({ user, active, onNavigate, projectId }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-white font-bold">
          C
        </div>
        <span className="font-semibold text-lg text-slate-900">Chisel</span>
      </div>

      <div className="flex-1 px-3 py-4 space-y-6">
        <NavSection title="Workspace" items={nav.workspace} active={active} onNavigate={onNavigate} projectId={projectId} />
        <NavSection title="Tools" items={nav.tools} active={active} onNavigate={onNavigate} projectId={projectId} />
        <NavSection title="Config" items={nav.config} active={active} onNavigate={onNavigate} projectId={projectId} />
      </div>

      <div className="px-3 py-2 border-t border-slate-100">
        <button className="w-full h-44 rounded-xl overflow-hidden bg-white flex items-center justify-center">
          <img
            src={dashboardPic}
            alt="Dashboard 3D preview"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      <div className="border-t border-slate-100 p-3">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
          <Avatar name={user?.username || "User"} size={32} img={defaultAvatar} />
          <span className="flex-1 text-left">
            <span className="block text-sm font-medium text-slate-900">
              {user?.username || "User"}
            </span>
            <span className="block text-xs text-slate-400">Project Admin</span>
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </aside>
  );
}

function NavSection({ title, items, active, onNavigate, projectId }) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {title}
      </p>
      <div className="space-y-1">
        {items.map(({ label, icon: Icon, view }) => (
          <button
            key={label}
            onClick={() => onNavigate(label, view, projectId)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              active === label
                ? "bg-amber-50 text-amber-700 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TopBar({ user, projectName, projectId }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const crumbs = [
    {
      label: projectId ? "Projects" : "Home",
      onClick: () => (projectId ? navigate("/projects") : navigate("/")),
    },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
      <Breadcrumbs crumbs={crumbs} projectName={projectName} projectId={projectId} />

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 w-72 px-3 py-2 rounded-lg border border-slate-200 text-slate-400 text-sm">
          <Search size={16} />
          <span className="flex-1">Search anything...</span>
          <kbd className="text-xs border border-slate-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-50">
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100"
          >
            <Avatar name={user?.username || "User"} size={36} img={defaultAvatar} />
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-400">Project Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ crumbs, projectName, projectId }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {crumbs.map((crumb) => (
        <span key={crumb.label} className="flex items-center gap-2">
          <button
            onClick={crumb.onClick}
            className="text-slate-400 hover:text-slate-600"
          >
            {crumb.label}
          </button>
          <ChevronRight size={14} className="text-slate-300" />
        </span>
      ))}
      <span className="font-medium text-slate-900">
        {projectName || "Dashboard"}
      </span>
    </div>
  );
}

export default function DashboardLayout({
  user,
  children,
  active,
  projectId,
  projectName,
}) {
  const navigate = useNavigate();

  const handleNavigate = (label, view, id) => {
    if (!id) {
      navigate("/projects");
      return;
    }
    if (view === "team") {
      navigate(`/team/${id}`);
    } else if (view === "viewer") {
      navigate(`/view3d/${id}`);
    } else if (view === "overview") {
      navigate(`/dashboard/${id}`);
    } else {
      navigate(`/dashboard/${id}?tab=${view}`);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar
        user={user}
        active={active}
        projectId={projectId}
        onNavigate={handleNavigate}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar user={user} projectName={projectName} projectId={projectId} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}