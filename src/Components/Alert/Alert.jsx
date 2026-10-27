import "./Alert.css";

function Alert({
    title = "Alert",
    message,
    actionText,
    onAction,
    onClose
}) {
    return (
        <div className="alert-overlay">

            <div className="alert-box">

                <button
                    className="alert-close-btn"
                    onClick={onClose}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="alert-icon">
                    <i className="fa-solid fa-circle-exclamation"></i>
                </div>

                <div className="alert-content">

                    <h3>{title}</h3>

                    <p>{message}</p>

                    {actionText && (
                        <button
                            className="alert-action-btn"
                            onClick={onAction}
                        >
                            {actionText}
                            {/* <i className="fa-solid fa-arrow-right"></i> */}
                        </button>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Alert;