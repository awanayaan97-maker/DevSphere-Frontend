import "./ResetPassword.css"
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useForm from "../../hooks/useInputHandler";
import useCallApi from "../../hooks/useCallApi";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import Loader from "../../Components/Loader/Loader";

function ResetPassword() {
 
    const API_URL = import.meta.env.VITE_API_URL
    const { token } = useParams();
    const navigate = useNavigate();
    const {inputData, inputHandler} = useForm({password: "", confirmPassword: ""})
    const {loading, error, setError, callApi} = useCallApi();


    const submitResetPassword = async () => {

        if(!inputData.password || !inputData.confirmPassword) return setError("All fileds are required")

            const result = await callApi(`${API_URL}/api/auth/reset-password/${token}`, "POST", {password: inputData.password})

            if(result.status) navigate("/login")

    }

    if(loading) return <Loader/>

    return (

        <div className="reset-password-page">

            {error ? <ResponsePopup message={error} closePopup={() => setError(null)}/> : ""}

            <div className="reset-password-card">


                {/* =====================================
                    ICON
                ===================================== */}

                <div className="reset-password-icon">

                    <i className="fa-solid fa-lock"></i>

                </div>


                {/* =====================================
                    HEADING
                ===================================== */}

                <div className="reset-password-heading">

                    <h1>
                        Reset your password
                    </h1>

                    <p>
                        Create a new password for your DevSphere account.
                    </p>

                </div>


                {/* =====================================
                    FORM
                ===================================== */}

                <div className="reset-password-form">

                    {/* PASSWORD */}

                    <div className="form-input">

                        <label htmlFor="password">
                            New Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            value={inputData.password}
                            onChange={inputHandler}
                            required
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-input">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={inputData.confirmPassword}
                            onChange={inputHandler}
                            required
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="reset-password-button"
                        onClick={submitResetPassword}
                    >

                        <i className="fa-solid fa-key"></i>

                        Reset Password

                    </button>


                </div>


                {/* BACK TO LOGIN */}

                <button
                    className="reset-back-login"
                    onClick={() => navigate("/forgot-password")}
                >

                    <i className="fa-solid fa-arrow-left"></i>

                    Back to forgot Password

                </button>


            </div>

        </div>

    );
}

export default ResetPassword;