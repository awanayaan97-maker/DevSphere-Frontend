

import "./ResponsePopup.css";

function ResponsePopup({ message ,closePopup}) {

    return (
        <div className="response-popup">

            <p>{message}</p>

            <button onClick={closePopup}>
                ×
            </button>

        </div>
    );
}

export default ResponsePopup;