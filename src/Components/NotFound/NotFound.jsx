
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {

    const navigate = useNavigate();

    return (
        <div className="notfound-page">

            <div className="notfound-content">

                <div className="notfound-code">
                    <span>4</span>
                    <span className="notfound-code-zero">0</span>
                    <span>4</span>
                </div>

                <h1>This page wandered off.</h1>

                <p>
                    The page you're looking for doesn't exist, was moved, or never existed in the first place.
                </p>

                <div className="notfound-actions">
                    <button
                        type="button"
                        className="notfound-btn-primary"
                        onClick={() => navigate("/")}
                    >
                        <i className="fa-solid fa-house"></i>
                        Back to Home
                    </button>

                    <button
                        type="button"
                        className="notfound-btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Go Back
                    </button>
                </div>

            </div>

        </div>
    );
}

export default NotFound;