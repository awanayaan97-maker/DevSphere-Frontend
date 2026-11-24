


import { GoogleLogin } from "@react-oauth/google";
import "./GoogleAuthButton.css";

function GoogleAuthButton({ onSuccess, setError }) {

    function handleGoogleSuccess(credentialResponse) {
        const idToken = credentialResponse.credential;
        onSuccess(idToken);
    }

    function handleGoogleError() {
        setError("Something went wrong");
    }

    return (
        <div className="google-auth-wrapper">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                logo_alignment="center"
                width="370"
            />
        </div>
    );
}

export default GoogleAuthButton;
