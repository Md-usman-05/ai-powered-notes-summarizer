import Navbar from "../components/Navbar"

function Home() {

    return (

        <>

            <Navbar />

            <section
                className="hero-section"
                id="home"
            >

                <div className="container hero-container">

                    <div className="hero-left">

                        <span className="hero-tag">
                            AI-powered note summarization
                        </span>

                        <h1>
                            Smarter Notes.
                            <br />
                            Faster Revision.
                        </h1>

                        <p>
                            NoteMind AI helps students and developers
                            convert lengthy notes into concise,
                            readable study material for quick learning
                            and revision.
                        </p>

                    </div>

                    <div className="hero-right">

                        <div className="preview-card">

                            <div className="preview-top">
                                Summary Preview
                            </div>

                            <h4>
                                Machine Learning Fundamentals
                            </h4>

                            <p>
                                Machine Learning allows systems to
                                learn patterns from data and make
                                predictions without explicit
                                programming.
                            </p>

                            <div className="preview-divider"></div>

                            <ul>

                                <li>
                                    Concise AI-generated summaries
                                </li>

                                <li>
                                    Clean and readable revision notes
                                </li>

                                <li>
                                    Important concepts highlighted
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

            </section>

            <section
                className="features-section"
                id="features"
            >

                <div className="container">

                    <div className="section-title">

                        <h2>
                            Designed for better learning
                        </h2>

                        <p>
                            Everything organized to make studying easier and faster.
                        </p>

                    </div>

                    <div className="features-grid">

                        <div className="feature-card">

                            <h3>
                                Clean Summaries
                            </h3>

                            <p>
                                Generate short and understandable summaries
                                from long notes instantly.
                            </p>

                        </div>

                        <div className="feature-card">

                            <h3>
                                Quick Revision
                            </h3>

                            <p>
                                Save generated notes and revisit them
                                anytime from your dashboard.
                            </p>

                        </div>

                        <div className="feature-card">

                            <h3>
                                Structured Learning
                            </h3>

                            <p>
                                Important concepts are organized clearly
                                for easier understanding.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            <section
                className="about-section"
                id="about"
            >

                <div className="container about-wrapper">

                    <h2>
                        About NoteMind AI
                    </h2>

                    <p>
                        NoteMind AI is built to simplify the learning process
                        by transforming large amounts of text into readable,
                        concise, and organized study material using AI.
                    </p>

                </div>

            </section>

            <footer className="footer">

                <div className="container footer-content">

                    <div>

                        <h3>
                            NoteMind AI
                        </h3>

                        <p>
                            Simplifying study notes with AI-powered summaries.
                        </p>

                    </div>

                    <span className="footer-copy">
                        © 2026 NoteMind AI
                    </span>

                </div>

            </footer>

        </>

    )
}

export default Home