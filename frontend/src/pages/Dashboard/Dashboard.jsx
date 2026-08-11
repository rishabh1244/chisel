import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  AlertCircle,
  GitBranch,
  Box,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Inbox,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { sampleImageFor } from "../../utils/sampleImages";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout.jsx";
import { UploadCloud, X, ImagePlus, Plus } from "lucide-react";

const tabs = ["Overview", "Issues", "Chisels", "Files", "Team", "Settings"];

// ------------------------------- HELPERS ------------------------------------

const toneClasses = {
  danger: "bg-red-50 text-red-600",
  success: "bg-green-50 text-green-600",
  muted: "bg-slate-100 text-slate-500",
  purple: "bg-violet-50 text-violet-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
};

function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

function Donut({ data, size = 130, thickness = 18 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
      </g>
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        className="fill-slate-900"
        style={{ fontSize: size / 5.2, fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        className="fill-slate-400"
        style={{ fontSize: size / 11 }}
      >
        Total
      </text>
    </svg>
  );
}

// ------------------------------- SUBCOMPONENTS ------------------------------

const projectStatusLabel = {
  inProgress: "In Progress",
  active: "Active",
  onHold: "On Hold",
  planning: "Planning",
  completed: "Completed",
};

function ProjectHeader({ project, progress }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-white border-b border-slate-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
            {projectStatusLabel[project.status] || project.status || "Active"}
          </span>
        </div>
        <p className="mt-2 text-slate-500 max-w-md">
          {project.description || "No description provided"}
        </p>

        <div className="mt-6 flex flex-wrap gap-8">
          <MetaItem
            label="Created"
            value={
              project.created_at
                ? new Date(project.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-"
            }
          />
          {project.targetDate && (
            <MetaItem label="Target Date" value={project.targetDate} />
          )}
          <div>
            <p className="text-xs text-slate-400 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {progress}%
              </span>
              <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Link
          to={`/view3d/${project._id}`}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Box size={16} />
          3D View
        </Link>
      </div>

      <div className="relative w-full lg:w-[420px] h-56 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        <img
          src={sampleImageFor(project)}
          alt="Project 3D preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
          <Box size={16} />
          3D Viewer
        </div>
        <button className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
          Actions
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Tabs({ active, onChange, issuesCount }) {
  return (
    <div className="flex items-center gap-8 px-6 border-b border-slate-200 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative py-3 text-sm font-medium flex items-center gap-2 ${
            active === tab
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {tab}
          {tab === "Issues" && issuesCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {issuesCount}
            </span>
          )}
          {active === tab && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

function StatCards({ issues }) {
  const openCount = issues.filter((i) => i.status === "OPEN").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

  const statCards = [
    {
      label: "Open Issues",
      value: openCount,
      sub: "Needs attention",
      icon: AlertCircle,
      iconTone: "danger",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      sub: "Being worked on",
      icon: GitBranch,
      iconTone: "purple",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      sub: "Closed issues",
      icon: CheckCircle2,
      iconTone: "success",
    },
    {
      label: "Total Issues",
      value: issues.length,
      sub: "All issues",
      icon: LayoutDashboard,
      iconTone: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards.map(({ label, value, sub, icon: Icon, iconTone }) => (
        <div
          key={label}
          className="bg-white border border-slate-200 rounded-xl p-5"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${toneClasses[iconTone]}`}
            >
              <Icon size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-slate-400">{sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentChanges({ chisels, projectId }) {
  if (chisels.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Changes</h3>
          <button className="text-sm text-slate-400 hover:text-slate-600">
            View All
          </button>
        </div>
        <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <GitBranch size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No changes yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Chiseled issues and changes will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Recent Changes</h3>
        <Link
          to={`/dashboard/${projectId}?tab=chisels`}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          View All
        </Link>
      </div>
      <div className="p-2 divide-y divide-slate-100">
        {chisels.slice(0, 5).map((chisel) => {
          const meta = chiselStatusMeta[chisel.status] || chiselStatusMeta.PENDING;
          return (
            <Link
              key={chisel._id}
              to={`/issue/${projectId}/${chisel.issue_id}`}
              className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 transition-all"
            >
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {chisel.title}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Chiseled by{" "}
                  {chisel.commit_author?.username || "Manager"} ·{" "}
                  {timeAgo(chisel.committed_at)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ProjectActivity({ issues }) {
  if (issues.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Project Activity</h3>
        </div>
        <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-700">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Issue and change activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  const activity = issues.slice(0, 8).map((issue) => ({
    person: issue.created_by?.username || "Someone",
    action: "created an issue",
    refTag:
      issueStatusMeta[issue.status]?.label ||
      issueStatusMeta.OPEN.label,
    refText: issue.title,
    refTone:
      issue.status === "RESOLVED"
        ? "success"
        : issue.status === "IN_PROGRESS"
        ? "amber"
        : "danger",
    time: timeAgo(issue.created_at),
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Project Activity</h3>
        <button className="flex items-center gap-1 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5">
          Filter
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="px-5 py-2">
        {activity.map((item, i) => (
          <div key={i} className="flex gap-3 py-3">
            <div className="flex flex-col items-center">
              <span
                className={`w-2 h-2 rounded-full mt-2 ${
                  item.refTone === "danger"
                    ? "bg-red-500"
                    : item.refTone === "success"
                    ? "bg-green-500"
                    : item.refTone === "amber"
                    ? "bg-amber-500"
                    : "bg-blue-500"
                }`}
              />
              {i !== activity.length - 1 && (
                <span className="flex-1 w-px bg-slate-100 mt-1" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{item.person}</span>{" "}
                {item.action}
                <span className="float-right text-xs text-slate-400">
                  {item.time}
                </span>
              </p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {item.refTag && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${toneClasses[item.refTone]}`}
                  >
                    {item.refTag}
                  </span>
                )}
                <span className="text-sm text-slate-500">{item.refText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4">
        <button className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
          View All Activity
        </button>
      </div>
    </div>
  );
}

function AssignedToMe({ issues }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Assigned to me</h3>
        <button className="text-sm text-slate-400 hover:text-slate-600">
          View All
        </button>
      </div>
      {issues.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          Nothing assigned to you yet.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {issues.map((issue) => (
            <div key={issue._id} className="flex items-start gap-3 py-3">
              <Avatar name={issue.title} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 truncate">
                    {issue.title}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      issueStatusMeta[issue.status]?.badge ||
                      issueStatusMeta.OPEN.badge
                    }`}
                  >
                    {issueStatusMeta[issue.status]?.label ||
                      issueStatusMeta.OPEN.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {issue.title}
                </p>
                <p className="text-xs text-slate-400">
                  Created {timeAgo(issue.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IssueStats({ issues }) {
  const openCount = issues.filter((i) => i.status === "OPEN").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;
  const data = [
    { label: "Open", value: openCount, color: "#EF4444" },
    { label: "In Progress", value: inProgressCount, color: "#F59E0B" },
    { label: "Resolved", value: resolvedCount, color: "#22C55E" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Issue Stats</h3>
      <div className="flex items-center gap-6">
        <Donut data={data} />
        <div className="space-y-2">
          {data.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-500">{s.label}</span>
              <span className="font-medium text-slate-900">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const WEATHER_LOCATION = { name: "Sindri", lat: 23.75, lon: 86.48 };

function weatherIcon(code) {
  if (code <= 1) return { icon: "☀️", label: "Clear sky" };
  if (code <= 3) return { icon: "🌤️", label: "Partly cloudy" };
  if (code <= 48) return { icon: "🌫️", label: "Foggy" };
  if (code <= 55) return { icon: "🌧️", label: "Drizzle" };
  if (code <= 65) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code <= 82) return { icon: "🌦️", label: "Showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

function WeatherForecast({ location = WEATHER_LOCATION }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lat = location?.lat ?? WEATHER_LOCATION.lat;
  const lon = location?.lon ?? WEATHER_LOCATION.lon;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=4&timezone=auto`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return;
        const daily = data.daily || {};
        const parsed = (daily.time || []).map((date, i) => {
          const d = new Date(date);
          const dateStr = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
          const weather = weatherIcon(daily.weather_code?.[i] ?? 0);
          return {
            dateStr,
            date: d.getDate(),
            ...weather,
            max: Math.round(daily.temperature_2m_max?.[i] ?? 0),
            min: Math.round(daily.temperature_2m_min?.[i] ?? 0),
            precip: daily.precipitation_probability_max?.[i] ?? 0,
            wind: Math.round(daily.wind_speed_10m_max?.[i] ?? 0),
          };
        });
        setDays(parsed);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Weather</h3>
        <span className="text-xs text-slate-400">{location?.name ?? "Sindri"}</span>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Loader2 size={20} className="animate-spin text-slate-300" />
          <p className="mt-2 text-xs text-slate-400">Loading forecast...</p>
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-slate-600">Unable to load weather</p>
          <p className="mt-1 text-xs text-slate-400">
            Check your internet connection and try again.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                i === 0 ? "bg-amber-50 border border-amber-100" : "bg-slate-50"
              }`}
            >
              <div className="w-14 shrink-0">
                <p className="text-sm font-medium text-slate-900">{day.dateStr}</p>
                <p className="text-xs text-slate-400">{day.label}</p>
              </div>
              <div className="flex-1 text-xl text-center">{day.icon}</div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">
                  {day.max}° <span className="text-slate-400">{day.min}°</span>
                </p>
                <p className="text-xs text-slate-400">
                  🌧️ {day.precip}% · 💨 {day.wind} km/h
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, message, cta, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-slate-500 text-sm max-w-sm">{message}</p>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-5 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

const issueStatusMeta = {
  OPEN: { label: "Pending", badge: "bg-red-50 text-red-600", dot: "bg-red-500" },
  IN_PROGRESS: { label: "In Progress", badge: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  RESOLVED: { label: "Completed", badge: "bg-green-50 text-green-600", dot: "bg-green-500" },
};

function IssueList({ issues, projectId }) {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const meta = issueStatusMeta[issue.status] || issueStatusMeta.OPEN;
        return (
          <Link
            key={issue._id}
            to={`/issue/${projectId}/${issue._id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900 truncate">
                  {issue.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>
              {issue.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {issue.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>
                  Created by {issue.created_by?.username || "Someone"}
                </span>
                <span>
                  Assigned to {issue.assigned_to?.username || "Unassigned"}
                </span>
                <span>{timeAgo(issue.created_at)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const chiselStatusMeta = {
  PENDING: { label: "Pending", badge: "bg-slate-50 text-slate-600" },
  APPROVED: { label: "Approved", badge: "bg-green-50 text-green-600" },
  REJECTED: { label: "Rejected", badge: "bg-red-50 text-red-600" },
};

function ChiselList({ chisels, projectId }) {
  if (chisels.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Chisels</h3>
        </div>
        <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <GitBranch size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            No chisels yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Completed issues will appear here once they are chiseled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chisels.map((chisel) => {
        const meta = chiselStatusMeta[chisel.status] || chiselStatusMeta.PENDING;
        return (
          <Link
            key={chisel._id}
            to={`/issue/${projectId}/${chisel.issue_id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900 truncate">
                  {chisel.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>
              {chisel.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {chisel.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>
                  Chiseled by {chisel.commit_author?.username || "Manager"}
                </span>
                <span>
                  {chisel.comment_count || 0} comment
                  {chisel.comment_count === 1 ? "" : "s"}
                </span>
                <span>{timeAgo(chisel.committed_at)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ------------------------------- CREATE ISSUE ------------------------------

function CreateIssueModal({ open, onClose, projectId, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setError(null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.createIssueWithImage({
        projectId,
        title: title.trim(),
        description: description.trim(),
        image,
      });
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Create Issue</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix leaking roof"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the problem or required work..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-6 cursor-pointer text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-colors">
                <ImagePlus size={24} />
                <span className="text-sm">Click to attach an image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UploadCloud size={16} />
              )}
              {submitting ? "Creating..." : "Create issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------- MAIN PAGE ----------------------------------

export default function Dashboard() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const resolveTab = (param) => {
    if (!param) return "Overview";
    if (
      param.toLowerCase() === "chisels" ||
      param.toLowerCase() === "changes"
    )
      return "Chisels";
    const cap = capitalize(param);
    return tabs.includes(cap) ? cap : "Overview";
  };

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState(resolveTab(initialTab));

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get("tab")));
  }, [searchParams]);
  const [currentProject, setCurrentProject] = useState(
    location.state?.project || null
  );
  const [loading, setLoading] = useState(
    Boolean(projectId && !location.state?.project)
  );
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [chisels, setChisels] = useState([]);
  const [chiselsLoading, setChiselsLoading] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [issuesRefreshKey, setIssuesRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!projectId || location.state?.project) return;
      setLoading(true);
      try {
        const data = await api.getProjects();
        const found = (Array.isArray(data) ? data : []).find(
          (p) => p._id === projectId
        );
        if (!cancelled) {
          setCurrentProject(found || null);
        }
      } catch {
        if (!cancelled) {
          setCurrentProject(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, location.state?.project]);

  useEffect(() => {
    let cancelled = false;
    async function loadIssues() {
      if (!currentProject?._id) return;
      setIssuesLoading(true);
      try {
        const data = await api.getProjectIssues(currentProject._id);
        if (!cancelled) setIssues(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setIssues([]);
      } finally {
        if (!cancelled) setIssuesLoading(false);
      }
    }
    loadIssues();
    return () => {
      cancelled = true;
    };
  }, [currentProject?._id, issuesRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    async function loadChisels() {
      if (!currentProject?._id) return;
      setChiselsLoading(true);
      try {
        const data = await api.getProjectChisels(currentProject._id);
        if (!cancelled) setChisels(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setChisels([]);
      } finally {
        if (!cancelled) setChiselsLoading(false);
      }
    }
    loadChisels();
    return () => {
      cancelled = true;
    };
  }, [currentProject?._id]);

  const handleSelectProject = () => {
    navigate("/projects");
  };

  const handleTabChange = (tab) => {
    if (tab === "Team") {
      if (displayProject?._id) {
        navigate(`/team/${displayProject._id}`);
        return;
      }
    }
    setActiveTab(tab);
  };

  const displayProject = currentProject
    ? { ...currentProject, name: currentProject.name || currentProject.title }
    : null;

  const activeTabMapped = tabs.includes(activeTab) ? activeTab : "Overview";
  const sidebarLabelMap = {
    team: "Teams",
    changes: "Chisels",
    viewer: "3D Viewer",
    analytics: "Analytics",
    drawings: "Drawings",
    reports: "Reports",
    settings: "Settings",
    templates: "Templates",
  };
  const sidebarActive = initialTab
    ? sidebarLabelMap[initialTab] || activeTabMapped
    : "Overview";

  const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;
  const progress = issues.length
    ? Math.round((resolvedCount / issues.length) * 100)
    : displayProject?.progress || 0;

  const assignedToMe = issues.filter((issue) => {
    const assignee = issue.assigned_to?._id ?? issue.assigned_to;
    return assignee && String(assignee) === String(user?._id);
  });

  if (loading || issuesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user}
      active={sidebarActive}
      projectId={displayProject?._id}
      projectName={displayProject?.name || "Dashboard"}
    >
      {!displayProject ? (
        <div className="p-6">
          <EmptyState
            title="Select a project"
            message="Pick a project from your workspace to view its dashboard, issues and activity."
            cta="Go to Projects"
            onCta={handleSelectProject}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <ProjectHeader project={displayProject} progress={progress} />
            <Tabs
              active={activeTab}
              onChange={handleTabChange}
              issuesCount={issues.length}
            />

            <div className="p-6 space-y-6">
              {issues.length === 0 && activeTab !== "Issues" ? (
                <EmptyState
                  title="No issues yet"
                  message="Create the first issue to start tracking problems, changes and project activity."
                />
              ) : activeTab === "Issues" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Issues
                      {issues.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          {issues.length} total
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowCreateIssue(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                    >
                      <Plus size={16} />
                      New Issue
                    </button>
                  </div>
                  {issues.length === 0 ? (
                    <EmptyState
                      title="No issues yet"
                      message="Create the first issue to start tracking problems, changes and project activity."
                      cta="Create an issue"
                      onCta={() => setShowCreateIssue(true)}
                    />
                  ) : (
                    <IssueList issues={issues} projectId={displayProject._id} />
                  )}
                </div>
              ) : activeTab === "Chisels" ? (
                <ChiselList
                  chisels={chisels}
                  projectId={displayProject._id}
                />
              ) : (
                <>
                  <StatCards issues={issues} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentChanges chisels={chisels} projectId={displayProject._id} />
                    <ProjectActivity issues={issues} />
                  </div>
                </>
              )}
            </div>
          </div>

          {issues.length > 0 && (
            <div className="p-6 space-y-6 border-l border-slate-200 bg-slate-50">
              <AssignedToMe issues={assignedToMe} />
              <IssueStats issues={issues} />
              <WeatherForecast />
            </div>
          )}
        </div>
      )}

      <CreateIssueModal
        open={showCreateIssue}
        onClose={() => setShowCreateIssue(false)}
        projectId={displayProject?._id}
        onCreated={() => {
          setShowCreateIssue(false);
          setIssuesRefreshKey((k) => k + 1);
        }}
      />
    </DashboardLayout>
  );
}
