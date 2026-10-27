

import { Link } from "react-router-dom";

import "./Logo.css";

function Logo() {
    return (
        <Link
            to="/"
            className="devsphere-logo"
            aria-label="DevSphere Home"
        >
            <span className="devsphere-logo-symbol">
                &lt;
            </span>

            <span className="devsphere-logo-name">
                DevSphere
            </span>

            <span className="devsphere-logo-symbol">
                /&gt;
            </span>
        </Link>
    );
}

export default Logo;