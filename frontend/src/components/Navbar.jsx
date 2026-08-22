import { BrainCircuit } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
function Navbar() { return <header className="site-nav"><div className="page-wrap nav-inner"><Link className="wordmark" to="/"><BrainCircuit size={22} /> NoteMind</Link><nav><a href="/#how-it-works">How it works</a><Link to="/terms">Terms</Link></nav><div className="nav-actions"><NavLink className="nav-login" to="/login">Sign in</NavLink><NavLink className="nav-cta" to="/register">Get started</NavLink></div></div></header>; }
export default Navbar;
