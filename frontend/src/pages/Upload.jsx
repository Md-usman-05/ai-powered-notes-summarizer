import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Upload() {

    const [notes, setNotes] = useState("");

    const [summary, setSummary] = useState("");

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

        try {

            const response = await API.post(
                "generate-summary/",
                {
                    notes: notes
                }
            );

            typeSummary(response.data.summary);

        }

        catch (error) {

            alert("Failed to generate summary");

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
                            Paste your notes and get a concise summary instantly.
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

                                <textarea
                                    className="form-control simple-textarea"
                                    placeholder="Paste your notes here..."
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(e.target.value)
                                    }
                                    required
                                />

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