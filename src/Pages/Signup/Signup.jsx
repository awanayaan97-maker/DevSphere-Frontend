

import { useContext, useEffect, useState } from "react";
import FormInput from "../../Components/FormInput/FormInput";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useForm from "../../hooks/useInputHandler";
import useCallApi from "../../hooks/useCallApi";
import GoogleAuthButton from "../../Components/GoogleAuthButton/GoogleAuthButton";
import { ThemeContext } from "../../Context/ThemeContext";
import Logo from "../../Components/Logo/Logo";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle";


const fields = [
    {
        name: "firstName",
        label: "First Name",
        placeholder: "Enter your first name",
    },
    {
        name: "lastName",
        label: "Last Name",
        placeholder: "Enter your last name",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter your email",
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter your password",
    },
];


function Signup() {

    const API_URL = import.meta.env.VITE_API_URL
    const navigate = useNavigate();
    const { } = useContext(ThemeContext);
    const { loading, error, callApi, setError } = useCallApi()
    const { inputData, inputHandler } = useForm({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })

    async function handleValidation() {

        if (inputData.firstName === "" || inputData.lastName === "" || inputData.email === "" || inputData.password === "") return setError("All fields are required")

        if (inputData.password.length < 8) return setError("Password must be at least 8 characters.")

        const result = await callApi(`${API_URL}/api/auth/signup`, "POST", inputData);

        if (result.status) {
            localStorage.setItem("email", result.data.email)
            navigate("/verify")
        }
    }

    async function handleGoogleAuth(idToken) {

        const result = await callApi(
            `${API_URL}/api/auth/google`,
            "POST",
            { token: idToken }
        );

        if (result?.status) {
            localStorage.setItem("token", result.data.token);
            navigate("/");
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <main className="signup-page">

            {
                error ? (
                    <ResponsePopup
                        message={error}
                        closePopup={() => setError(null)}
                    />
                ) : ""
            }

            {/* ============================== */}
            {/* TOP HEADER */}
            {/* ============================== */}

            <div className="signup-topbar">

                <Logo />

                <ThemeToggle />

            </div>


            {/* ============================== */}
            {/* SIGNUP CARD */}
            {/* ============================== */}

            <div className="signup-card">

                <div className="signup-heading">
                    <h1>Create Account</h1>

                    <p>
                        Enter your details to create your account
                    </p>
                </div>


                <div className="signup-form">

                    {fields.map((field) => (
                        <FormInput
                            key={field.name}
                            {...field}
                            value={inputData[field.name]}
                            updateValue={inputHandler}
                        />
                    ))}


                    <button
                        className="signup-button"
                        type="submit"
                        onClick={handleValidation}
                    >
                        Create Account
                    </button>


                    <GoogleAuthButton
                        onSuccess={handleGoogleAuth}
                        setError={setError}
                    />

                </div>


                <p className="login-text">
                    Already have an account?

                    <span
                        onClick={() => navigate("/login")}
                    >
                        {" "}Login
                    </span>
                </p>

            </div>

        </main>
    );
}

export default Signup;