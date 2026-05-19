import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Upload() {

    const [notes, setNotes] = useState("");

    const [notesFile, setNotesFile] = useState(null);

    const [summary, setSummary] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const typeSummary = (text) => {

        let index = 0;

        setSummary("");

        const interval = setInterval(() => {

            setSummary((prev) => prev + text.charAt(index));

            index++;

            if (index >= text.length) {

                clearInterval(interval);

            }

        }, 8);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setSummary("");
        setError("");

        try {
            const formData = new FormData();

            if (notesFile) {
                formData.append("notes_file", notesFile);
            }

            if (notes.trim()) {
                formData.append("notes", notes);
            }

            const response = await API.post(
                "generate-summary/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            typeSummary(response.data.summary);

        }

        catch (error) {

            setError(
                error.response?.data?.error ||
                "Failed to generate summary"
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <section className="simple-upload-page">

            <div className="container py-5">

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Generate AI Summary
                        </h1>

                        <p className="text-muted mb-0">
                            Upload PDF, DOCX, text files, or paste your notes to generate a summary.
                        </p>

                    </div>

                    <Link
                        to="/dashboard"
                        className="btn btn-outline-primary"
                    >
                        Back
                    </Link>

                </div>

                <div className="row g-4">

                    <div className="col-lg-6">

                        <div className="simple-card">

                            <h4 className="mb-3">
                                Your Notes
                            </h4>

                            <form onSubmit={handleSubmit}>

                                <label className="form-label fw-semibold">
                                    Upload File
                                </label>

                                <input
                                    type="file"
                                    className="form-control mb-3"
                                    accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.htm,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.xml,.yaml,.yml,.log"
                                    onChange={(e) =>
                                        setNotesFile(e.target.files[0] || null)
                                    }
                                />

                                <p className="small text-muted">
                                    Supported: PDF, DOCX, TXT, CSV, MD, HTML, JSON, code and other readable text files.
                                </p>

                                <textarea
                                    className="form-control simple-textarea"
                                    placeholder="Or paste your notes here..."
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(e.target.value)
                                    }
                                    required={!notesFile}
                                />

                                {
                                    error &&
                                    <div className="alert alert-danger mt-3 mb-0">
                                        {error}
                                    </div>
                                }

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-3"
                                    disabled={loading}
                                >

                                    {

                                        loading
                                        ?
                                        "Generating..."
                                        :
                                        "Generate Summary"

                                    }

                                </button>

                            </form>

                        </div>

                    </div>

                    <div className="col-lg-6">

                        <div className="simple-card">

                            <h4 className="mb-3">
                                AI Summary
                            </h4>

                            {

                                loading

                                ?

                                <div className="loading-box">

                                    <div className="spinner-border text-primary"></div>

                                    <p className="mt-3 text-muted">
                                        AI is generating summary...
                                    </p>

                                </div>

                                :

                                summary

                                ?

                                <div className="summary-output">

                                    {summary}

                                </div>

                                :

                                <div className="empty-summary">

                                    Summary will appear here...

                                </div>

                            }

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );
}

export default Upload;
