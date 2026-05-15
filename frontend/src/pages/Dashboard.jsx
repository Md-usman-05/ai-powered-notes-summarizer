import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PrivateNavbar from "../components/PrivateNavbar";
import api from "../services/api";

function Dashboard() {

    const [summaries, setSummaries] = useState([]);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        fetchSummaries();

    }, []);

    const fetchSummaries = async () => {

        try {

            const response = await api.get(
                "summaries/"
            );

            setSummaries(response.data);

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this summary?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(
                `summaries/${id}/delete/`
            );

            setSummaries(

                summaries.filter(
                    (item) => item.id !== id
                )

            );

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <>

            <PrivateNavbar />

            <section className="dashboard-page">

                <div className="container">

                    <div className="dashboard-top">

                        <div>

                            <h1 className="dashboard-title">
                                Your AI Study Notes
                            </h1>

                            <p className="dashboard-subtitle">
                                Access your AI-generated study material and quick revisions.
                            </p>

                        </div>

                        <Link
                            to="/upload"
                            className="create-summary-btn"
                        >
                             Generate
                        </Link>

                    </div>

                    {

                        loading

                        ?

                        <div className="text-center py-5">

                            <div className="spinner-border text-primary"></div>

                        </div>

                        :

                        summaries.length === 0

                        ?

                        <div className="empty-dashboard-card">

                            <h2>
                                No summaries yet
                            </h2>

                            <p>
                                Generate your first AI summary.
                            </p>

                            <Link
                                to="/upload"
                                className="create-summary-btn"
                            >
                                Generate Summary
                            </Link>

                        </div>

                        :

                        <div className="summary-grid">

                            {

                                summaries.map((item) => (

                                    <div
                                        className="summary-card"
                                        key={item.id}
                                    >

                                        <div className="summary-card-top">

                                            <h3 className="summary-title">
                                                {item.title}
                                            </h3>

                                            <span className="summary-date">

                                                {
                                                    new Date(
                                                        item.created_at
                                                    ).toLocaleDateString()
                                                }

                                            </span>

                                        </div>

                                        <p className="summary-preview">

                                            {

                                                item.summary.length > 140

                                                ?

                                                item.summary.slice(0, 140) + "..."

                                                :

                                                item.summary

                                            }

                                        </p>

                                        <div className="summary-actions">

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        "/summary-details",
                                                        {
                                                            state: item
                                                        }
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                ))

                            }

                        </div>

                    }

                </div>

            </section>

        </>

    );
}

export default Dashboard;