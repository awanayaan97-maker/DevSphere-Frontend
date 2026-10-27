
import { NavLink } from "react-router-dom";
import "./MobileNav.css";

function MobileNav() {
    return (
        <nav className="mobile-nav">

            <NavLink to="/" className={({isActive}) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
            <span><i className="fa-solid fa-house"></i></span>
            <small>Home</small>
            </NavLink>

            <NavLink to="/explore" className={({isActive}) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
            <span><i class="fa-solid fa-compass"></i></span>
            <small>Explore</small>
            </NavLink>

            {/* <button className="mobile-create-button">
                ＋
            </button> */}

            {/* <button className="mobile-nav-item">
                <span>♧</span>
                <small>Alerts</small>
            </button> */}

            <NavLink to="/profile" className={({isActive}) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
            <span><i class="fa-solid fa-user"></i></span>
            <small>Profile</small>
            </NavLink>

        </nav>
    );
}

export default MobileNav;