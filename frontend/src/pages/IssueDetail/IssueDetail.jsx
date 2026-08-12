import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Circle,
  Loader2,
  User,
  Briefcase,
  HardHat,
  ShieldCheck,
  Calendar,
  Tag,
  Check,
  Zap,
  Trash2,
} from "lucide-react";
import { api } from "../../api/client";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout.jsx";
import defaultAvatar from "/assets/default-avatar.svg";

const statusMeta = {
  OPEN: { label: "Open", badge: "bg-red-500 hover:bg-red-600", dot: "bg-red-500" },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-amber-500 hover:bg-amber-600",
    dot: "bg-amber-500",
  },
  RESOLVED: {
    label: "Completed",
    badge: "bg-green-500 hover:bg-green-600",
    dot: "bg-green-500",
  },
};

const roleMeta = {
  admin: { label: "Project Admin", icon: ShieldCheck },
  maintainer: { label: "Maintainer", icon: Briefcase },
  worker: { label: "Worker", icon: HardHat },
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

function ProfilePic({ name = "User", size = 44 }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-full overflow-hidden shrink-0 bg-slate-200 flex items-center justify-center text-slate-600 font-medium"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      <img
        src={defaultAvatar}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="sr-only">{initials}</span>
    </div>
  );
}

function findRole(issue, team) {
  if (!issue?.created_by) return null;
  const id = String(issue.created_by._id ?? issue.created_by);
  if (id === String(team?.created_by?._id ?? team?.created_by)) return "admin";
  if ((team?.maintainers || []).some((m) => String(m._id) === id))
    return "maintainer";
  if ((team?.workers || []).some((m) => String(m._id) === id)) return "worker";
  return "maintainer";
}

function DetailRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          tone || "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function CommentsSection({
  comments,
  loading,
  text,
  setText,
  submitting,
  error,
  onAddComment,
  onDeleteComment,
  currentUser,
  isManager,
  onCloseIssue,
  closing,
}) {
  const isOwnComment = (comment) => {
    const myId = String(currentUser?._id || "");
    const authorId = String(comment.created_by?._id ?? (comment.created_by || ""));
    return Boolean(myId) && myId === authorId;
  };

  const closingCommentId = comments.find((c) => c.closes_issue)?._id;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare size={16} className="text-slate-400" />
          Comments ({comments.length})
        </h3>
      </div>

      <div className="p-4 border-b border-slate-100">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Add a comment to this issue..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onAddComment(text)}
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <MessageSquare size={15} />
            )}
            Comment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No comments yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Discussion on this issue will appear here.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-3 border border-slate-200 rounded-xl p-4 bg-white"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-200 flex items-center justify-center">
                  <img
                    src={defaultAvatar}
                    alt={comment.created_by?.username || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {comment.created_by?.username || "Unknown user"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {timeAgo(comment.created_at)}
                      </span>
                      {isOwnComment(comment) && (
                        <button
                          onClick={() => onDeleteComment(comment._id)}
                          className="text-xs text-slate-400 hover:text-red-500"
                          title="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.media_links?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {comment.media_links.map((link, idx) => (
                        <img
                          key={idx}
                          src={link}
                          alt="media"
                          className="rounded-lg border border-slate-200 object-cover w-full h-24"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {isManager &&
                    (String(comment._id) === String(closingCommentId) ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle2 size={14} />
                        Closed this issue
                      </span>
                    ) : !closingCommentId ? (
                      <div className="mt-3">
                        <button
                          onClick={() => onCloseIssue(comment._id)}
                          disabled={Boolean(closing)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {closing === String(comment._id) ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Closes the issue
                        </button>
                      </div>
                    ) : null)}
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}

export default function IssueDetail() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [issue, setIssue] = useState(null);
  const [team, setTeam] = useState(null);
  const [comments, setComments] = useState([]);
  const [isChiseled, setIsChiseled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [actionError, setActionError] = useState("");
  const [error, setError] = useState("");
  const [closingComment, setClosingComment] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("chisel_user") || "null");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!projectId || !issueId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [issuesData, teamData, projectsData, chiselsData] =
          await Promise.all([
            api.getProjectIssues(projectId),
            api.getProjectTeam(projectId),
            api.getProjects(),
            api.getProjectChisels(projectId),
          ]);
        if (cancelled) return;

        const foundIssue = (Array.isArray(issuesData) ? issuesData : []).find(
          (i) => String(i._id) === String(issueId)
        );
        const foundProject = (Array.isArray(projectsData) ? projectsData : []).find(
          (p) => p._id === projectId
        );
        const chisels = Array.isArray(chiselsData) ? chiselsData : [];
        const chiseled = chisels.some(
          (c) => String(c.issue_id) === String(issueId)
        );

        setIssue(foundIssue || null);
        setTeam(teamData || null);
        setIsChiseled(chiseled);
        setProject(
          foundProject
            ? { ...foundProject, name: foundProject.name || foundProject.title }
            : null
        );
        if (!foundIssue) setError("Issue not found.");
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
  }, [projectId, issueId]);

  useEffect(() => {
    let cancelled = false;
    async function loadComments() {
      if (!issueId) return;
      setCommentsLoading(true);
      try {
        const data = await api.getIssueComments(issueId);
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  const isManager = useMemo(() => {
    if (!currentUser?._id || !team) return false;
    const myId = String(currentUser._id);
    const creatorId = String(team?.created_by?._id ?? team?.created_by);
    const maintainers = Array.isArray(team?.maintainers) ? team.maintainers : [];
    const isCreator = creatorId === myId;
    const isMaintainer = maintainers.some((m) => String(m._id) === myId);
    return isCreator || isMaintainer;
  }, [currentUser, team]);

  const handleComplete = async () => {
    if (!projectId || !issueId) return;
    setActing(true);
    setActionError("");
    try {
      const updated = await api.editIssue({
        issueId,
        projectId,
        status: "RESOLVED",
      });
      setIssue((prev) => ({ ...prev, status: updated?.status ?? "RESOLVED" }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleChisel = async () => {
    if (!projectId || !issueId) return;
    setActing(true);
    setActionError("");
    try {
      await api.createChisel({ projectId, issueId });
      setIsChiseled(true);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content) return;
    setCommentSubmitting(true);
    setCommentError("");
    try {
      await api.createComment({ issueId, content });
      setCommentText("");
      const data = await api.getIssueComments(issueId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentError("");
    try {
      await api.deleteComment(commentId);
      setComments((prev) =>
        prev.filter((c) => String(c._id) !== String(commentId))
      );
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const handleCloseIssue = async (commentId) => {
    if (!projectId) return;
    setCommentError("");
    setClosingComment(commentId);
    try {
      await api.closeIssueWithComment(projectId, commentId);
      const data = await api.getIssueComments(issueId);
      setComments(Array.isArray(data) ? data : []);
      setIssue((prev) => ({ ...prev, status: "RESOLVED" }));
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setClosingComment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const role = findRole(issue, team);
  const meta = statusMeta[issue?.status] || statusMeta.OPEN;
  const roleInfo = roleMeta[role] || { label: "Team Member", icon: User };

  const creatorName =
    issue?.created_by?.username ||
    (typeof issue?.created_by === "string"
      ? issue.created_by
      : undefined) ||
    (String(issue?.created_by) === String(currentUser?._id)
      ? currentUser?.username
      : "Unknown user");

  const assigneeName = issue?.assigned_to?.username || "Unassigned";

  return (
    <DashboardLayout
      user={currentUser}
      active="Issues"
      projectId={projectId}
      projectName={project?.name || "Dashboard"}
    >
      <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() =>
            projectId
              ? navigate(`/dashboard/${projectId}?tab=issues`)
              : navigate(-1)
          }
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Issues
        </button>
      </div>

      <main className="flex-1 min-h-0">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : !issue ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Tag size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Issue not found
            </h3>
            <p className="mt-1 text-slate-500 text-sm max-w-sm">
              This issue doesn't exist or you don't have access to it.
            </p>
            <Link
              to={`/dashboard/${projectId}?tab=issues`}
              className="mt-5 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
            >
              Back to Issues
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="flex flex-wrap items-center gap-4 mb-5 shrink-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {issue.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {creatorName} opened this issue{" "}
                  {timeAgo(issue.created_at)}
                </p>
              </div>
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${meta.badge}`}
              >
                <span className={`w-2 h-2 rounded-full bg-white/90`} />
                {meta.label}
              </button>
            </div>

            {isManager && (
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-amber-200 bg-amber-50 shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">
                    Manager actions
                  </p>
                  <p className="text-xs text-amber-700">
                    {issue.status === "RESOLVED"
                      ? isChiseled
                        ? "This issue has been chiseled."
                        : "Issue is complete. Chisel the work to record it."
                      : "Mark the issue as completed to start recording work."}
                  </p>
                </div>
                {actionError && (
                  <p className="w-full text-xs text-red-600">{actionError}</p>
                )}
                <div className="flex items-center gap-2">
                  {issue.status !== "RESOLVED" ? (
                    <button
                      onClick={handleComplete}
                      disabled={acting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      Mark Completed
                    </button>
                  ) : null}
                  {!isChiseled ? (
                    <button
                      onClick={handleChisel}
                      disabled={acting || issue.status !== "RESOLVED"}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                    >
                      {acting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Zap size={15} />
                      )}
                      Chisel the Work
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                      <Check size={15} />
                      Chiseled
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 flex-1 min-h-0">
              <div className="flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                <article className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${meta.dot}`}
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-200 flex items-center justify-center">
                        <img
                          src={defaultAvatar}
                          alt={creatorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {creatorName}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <roleInfo.icon size={12} />
                          <span>{roleInfo.label}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      #{issue._id?.slice(-5, -1)?.toUpperCase() || "Issue"}
                    </span>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {issue.description || "No description provided."}
                    </p>
                    {issue.image_link && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={issue.image_link}
                          alt={issue.title}
                          className="w-full max-h-[480px] object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare size={14} />
                      {issue.comment_count || 0} comments
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      Created {timeAgo(issue.created_at)}
                    </span>
                  </div>
                </article>

                <CommentsSection
                  comments={comments}
                  loading={commentsLoading}
                  text={commentText}
                  setText={setCommentText}
                  submitting={commentSubmitting}
                  error={commentError}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  currentUser={currentUser}
                  isManager={isManager}
                  onCloseIssue={handleCloseIssue}
                  closing={closingComment}
                />
                </div>
              </div>

              <aside className="bg-white border border-slate-200 rounded-xl h-fit">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">
                    Details
                  </p>
                </div>
                <DetailRow
                  icon={User}
                  label="Created by"
                  value={creatorName}
                  tone="bg-amber-50 text-amber-600"
                />
                <DetailRow
                  icon={roleInfo.icon}
                  label="Designation"
                  value={roleInfo.label}
                  tone="bg-violet-50 text-violet-600"
                />
                <DetailRow
                  icon={User}
                  label="Assigned to"
                  value={assigneeName}
                  tone="bg-blue-50 text-blue-600"
                />
                <DetailRow
                  icon={meta.dot.includes("green") ? CheckCircle2 : Circle}
                  label="Status"
                  value={meta.label}
                  tone={
                    meta.dot.includes("green")
                      ? "bg-green-50 text-green-600"
                      : meta.dot.includes("amber")
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-600"
                  }
                />
                <DetailRow
                  icon={Briefcase}
                  label="Project"
                  value={project?.name || "-"}
                  tone="bg-slate-100 text-slate-500"
                />
              </aside>
            </div>
          </div>
        )}
      </main>
      </div>
    </DashboardLayout>
  );
}