import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Briefcase,
  HardHat,
  Loader2,
  Inbox,
} from "lucide-react";
import { api } from "../../api/client";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout.jsx";

function Avatar({ name, size = 44, role }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const toneByRole = {
    admin: "bg-amber-100 text-amber-700",
    maintainer: "bg-violet-100 text-violet-700",
    worker: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-medium shrink-0 ${toneByRole[role] || "bg-slate-200 text-slate-600"}`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials}
    </div>
  );
}

const roleMeta = {
  admin: { label: "Project Admin", icon: ShieldCheck, tone: "bg-amber-50 text-amber-600" },
  maintainer: { label: "Maintainer", icon: Briefcase, tone: "bg-violet-50 text-violet-600" },
  worker: { label: "Worker", icon: HardHat, tone: "bg-blue-50 text-blue-600" },
};

function MemberCard({ member, role, currentUserId }) {
  const meta = roleMeta[role];
  const isYou = String(member._id) === String(currentUserId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar name={member.username || "User"} role={role} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate flex items-center gap-2">
            {member.username || "Unknown user"}
            {isYou && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                You
              </span>
            )}
          </p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.tone}`}
          >
            <meta.icon size={13} />
            {meta.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function TeamSection({ title, icon: Icon, members, role, currentUser }) {
  if (members.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-slate-400" />
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {members.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard
            key={String(member._id)}
            member={member}
            role={role}
            currentUser={currentUser}
          />
        ))}
      </div>
    </section>
  );
}

export default function Team() {
  const { projectId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("chisel_user") || "null");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!projectId) {
        setLoading(false);
        setTeam(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await api.getProjectTeam(projectId);
        if (!cancelled) setTeam(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const admin = team?.created_by ? [team.created_by] : [];
  const maintainers = Array.isArray(team?.maintainers) ? team.maintainers : [];
  const workers = Array.isArray(team?.workers) ? team.workers : [];
  const total = admin.length + maintainers.length + workers.length;

  return (
    <DashboardLayout
      user={currentUser}
      active="Teams"
      projectId={projectId}
      projectName={team?.title || undefined}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users size={24} className="text-slate-500" />
            Team
          </h1>
          {!loading && !error && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              {total} member{total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
          title="Inviting teammates is coming soon"
        >
          <UserPlus size={16} />
          Add teammate
        </button>
      </div>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : !team ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Inbox size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Select a project
            </h3>
            <p className="mt-1 text-slate-500 text-sm max-w-sm">
              Open a project from your workspace to view the people working on it.
            </p>
            <Link
              to="/projects"
              className="mt-5 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
            >
              Go to Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  No teammates yet
                </h3>
                <p className="mt-1 text-slate-500 text-sm max-w-sm">
                  This project has no users assigned yet. Add your first teammate
                  to start collaborating.
                </p>
              </div>
            ) : (
              <>
                <TeamSection
                  title="Project Admin"
                  icon={ShieldCheck}
                  members={admin}
                  role="admin"
                  currentUser={currentUser?._id}
                />
                <TeamSection
                  title="Maintainers"
                  icon={Briefcase}
                  members={maintainers}
                  role="maintainer"
                  currentUser={currentUser?._id}
                />
                <TeamSection
                  title="Workers"
                  icon={HardHat}
                  members={workers}
                  role="worker"
                  currentUser={currentUser?._id}
                />
              </>
            )}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}