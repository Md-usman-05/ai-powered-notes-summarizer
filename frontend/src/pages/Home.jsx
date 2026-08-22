import { ArrowRight, CheckCircle2, FileText, FolderOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/experience.css";

const steps = [
  { icon: <FolderOpen size={20} />, title: "Add your notes", text: "Paste text or upload a document you are working through." },
  { icon: <Sparkles size={20} />, title: "Get the main ideas", text: "Receive a clear summary that is easier to read and revise." },
  { icon: <FileText size={20} />, title: "Come back to it", text: "Keep every summary together in your own history." },
];

export default function Home() {
  return <div className="experience-site"><Navbar /><main><section className="landing-intro"><div className="page-wrap"><div className="landing-copy"><span className="landing-label">Notes, made manageable</span><h1>Spend less time sorting through notes.</h1><p>NoteMind helps you turn long reading material into short, useful summaries—so you can understand the topic and get on with your day.</p><div className="landing-actions"><Link className="button button-primary" to="/register">Create a free account <ArrowRight size={17} /></Link><Link className="landing-text-link" to="/login">I already have an account</Link></div></div><aside className="landing-note" aria-label="Example summary"><div className="landing-note-top"><span>Example</span><CheckCircle2 size={18} /></div><h2>What you will get</h2><p>A short overview, the important points, and a saved copy you can revisit when you need it.</p><div className="landing-note-rule" /><span className="landing-note-caption">Clear enough to review in a few minutes.</span></aside></div></section><section className="landing-steps" id="how-it-works"><div className="page-wrap"><div className="section-intro"><span>How it works</span><h2>Three simple steps. No learning curve.</h2></div><div className="step-grid">{steps.map((step, index) => <article className="step-card" key={step.title}><span className="step-number">0{index + 1}</span><div className="step-icon">{step.icon}</div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section><section className="landing-close"><div className="page-wrap"><div><span>Ready when you are</span><h2>Give your next set of notes a clearer shape.</h2></div><Link className="button button-primary" to="/register">Get started <ArrowRight size={17} /></Link></div></section></main><footer className="site-footer"><div className="page-wrap"><span>© 2026 NoteMind</span><Link to="/terms">Terms of use</Link></div></footer></div>;
}
