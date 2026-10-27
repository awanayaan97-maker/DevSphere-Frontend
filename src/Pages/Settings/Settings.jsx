import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserPen,
    faEnvelope,
    faLock,
    faPen,
    faCheck,
    faXmark,
    faShieldHalved,
    faTrashCan,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../Context/AuthContext";
import useCallApi from "../../hooks/useCallApi";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const {
        user,
        setUser,
        logout,
    } = useContext(AuthContext);

    const { callApi, loading: actionLoading } = useCallApi();
    const token = localStorage.getItem("token");

    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [message, setMessage] = useState({
        type: "",
        text: "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const currentEmail = user?.data?.email || "";
    const authProvider = user?.data?.authProvider;
    const isGoogleUser = authProvider === "google";

    function clearMessage() {
        setMessage({
            type: "",
            text: "",
        });
    }

    function handleOpenEmail() {
        clearMessage();

        setEmailError("");
        setNewEmail("");

        setIsChangingEmail(true);
    }

    function handleCancelEmail() {
        setNewEmail("");
        setEmailError("");

        setIsChangingEmail(false);
    }

    async function handleChangeEmail(e) {
        e.preventDefault();

        const email = newEmail.trim();

        if (!email) {
            setEmailError("Please enter your new email.");
            return;
        }

        if (!email.includes("@")) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        if (email === currentEmail) {
            setEmailError("This is already your current email.");
            return;
        }

        setEmailError("");
        clearMessage();

        const result = await callApi(
            `${API_URL}/api/user/me`, "PUT", { email }, token
        );

        if (result?.status) {

            setUser((prev) => ({
                ...prev,
                data: {
                    ...prev.data,
                    email,
                },
            }));

            setIsChangingEmail(false);
            setNewEmail("");

            setMessage({
                type: "success",
                text: "Your email address has been updated successfully.",
            });
        } else {
            setEmailError(
                result?.message || "Unable to change email. Please try again."
            );
        }
    }

    function handleOpenPassword() {
        clearMessage();

        setPasswordError("");
        setCurrentPassword("");
        setNewPassword("");

        setIsChangingPassword(true);
    }

    function handleCancelPassword() {
        setCurrentPassword("");
        setNewPassword("");
        setPasswordError("");

        setIsChangingPassword(false);
    }


    async function handleChangePassword(e) {
        e.preventDefault();

        if (!currentPassword) {
            setPasswordError("Please enter your current password.");
            return;
        }

        if (!newPassword) {
            setPasswordError("Please enter your new password.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "Your new password must be at least 8 characters."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from your current password."
            );
            return;
        }

        setPasswordError("");
        clearMessage();

        const result = await callApi(`${API_URL}/api/user/me`, "PUT",
            { currentPassword, newPassword, }, token);

        if (result?.status) {

            setCurrentPassword("");
            setNewPassword("");

            setIsChangingPassword(false);

            setMessage({
                type: "success",
                text: "Your password has been changed successfully.",
            });
        } else {
            setPasswordError(
                result?.message ||
                "Unable to change password. Please try again."
            );
        }
    }

    async function handleDeleteAccount(e) {

        e.preventDefault();
        setDeleteError("");

        if (isGoogleUser) {
            if (deleteConfirmation !== "DELETE") {
                setDeleteError("Please type DELETE to confirm.");
                return;
            }
        }

        if (!isGoogleUser) {
            if (!deletePassword.trim()) {
                setDeleteError("Please enter your password.");
                return;
            }

            if (deletePassword.length < 8) {
                setDeleteError(
                    "Password must be at least 8 characters long."
                );
                return;
            }
        }

        const requestBody = isGoogleUser
            ? {
                confirmation: deleteConfirmation,
            }
            : {
                password: deletePassword,
            };

        const result = await callApi(
            `${API_URL}/api/auth/deactivate`,
            "PATCH",
            requestBody,
            token
        );

        if (result?.status) {
            localStorage.removeItem("token");

            setShowDeleteModal(false);

            setDeleteConfirmation("");
            setDeletePassword("");
            setDeleteError("");

            logout();
            navigate('/signup')

        } else {
            setDeleteError(
                result?.message ||
                "Unable to delete your account. Please try again."
            );
        }
    }

    return (
        <main className="settings-page">

            <div className="settings-container">

                {/* =========================
            HEADER
        ========================== */}

                <header className="settings-header">

                    <div>
                        <span className="settings-eyebrow">
                            ACCOUNT SETTINGS
                        </span>

                        <h1>Settings</h1>

                        <p>
                            Manage your profile, account information and security.
                        </p>
                    </div>

                    <div className="settings-security-badge">
                        <FontAwesomeIcon icon={faShieldHalved} />

                        <span>
                            Account Security
                        </span>
                    </div>

                </header>


                {/* =========================
            MESSAGE
        ========================== */}

                {message.text && (
                    <div
                        className={`settings-message ${message.type}`}
                    >

                        <FontAwesomeIcon
                            icon={
                                message.type === "success"
                                    ? faCheck
                                    : faTriangleExclamation
                            }
                        />

                        <span>
                            {message.text}
                        </span>

                    </div>
                )}


                {/* =========================
            ACCOUNT
        ========================== */}

                <section className="settings-section">

                    <div className="settings-section-header">

                        <span className="settings-section-label">
                            ACCOUNT
                        </span>

                        <h2>
                            Account information
                        </h2>

                        <p>
                            Manage your profile and the information connected
                            to your DevSphere account.
                        </p>

                    </div>


                    <div className="settings-card">


                        {/* =====================
                EDIT PROFILE
            ====================== */}

                        <div className="settings-item">

                            <div className="settings-icon">
                                <FontAwesomeIcon icon={faUserPen} />
                            </div>


                            <div className="settings-item-content">

                                <h3>
                                    Edit Profile
                                </h3>

                                <p>
                                    Update your name, profile image, bio,
                                    role and other public profile information.
                                </p>

                            </div>


                            <button
                                className="settings-btn secondary"
                                onClick={() =>
                                    navigate("/edit-profile")
                                }
                            >
                                <FontAwesomeIcon icon={faPen} />

                                Edit Profile
                            </button>

                        </div>


                        <div className="settings-divider" />


                        {/* =====================
                EMAIL
            ====================== */}

                        <div className="settings-item">

                            <div className="settings-icon email">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>


                            <div className="settings-item-content">

                                <div className="settings-title-row">

                                    <h3>
                                        Email address
                                    </h3>

                                    <span className="settings-small-badge">
                                        Account email
                                    </span>

                                </div>


                                {!isChangingEmail ? (

                                    <>
                                        <div className="settings-current-value">
                                            {currentEmail}
                                        </div>

                                        <p>
                                            This email is currently connected
                                            to your DevSphere account.
                                        </p>
                                    </>

                                ) : (

                                    <form
                                        className="settings-editor"
                                        onSubmit={handleChangeEmail}
                                    >

                                        <div className="settings-input-wrapper">

                                            <FontAwesomeIcon
                                                icon={faEnvelope}
                                            />

                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) =>
                                                    setNewEmail(e.target.value)
                                                }
                                                placeholder="Enter your new email"
                                                autoComplete="email"
                                                autoFocus
                                                disabled={actionLoading}
                                            />

                                        </div>


                                        {emailError && (
                                            <span className="settings-field-error">
                                                {emailError}
                                            </span>
                                        )}


                                        <div className="settings-editor-actions">

                                            <button
                                                type="button"
                                                className="settings-btn ghost"
                                                onClick={handleCancelEmail}
                                                disabled={actionLoading}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faXmark}
                                                />

                                                Cancel
                                            </button>


                                            <button
                                                type="submit"
                                                className="settings-btn primary"
                                                disabled={
                                                    actionLoading ||
                                                    !newEmail.trim()
                                                }
                                            >

                                                {actionLoading ? (
                                                    <>
                                                        <SectionLoader />
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                        />

                                                        Change Email
                                                    </>
                                                )}

                                            </button>

                                        </div>

                                    </form>

                                )}

                            </div>


                            {!isChangingEmail && (

                                <button
                                    className="settings-btn secondary"
                                    onClick={handleOpenEmail}
                                >

                                    <FontAwesomeIcon icon={faPen} />

                                    Change

                                </button>

                            )}

                        </div>


                        <div className="settings-divider" />


                        {/* =====================
                PASSWORD
            ====================== */}

                        <div
                            className={`settings-item ${isGoogleUser
                                ? "settings-disabled"
                                : ""
                                }`}
                        >

                            <div className="settings-icon password">
                                <FontAwesomeIcon icon={faLock} />
                            </div>


                            <div className="settings-item-content">

                                <div className="settings-title-row">

                                    <h3>
                                        Password
                                    </h3>

                                    {isGoogleUser && (
                                        <span className="settings-small-badge">
                                            Google account
                                        </span>
                                    )}

                                </div>


                                {!isChangingPassword ? (

                                    <>
                                        <div className="settings-password-dots">
                                            ••••••••••••••
                                        </div>

                                        <p>
                                            {isGoogleUser
                                                ? "Password changes are unavailable because you signed in with Google."
                                                : "Keep your password strong and unique to protect your account."}
                                        </p>
                                    </>

                                ) : (

                                    <form
                                        className="settings-editor"
                                        onSubmit={handleChangePassword}
                                    >

                                        {/* Current password */}

                                        <div className="settings-input-wrapper">

                                            <FontAwesomeIcon
                                                icon={faLock}
                                            />

                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) =>
                                                    setCurrentPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Current password"
                                                autoComplete="current-password"
                                                autoFocus
                                                disabled={actionLoading}
                                            />

                                        </div>


                                        {/* New password */}

                                        <div className="settings-input-wrapper">

                                            <FontAwesomeIcon
                                                icon={faLock}
                                            />

                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="New password"
                                                autoComplete="new-password"
                                                disabled={actionLoading}
                                            />

                                        </div>


                                        {passwordError && (
                                            <span className="settings-field-error">
                                                {passwordError}
                                            </span>
                                        )}


                                        <div className="settings-editor-actions">

                                            <button
                                                type="button"
                                                className="settings-btn ghost"
                                                onClick={handleCancelPassword}
                                                disabled={actionLoading}
                                            >

                                                <FontAwesomeIcon
                                                    icon={faXmark}
                                                />

                                                Cancel

                                            </button>


                                            <button
                                                type="submit"
                                                className="settings-btn primary"
                                                disabled={
                                                    actionLoading ||
                                                    !currentPassword ||
                                                    !newPassword
                                                }
                                            >

                                                {actionLoading ? (
                                                    <SectionLoader />
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                        />

                                                        Change Password
                                                    </>
                                                )}

                                            </button>

                                        </div>

                                    </form>

                                )}

                            </div>


                            {!isChangingPassword && (

                                <button
                                    className="settings-btn secondary"
                                    disabled={isGoogleUser}
                                    onClick={handleOpenPassword}
                                >

                                    <FontAwesomeIcon icon={faPen} />

                                    {isGoogleUser
                                        ? "Unavailable"
                                        : "Change"}

                                </button>

                            )}

                        </div>

                    </div>

                </section>


                {/* =========================
            DANGER ZONE
        ========================== */}

                <section className="settings-section danger-zone">

                    <div className="settings-section-header">

                        <span className="settings-section-label danger-label">
                            DANGER ZONE
                        </span>

                        <h2>
                            Delete account
                        </h2>

                        <p>
                            This action is permanent and cannot be undone.
                        </p>

                    </div>


                    <div className="danger-card">

                        <div className="danger-content">

                            <div className="danger-icon">
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                />
                            </div>


                            <div>

                                <h3>
                                    Permanently delete your account
                                </h3>

                                <p>
                                    Your profile, posts, bookmarks and
                                    account data will be permanently removed.
                                </p>

                            </div>

                        </div>


                        <button
                            className="settings-btn danger"
                            onClick={() =>
                                setShowDeleteModal(true)
                            }
                        >

                            <FontAwesomeIcon
                                icon={faTrashCan}
                            />

                            Delete Account

                        </button>

                    </div>

                </section>

            </div>


            {showDeleteModal && (
                <div
                    className="settings-modal-overlay"
                    onMouseDown={() => {
                        if (!actionLoading) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div
                        className="settings-delete-modal"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="delete-modal-icon">
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                            />
                        </div>

                        <span className="delete-modal-label">
                            PERMANENT ACTION
                        </span>

                        <h2>
                            Delete your account?
                        </h2>

                        <p>
                            This cannot be undone. Your DevSphere
                            account and associated data will be
                            permanently deleted.
                        </p>

                        <form onSubmit={handleDeleteAccount}>
                            {/* ================================ */}
                            {/* GOOGLE USER */}
                            {/* ================================ */}

                            {isGoogleUser ? (
                                <>
                                    <label>
                                        Type <strong>DELETE</strong> to confirm
                                    </label>

                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) =>
                                            setDeleteConfirmation(
                                                e.target.value
                                            )
                                        }
                                        placeholder="DELETE"
                                        disabled={actionLoading}
                                        autoFocus
                                    />
                                </>
                            ) : (
                                /* ================================ */
                                /* LOCAL USER */
                                /* ================================ */

                                <>
                                    <label>
                                        Enter your password to confirm
                                    </label>

                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) =>
                                            setDeletePassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={actionLoading}
                                        autoFocus
                                    />

                                    <span className="delete-password-hint">
                                        Your password must be at least 8
                                        characters long.
                                    </span>
                                </>
                            )}

                            {/* ================================ */}
                            {/* ERROR */}
                            {/* ================================ */}

                            {deleteError && (
                                <span className="settings-field-error">
                                    {deleteError}
                                </span>
                            )}

                            {/* ================================ */}
                            {/* ACTIONS */}
                            {/* ================================ */}

                            <div className="delete-modal-actions">
                                <button
                                    type="button"
                                    className="settings-btn ghost"
                                    disabled={actionLoading}
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation("");
                                        setDeletePassword("");
                                        setDeleteError("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="settings-btn danger"
                                    disabled={
                                        actionLoading ||
                                        (
                                            isGoogleUser
                                                ? deleteConfirmation !== "DELETE"
                                                : deletePassword.length < 8
                                        )
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                    />

                                    Delete Account
                                </button>
                            </div>

                            {/* ================================ */}
                            {/* LOADER */}
                            {/* ================================ */}

                            {actionLoading && (
                                <div className="delete-modal-loader">
                                    <SectionLoader />
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

        </main>
    );
}

export default Settings;