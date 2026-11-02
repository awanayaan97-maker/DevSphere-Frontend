import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const navClass = ({ isActive }) =>
        isActive ? "sidebar-link active" : "sidebar-link";

    return (
        <aside className="sidebar">

            {/* Main Menu */}
            <div className="sidebar-menu">

                <p className="sidebar-title">MENU</p>

                <NavLink to="/" end className={navClass}>
                    <i className="fa-solid fa-house"></i>
                    <span>Home</span>
                </NavLink>

                <NavLink to="/explore" className={navClass}>
                    <i className="fa-solid fa-compass"></i>
                    <span>Explore</span>
                </NavLink>

                <NavLink to="/community" className={navClass}>
                    <i className="fa-solid fa-users"></i>
                    <span>Community</span>
                </NavLink>

                <NavLink to="/dashboard" className={navClass}>
                    <i className="fa-solid fa-chart-line"></i>
                    <span>Dashboard</span>
                </NavLink>

            </div>


            {/* Create Section */}
            <div className="sidebar-menu">

                <p className="sidebar-title">CREATE</p>

                <button
                    className="sidebar-link create-link"
                    onClick={() => navigate("/article-editor")}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Create Article</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;