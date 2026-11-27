


import { GoogleLogin } from "@react-oauth/google";
import "./GoogleAuthButton.css";
import { useEffect, useRef, useState } from "react";

function GoogleAuthButton({ onSuccess, setError }) {

    function handleGoogleSuccess(credentialResponse) {
        const idToken = credentialResponse.credential;
        onSuccess(idToken);
    }

    function handleGoogleError() {
        setError("Something went wrong");
    }

    const googleAuthRef = useRef(null);
    const [googleButtonWidth, setGoogleButtonWidth] = useState(0);

    useEffect(() => {

        const wrapper = googleAuthRef.current;
        if (!wrapper) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const width = Math.floor(
                entries[0].contentRect.width
            );

            if (width > 0) {
                setGoogleButtonWidth(width);
            }
        });

        resizeObserver.observe(wrapper);
        return () => resizeObserver.disconnect();

    }, []);

    return (
        <div
            className="google-auth-wrapper"
            ref={googleAuthRef}
        >
            {googleButtonWidth > 0 && (
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    theme="outline"
                    shape="rectangular"
                    text="continue_with"
                    logo_alignment="center"
                    width={String(googleButtonWidth)}
                />
            )}
        </div>
    );
}

export default GoogleAuthButton;
