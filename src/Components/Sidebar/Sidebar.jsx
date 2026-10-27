

import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();
    // const 

    // const handleLogout(){
     
    // }

    return (
        <aside className="sidebar">

            <div className="sidebar-menu">

                <p className="sidebar-title">
                    MENU
                </p>

                <NavLink 
                  to="/"
                  className={({isActive}) =>  isActive ? "sidebar-link active" : "sidebar-link" }
                >

                <span><i className="fa-solid fa-house"></i></span>
                    Home
                </NavLink>

                 <NavLink 
                  to="/explore"
                  className={({isActive}) =>  isActive ? "sidebar-link active" : "sidebar-link" }
                >
                <span><i class="fa-solid fa-compass"></i></span>
                    Explore
                </NavLink>


                <NavLink 
                  to="/profile"
                  className={({isActive}) =>  isActive ? "sidebar-link active" : "sidebar-link" }
                >
                <span><i class="fa-solid fa-user"></i></span>
                    View Profile
                </NavLink>

            </div>


            <div className="sidebar-menu">

                <p className="sidebar-title">
                    CREATE
                </p>

                <Link className="sidebar-link create-link" onClick={() => navigate('article-editor')}>
                    <span>＋</span>
                    Create Article
                </Link>

            </div>


            <div className="sidebar-bottom">

                <a className="sidebar-link">
                    <span>⚙</span>
                    Settings
                </a>

                <a className="sidebar-link logout-link">
                    <span><i className="fa-solid fa-power-off"></i></span>
                    Logout
                </a>

            </div>

        </aside>
    );
}

export default Sidebar;