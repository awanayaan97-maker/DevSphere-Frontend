import "./ForgotPassword.css"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../../hooks/useInputHandler";
import useCallApi from "../../hooks/useCallApi";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import Loader from "../../Components/Loader/Loader";

function ForgotPassword() {

    const API_URL = import.meta.env.VITE_API_URL
    const navigate = useNavigate();
    const {inputData, inputHandler} = useForm({email: ""});
    const {loading, error, setError, callApi} = useCallApi();


    const handleForgotPassword = async () =>{
        if(!inputData.email) return setError("Email is required to reset the password");

        const result = await callApi(`${API_URL}/api/auth/forgot-password`, "POST", inputData);

        if(result.status) setError(result.message)
    }

    if(loading) return <Loader/>

    return (

        <div className="forgot-password-page">

            {error ? <ResponsePopup message={error} closePopup={() => setError(null)}/> : ""}

            <div className="forgot-password-card">


                {/* =====================================
                    ICON
                ===================================== */}

                <div className="forgot-password-icon">

                    <i className="fa-solid fa-lock"></i>

                </div>


                {/* =====================================
                    HEADING
                ===================================== */}

                <div className="forgot-password-heading">

                    <h1>
                        Forgot your password?
                    </h1>

                    <p>
                        Enter your email address and we'll send you
                        a link to reset your password.
                    </p>

                </div>


                {/* =====================================
                    FORM
                ===================================== */}

                <div className="forgot-password-form">

                    <div className="form-input">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={inputData.email}
                            onChange={inputHandler}
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="forgot-password-button"
                        onClick={handleForgotPassword}
                    >

                        <i className="fa-solid fa-paper-plane"></i>
                        Send Reset Link

                    </button>

                </div>


                {/* =====================================
                    BACK TO LOGIN
                ===================================== */}

                <button
                    className="back-to-login"
                    onClick={() => navigate("/login")}
                >

                    <i className="fa-solid fa-arrow-left"></i>

                    Back to Login

                </button>


            </div>

        </div>

    );
}

export default ForgotPassword;