
import { GoogleLogin } from "@react-oauth/google";
import "./GoogleAuthButton.css"

function GoogleAuthButton({ onSuccess, setError }) {

    function handleGoogleSuccess(credentialResponse) {
        const idToken = credentialResponse.credential;
        console.log(idToken);
        onSuccess(idToken);
    }

    function handleGoogleError() {
        setError("some thing went wrong")
    }

    return (

        <div className="google-auth-wrapper">

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                logo_alignment="center"
            />

        </div>
    );
}

export default GoogleAuthButton;