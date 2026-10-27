

import { useNavigate } from "react-router-dom";
import FormInput from "../../Components/FormInput/FormInput";
import "./Login.css";
import useForm from "../../hooks/useInputHandler";
import { useContext, useEffect, useState } from "react";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import Loader from "../../Components/Loader/Loader";
import useCallApi from "../../hooks/useCallApi";
import { AuthContext } from "../../Context/AuthContext";
import GoogleAuthButton from "../../Components/GoogleAuthButton/GoogleAuthButton";
import Logo from "../../Components/Logo/Logo";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle";

const fields = [
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

function Login() {

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { login } = useContext(AuthContext)
    const { inputData, inputHandler } = useForm({ email: "", password: "" })
    const { loading, error, setError, callApi } = useCallApi()

    async function handleValidation(e) {

        e.preventDefault();

        if (inputData.email === "" || inputData.password === "") return setError("All fileds are required")

        const result = await callApi(`${API_URL}/api/auth/login`, "POST", inputData)

        if (result.status) {
            login(result.token)
            navigate("/")
        }

    }

    async function handleGoogleAuth(idToken) {

        const result = await callApi(
            `${API_URL}/api/auth/google`,
            "POST",
            { token: idToken }
        );

        if (result?.status) {
            login(result.data.token)
            navigate("/");
        }
    }

    if (loading) {
        return <Loader />
    }

    return (

        <main className="login-page">

            {error ? (
                <ResponsePopup
                    message={error}
                    closePopup={() => setError(null)}
                />
            ) : ""}


            {/* ============================== */}
            {/* TOP HEADER */}
            {/* ============================== */}

            <div className="login-topbar">

                <Logo />

                <ThemeToggle />

            </div>


            {/* ============================== */}
            {/* LOGIN CARD */}
            {/* ============================== */}

            <div className="login-card">

                <div className="login-heading">

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Login to your account to continue
                    </p>

                </div>


                <form
                    onSubmit={handleValidation}
                    className="login-form"
                >

                    {fields.map((field) => (
                        <FormInput
                            key={field.name}
                            {...field}
                            value={inputData[field.name]}
                            updateValue={inputHandler}
                        />
                    ))}


                    <button
                        className="login-button"
                        type="submit"
                    >
                        Login
                    </button>


                    <GoogleAuthButton
                        onSuccess={handleGoogleAuth}
                        setError={setError}
                    />

                </form>


                <p
                    className="forgot-password"
                    onClick={() => navigate("/forgot-password")}
                >
                    Forgot Password?
                </p>


                <p className="signup-text">

                    Don't have an account?

                    <span
                        onClick={() => navigate("/signup")}
                    >
                        {" "}Sign Up
                    </span>

                </p>

            </div>

        </main>
    );
}

export default Login;