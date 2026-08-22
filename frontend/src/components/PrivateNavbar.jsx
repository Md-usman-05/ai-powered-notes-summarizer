import { BrainCircuit, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
function PrivateNavbar() { const navigate = useNavigate(); const logout = () => { localStorage.removeItem("access"); localStorage.removeItem("refresh"); navigate("/login", { replace: true }); }; return <header className="app-nav"><div className="page-wrap nav-inner"><Link className="wordmark" to="/dashboard"><BrainCircuit size={22} /> NoteMind</Link><nav><NavLink to="/dashboard">History</NavLink></nav><div className="nav-actions"><button className="icon-text-button" onClick={logout}><LogOut size={16} /> Sign out</button></div></div></header>; }
export default PrivateNavbar;
