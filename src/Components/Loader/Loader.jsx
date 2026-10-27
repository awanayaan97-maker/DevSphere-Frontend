import "./Loader.css";

function Loader() {
    return (
        <div className="loader-container">

            <div className="loader-content">

                <div className="loader-logo">
                    <span className="logo-bracket">&lt;</span>
                    <span className="logo-name">DevSphere</span>
                    <span className="logo-bracket">/&gt;</span>
                </div>

                <div className="loader-line">
                    <span></span>
                </div>

                <p className="loader-text">
                    Loading your workspace...
                </p>

            </div>

        </div>
    );
}

export default Loader;