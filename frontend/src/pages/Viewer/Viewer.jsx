import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, UploadCloud, Box, ImageUp } from "lucide-react";
import { api } from "../../api/client";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout.jsx";
import ThreeDModelViewer from "../../components/ThreeDModelViewer/ThreeDModelViewer.jsx";
import { useAuth } from "../../context/AuthContext";

export default function Viewer() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blueprint, setBlueprint] = useState(null);
  const [project, setProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const blueprint_json = blueprint?.blueprint_json;
  const hasModel = Boolean(
    blueprint_json &&
      ((Array.isArray(blueprint_json.walls) && blueprint_json.walls.length > 0) ||
        (Array.isArray(blueprint_json.rooms) && blueprint_json.rooms.length > 0))
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const projects = await api.getProjects();
        const found = (Array.isArray(projects) ? projects : []).find(
          (p) => p._id === projectId
        );
        if (!cancelled) setProject(found || null);

        try {
          const bp = await api.getProjectBlueprint(projectId);
          if (!cancelled) setBlueprint(bp);
        } catch (e) {
          if (e.status === 404) {
            if (!cancelled) setBlueprint(null);
          } else {
            throw e;
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadBlueprint(projectId, file);
      const bp = await api.getProjectBlueprint(projectId);
      setBlueprint(bp);
      setFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleConvert() {
    if (!blueprint?.original_image) return;
    setUploading(true);
    setError(null);
    try {
      await api.convertBlueprint({
        projectId,
        imageUrl: blueprint.original_image,
      });
      const bp = await api.getProjectBlueprint(projectId);
      setBlueprint(bp);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardLayout
      user={user}
      active="3D Viewer"
      projectId={projectId}
      projectName={project?.name || "3D Viewer"}
    >
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <button
            onClick={() =>
              projectId
                ? navigate(`/dashboard/${projectId}`)
                : navigate(-1)
            }
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <main className="flex-1 min-h-0 p-6 bg-slate-900 flex flex-col">
          <div className="shrink-0 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">3D Model</h1>
              <p className="text-sm text-slate-400">
                {project?.name || "Project"} — interactive Three.js preview
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : hasModel ? (
            <div className="flex-1 min-h-0 bg-slate-800 rounded-xl overflow-hidden">
              <ThreeDModelViewer
                blueprint={blueprint_json}
                height="100%"
              />
            </div>
          ) : blueprint?.original_image ? (
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
                <h2 className="text-lg font-semibold text-white">
                  Blueprint uploaded
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Convert it into a 3D model to render it here.
                </p>

                {error && (
                  <div className="mt-4 text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={blueprint.original_image}
                    alt="Blueprint"
                    className="w-full max-h-72 object-contain"
                  />
                </div>

                <button
                  onClick={handleConvert}
                  disabled={uploading}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Box size={16} />
                  )}
                  {uploading
                    ? "Converting to 3D..."
                    : "Convert to 3D"}
                </button>
                {uploading && (
                  <p className="mt-2 text-xs text-slate-500">
                    AI is analyzing the floor plan — this can take up to a
                    minute.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-700 flex items-center justify-center mb-4">
                  <Box size={28} className="text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  No 3D model yet
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Upload a construction blueprint image to generate a 3D model
                  for this project.
                </p>

                {error && (
                  <div className="mt-4 text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <label className="mt-6 w-full flex flex-col items-center gap-2 border border-dashed border-slate-600 hover:border-amber-400 rounded-xl px-4 py-8 cursor-pointer text-slate-400 hover:text-amber-400 transition-colors">
                  <ImageUp size={28} />
                  <span className="text-sm font-medium">
                    {file ? file.name : "Click to choose a blueprint image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      setError(null);
                    }}
                  />
                </label>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UploadCloud size={16} />
                  )}
                  {uploading
                    ? "Uploading..."
                    : "Upload blueprint"}
                </button>
                {uploading && (
                  <p className="mt-2 text-xs text-slate-500">
                    Uploading your blueprint image...
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}