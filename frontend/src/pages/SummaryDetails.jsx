import { ArrowLeft, Check, Copy, Download, Edit3, LoaderCircle, Save, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import PrivateNavbar from "../components/PrivateNavbar";
import "../styles/overrides.css";

function SummaryDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bulletPoints, setBulletPoints] = useState(null);
  const [genBullets, setGenBullets] = useState(false);

  useEffect(() => {
    api
      .get(`summaries/${id}/`)
      .then(({ data }) => {
        setItem(data);
        setTitle(data.title);
      })
      .catch((requestError) =>
        setError(
          requestError.response?.status === 404
            ? "This summary no longer exists."
            : "We could not load this summary."
        )
      );
  }, [id]);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`summaries/${id}/`, { title: title.trim() });
      setItem(data);
      setEditing(false);
    } catch {
      setError("The title could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(item.summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const generateBullets = async () => {
    if (bulletPoints) {
      setBulletPoints(null);
      return;
    }
    setGenBullets(true);
    try {
      const { data } = await api.post(`summaries/${id}/key-points/`);
      setBulletPoints(data.key_points);
    } catch {
      setError("Could not generate bullet points.");
    } finally {
      setGenBullets(false);
    }
  };

  const download = () => {
    const link = document.createElement("a");
    let content = `${item.title}\n\n${item.summary}`;
    if (bulletPoints) {
      content += "\n\nKey Points:\n" + bulletPoints.map((b) => `• ${b}`).join("\n");
    }
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    link.download = `${item.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "summary"}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (error)
    return (
      <div className="app-page">
        <PrivateNavbar />
        <main className="page-wrap details-state">
          <h1>{error}</h1>
          <Link className="button button-primary" to="/dashboard">
            Back to library
          </Link>
        </main>
      </div>
    );
  if (!item)
    return (
      <div className="app-page">
        <PrivateNavbar />
        <main className="page-wrap details-state">
          <LoaderCircle className="spin" /> Loading summary…
        </main>
      </div>
    );
  return (
    <div className="app-page">
      <PrivateNavbar />
      <main className="page-wrap details-page">
        <Link className="back-link" to="/dashboard">
          <ArrowLeft size={16} /> Back to library
        </Link>
        <div className="details-toolbar">
          <div>
            {editing ? (
              <input
                className="title-editor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <h1>{item.title}</h1>
            )}
            <p>
              Generated{" "}
              {new Date(item.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              and saved to your library
            </p>
          </div>
          <div className="details-actions">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setTitle(item.title);
                    setEditing(false);
                  }}
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  className="action-primary"
                  disabled={saving}
                  onClick={save}
                >
                  <Save size={16} /> {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}>
                  <Edit3 size={16} /> Edit title
                </button>
                <button onClick={copy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={download}>
                  <Download size={16} /> Download
                </button>
              </>
            )}
          </div>
        </div>
        <article className="summary-document">
          <div className="document-label">Summary</div>
          <p>{item.summary}</p>
        </article>

        {bulletPoints && (
          <section className="bullet-points-section">
            <div className="bullet-section-header">
              <h3>Key Points</h3>
              <button className="close-bullets" onClick={() => setBulletPoints(null)}>
                <X size={16} />
              </button>
            </div>
            <ul className="bullet-list">
              {bulletPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </section>
        )}
        <button
          className="button button-secondary"
          onClick={generateBullets}
          disabled={genBullets}
          style={{ marginBottom: "24px" }}
        >
          {genBullets ? (
            <>
              <LoaderCircle className="spin" size={16} /> Generating…
            </>
          ) : bulletPoints ? (
            <>
              <X size={16} /> Hide key points
            </>
          ) : (
            <>
              <Sparkles size={16} /> Create key points
            </>
          )}
        </button>

        <section className="source-disclosure">
          <button
            type="button"
            onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
          >
            View source material <span>+</span>
          </button>
          <div>
            <p>{item.original_text}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
export default SummaryDetails;
