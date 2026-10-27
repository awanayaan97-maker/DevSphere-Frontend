
import "./OTPVerification.css";

import { data, useNavigate } from "react-router-dom";
import "./OTPVerification.css";
import { useEffect, useState } from "react";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useCallApi from "../../hooks/useCallApi";
import useForm from "../../hooks/useInputHandler";

function OTPVerification() {

    const API_URL = import.meta.env.VITE_API_URL;
    const email = localStorage.getItem("email")
    const {inputData, inputHandler} = useForm({otp: ""})
    const { loading, error, setError, callApi } = useCallApi()
    const navigate = useNavigate()

    useEffect(() => {

        if (!email) {
            navigate("/signup")
        }
    }, [])


    async function resendOTP() {

        const result = await callApi(`${API_URL}/api/auth/resendOTP`, "POST", {email})

        if(result.status) setError(result.message)
    }


   async function handleValidation() {

        if (inputData.otp === "") return setError("Enter your OTP number");

        const verifyOTP = {email, otp: inputData.otp};

        const result = await callApi(`${API_URL}/api/auth/verification`, "POST", verifyOTP)

        if(result.status) navigate("/login")
    }


    if (loading) {
        return <Loader />
    }

    return (
        <div className="verification-page">

            {error ? <ResponsePopup message={error} closePopup={() => setError(null)} /> : ""}

            <div className="verification-card">

                <div className="verification-heading">
                    <h1>Verify Your Email</h1>

                    <p>
                        Enter the 6-digit code sent to your email address.
                    </p>
                </div>

                <div className="otp-input-wrapper">

                    <input
                        type="text"
                        name="otp"
                        value={inputData.otp}
                        onChange={inputHandler}
                        placeholder="Enter 6-digit OTP"
                        inputMode="numeric"
                        maxLength="6"
                    />

                </div>

                <button className="verify-button" onClick={handleValidation}>
                    Verify OTP
                </button>

                <p className="resend-text">
                    Didn't receive the code?
                    <span onClick={() => resendOTP()}> Resend OTP</span>
                </p>

            </div>

        </div>
    );
}

export default OTPVerification;