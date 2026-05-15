import { useLocation, useNavigate } from "react-router-dom";

function SummaryDetails() {

    const location = useLocation();

    const navigate = useNavigate();

    const summary = location.state;

    const handleCopy = async () => {

        await navigator.clipboard.writeText(
            summary.summary
        );

        alert("Summary copied");
    };

    return (

        <section className="summary-details-page">

            <div className="container py-5">

                <div className="details-top">

                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleCopy}
                    >
                        Copy Summary
                    </button>

                </div>

                <div className="details-card">

                    <h1>
                        {summary.title}
                    </h1>

                    <p className="details-date">

                        {
                            new Date(
                                summary.created_at
                            ).toLocaleString()
                        }

                    </p>

                    <div className="details-summary">

                        {summary.summary}

                    </div>

                </div>

            </div>

        </section>

    );
}

export default SummaryDetails;