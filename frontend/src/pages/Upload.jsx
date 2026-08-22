import {
    ArrowLeft,
    FileUp,
    LoaderCircle,
    Sparkles,
    Trash2,
} from "lucide-react";

import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import PrivateNavbar from "../components/PrivateNavbar";

export default function Upload() {
    const [notes, setNotes] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const input = useRef(null);
    const navigate = useNavigate();

    const clear = () => {
        setNotes("");
        setFile(null);
        setError("");

        if (input.current) {
            input.current.value = "";
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;

        setError("");
        setFile(selectedFile);

        console.log("Selected file:", selectedFile);
        console.log("File name:", selectedFile?.name);
        console.log("File type:", selectedFile?.type);
        console.log("File size:", selectedFile?.size);
    };

    const submit = async (event) => {
        event.preventDefault();

        setError("");

        if (!notes.trim() && !file) {
            setError("Add notes or choose a document first.");
            return;
        }

        setLoading(true);

        try {
            const body = new FormData();

            if (notes.trim()) {
                body.append("notes", notes.trim());
            }

            if (file) {
                body.append("notes_file", file);
            }

            console.log("Sending summary request...");
            console.log("API URL:", api.defaults.baseURL);
            console.log("File:", file?.name);
            console.log("File size:", file?.size);
            console.log("Has notes:", Boolean(notes.trim()));

            const response = await api.post(
                "generate-summary/",
                body,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Summary response:", response.data);

            if (!response.data?.id) {
                throw new Error(
                    "The server generated a response but did not return a summary ID."
                );
            }

            navigate(`/summaries/${response.data.id}`);
        } catch (err) {
            console.error("SUMMARY GENERATION ERROR:", err);

            const serverError = err.response?.data?.error;

            if (serverError) {
                setError(serverError);
            } else if (err.response?.status === 400) {
                setError(
                    "The server could not extract text from this document. Try another PDF or paste the text manually."
                );
            } else if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please sign in again."
                );
            } else if (err.response?.status === 503) {
                setError(
                    serverError ||
                    "The AI summary service is temporarily unavailable. Please try again."
                );
            } else {
                setError(
                    "Your summary could not be created. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-page">
            <PrivateNavbar />

            <main className="page-wrap editor-page">

                <Link
                    className="back-link"
                    to="/dashboard"
                >
                    <ArrowLeft size={16} />
                    Back to history
                </Link>

                <header className="editor-heading">
                    <div>
                        <p className="eyebrow">
                            Create a summary
                        </p>

                        <h1>
                            What would you like to understand better?
                        </h1>

                        <p>
                            Add a document, paste your material, or use both.
                            Your summary is saved when it is ready.
                        </p>
                    </div>
                </header>

                <form
                    className="editor-grid"
                    onSubmit={submit}
                >

                    <section className="editor-card">

                        <div className="card-heading">
                            <h2>Your material</h2>

                            <p>
                                Choose the format that feels easiest.
                            </p>
                        </div>

                        <label className="upload-drop">

                            <FileUp size={24} />

                            <strong>
                                {file
                                    ? file.name
                                    : "Choose a document"}
                            </strong>

                            <span>
                                PDF, DOCX, TXT, CSV, Markdown,
                                HTML, and code files
                            </span>

                            {file && (
                                <small>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                            )}

                            <input
                                ref={input}
                                type="file"
                                accept="
                                    .pdf,
                                    .docx,
                                    .txt,
                                    .md,
                                    .csv,
                                    .json,
                                    .html,
                                    .htm,
                                    .js,
                                    .jsx,
                                    .ts,
                                    .tsx,
                                    .py,
                                    .java,
                                    .c,
                                    .cpp,
                                    .cs,
                                    .php,
                                    .rb,
                                    .go,
                                    .rs,
                                    .xml,
                                    .yaml,
                                    .yml,
                                    .log
                                "
                                onChange={handleFileChange}
                            />

                        </label>

                        <div className="editor-divider">
                            <span>
                                or paste your notes
                            </span>
                        </div>

                        <textarea
                            value={notes}
                            onChange={(e) => {
                                setNotes(e.target.value);
                                setError("");
                            }}
                            placeholder="Paste the content you want to turn into a clear summary…"
                        />

                        <div className="editor-meta">

                            <span>
                                {notes
                                    .trim()
                                    .length
                                    .toLocaleString()}{" "}
                                characters
                            </span>

                            {(notes || file) && (
                                <button
                                    type="button"
                                    onClick={clear}
                                >
                                    <Trash2 size={15} />
                                    Clear
                                </button>
                            )}

                        </div>

                    </section>

                    <aside className="generate-card">

                        <span className="step-number">
                            01
                        </span>

                        <h2>
                            Ready when you are.
                        </h2>

                        <p>
                            We’ll create a focused, original summary
                            from the material you provide.
                        </p>

                        {error && (
                            <div
                                className="inline-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="button button-primary generate-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        className="spin"
                                        size={18}
                                    />

                                    Creating your summary…
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />

                                    Generate summary
                                </>
                            )}
                        </button>

                        <small>
                            Your source and result stay in your private library.
                        </small>

                    </aside>

                </form>

            </main>
        </div>
    );
}