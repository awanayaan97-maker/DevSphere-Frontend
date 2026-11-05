

import { useContext, useEffect, useState } from "react";
import "./EditProfile.css";
import useForm from "../../hooks/useInputHandler";
import useLoginChecker from "../../hooks/useLoginChecker";
import useCallApi from "../../hooks/useCallApi";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";

function EditProfile() {

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { user, setUser } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const [coverImagePreview, setCoverImagePreview] = useState("");
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [profileImageFile, setProfileImageFile] = useState("");
    const [coverImageFile, setCoverImageFile] = useState("")
    const { isLoggedIn } = useLoginChecker();
    const userFollowers = user?.followers;
    const userFollowings = user?.followings;

    const { loading, error, setError, callApi } = useCallApi();
    const { inputData, inputHandler, setInputData } = useForm({
        firstName: "",
        lastName: "",
        headline: "",
        bio: "",
        role: "",
        location: "",
        website: "",
        github: "",
        linkedIn: "",
        twitter: "",
    })

    useEffect(() => {

        if (user) {

            setInputData({
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                headline: user?.headline || "",
                bio: user?.bio || "",
                location: user?.location || "",
                website: user?.website || "",
                github: user?.github || "",
                linkedIn: user?.linkedIn || "",
                twitter: user?.twitter || "",
                role: user?.role || ""
            })

        }

    }, [user])

    async function handleProfileUpdate() {

        const formData = new FormData();
        formData.append("firstName", inputData.firstName);
        formData.append("lastName", inputData.lastName);
        formData.append("headline", inputData.headline);
        formData.append("bio", inputData.bio);
        formData.append("location", inputData.location);
        formData.append("website", inputData.website);
        formData.append("github", inputData.github);
        formData.append("linkedIn", inputData.linkedIn);
        formData.append("twitter", inputData.twitter);
        formData.append("role", inputData.role);

        if (profileImageFile) formData.append("profileImage", profileImageFile);
        if (coverImageFile) formData.append("coverImage", coverImageFile)
        const result = await callApi(`${API_URL}/api/user/me`, "PUT", formData, token);

        if (result.status) {
            result.data.followers = userFollowers;
            result.data.followings = userFollowings;
            const userData = { data: result.data }
            setUser(userData)
            navigate('/profile')
        }
    }


    function handleImageChange(e) {

        const name = e.target.name;
        const file = e.target.files[0];
        const imageURL = URL.createObjectURL(file)
        if (name === "coverImage") {
            setCoverImagePreview(imageURL)
            setCoverImageFile(file)
            return
        }

        setProfileImagePreview(imageURL);
        setProfileImageFile(file)
    }


    if (!isLoggedIn) return <Alert

        title="Login Required"
        message="Please login or create an account to view your profile."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}

    />

    if (loading) return <SectionLoader />
    if (error) return <ResponsePopup message={error} closePopup={() => setError()} />

    return (

        <div className="edit-profile-page">
            <div className="edit-profile-header">

                <div>

                    <h1>
                        Edit Profile
                    </h1>

                    <p>
                        Update your profile information and let people know more about you.
                    </p>

                </div>

            </div>


            <form
                className="edit-profile-form"
            >

                <section className="edit-section">

                    <div className="edit-section-heading">
                        <h2>Profile Images</h2>

                        <p>
                            Add a profile photo and cover image.
                        </p>
                    </div>


                    <div className="profile-images-editor">

                        <div className="cover-image-editor">

                            {(coverImagePreview || user?.coverImage) ?
                                <img
                                    src={coverImagePreview || user?.coverImage}
                                    alt="Cover preview"
                                    className="cover-preview-image"
                                />
                                :
                                <div className="cover-placeholder">
                                    <i className="fa-regular fa-image"></i>
                                    <span>Cover Image</span>
                                </div>
                            }


                            <label
                                htmlFor="coverImage"
                                className="image-edit-button"
                            >
                                <i className="fa-solid fa-camera"></i>
                                Change Cover
                            </label>


                            <input
                                id="coverImage"
                                type="file"
                                name="coverImage"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                        </div>


                        {/* =========================
            PROFILE IMAGE
        ========================= */}
                        <div className="profile-image-editor">

                            {(profileImagePreview || user?.profileImage) ? (
                                <img
                                    src={profileImagePreview || user?.profileImage}
                                    alt="Profile preview"
                                    className="profile-preview-image"
                                />
                            ) : (
                                <div className="profile-image-placeholder">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}


                            <label
                                htmlFor="profileImage"
                                className="profile-camera-button"
                            >
                                <i className="fa-solid fa-camera"></i>
                            </label>


                            <input
                                id="profileImage"
                                type="file"
                                name="profileImage"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                        </div>

                    </div>

                </section>


                <section className="edit-section">

                    <div className="edit-section-heading">
                        <h2>Basic Information</h2>
                        <p>Your name and primary identity across the platform.</p>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={inputData.firstName}
                                onChange={inputHandler}
                                placeholder="First name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={inputData.lastName}
                                onChange={inputHandler}
                                placeholder="Last name"
                            />
                        </div>

                        {/* =========================
            ROLE DROPDOWN (NEW FIELD)
        ========================= */}
                        <div className="form-group full-width">
                            <label>Primary Role</label>
                            <select
                                name="role"
                                value={inputData.role}
                                onChange={inputHandler}
                                className="form-select"
                            >
                                <option value="" disabled hidden>
                                    Select your primary role
                                </option>
                                <option value="Frontend Developer">Frontend Developer</option>
                                <option value="Backend Developer">Backend Developer</option>
                                <option value="Full Stack Developer">Full Stack Developer</option>
                                <option value="UI/UX Designer">UI/UX Designer</option>
                                <option value="DevOps Engineer">DevOps Engineer</option>
                                <option value="Mobile App Developer">Mobile App Developer</option>
                                <option value="AI / ML Engineer">AI / ML Engineer</option>
                                <option value="Student / Learner">Student / Learner</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Headline</label>
                            <input
                                type="text"
                                name="headline"
                                value={inputData.headline}
                                onChange={inputHandler}
                                placeholder="e.g. Full Stack Developer | React & Node.js"
                            />
                            <small>
                                A short professional headline that appears below your name.
                            </small>
                        </div>

                        <div className="form-group full-width">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={inputData.bio}
                                onChange={inputHandler}
                                placeholder="Tell people about yourself..."
                                rows="5"
                            />
                            <small>
                                Share your interests, experience, skills or what you are currently building.
                            </small>
                        </div>

                    </div>

                </section>


                <section className="edit-section">

                    <div className="edit-section-heading">

                        <h2>
                            Additional Information
                        </h2>

                        <p>
                            These details are completely optional.
                        </p>

                    </div>


                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Location
                            </label>

                            <div className="input-with-icon">

                                <i className="fa-solid fa-location-dot"></i>

                                <input
                                    type="text"
                                    name="location"
                                    value={inputData.location}
                                    onChange={inputHandler}
                                    placeholder="Karachi, Pakistan"
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Website
                            </label>

                            <div className="input-with-icon">

                                <i className="fa-solid fa-link"></i>

                                <input
                                    type="url"
                                    name="website"
                                    value={inputData.website}
                                    onChange={inputHandler}
                                    placeholder="https://yourwebsite.com"
                                />

                            </div>

                        </div>

                    </div>

                </section>


                <section className="edit-section">

                    <div className="edit-section-heading">

                        <h2>
                            Social Links
                        </h2>

                        <p>
                            Connect your developer and professional profiles.
                            All links are optional.
                        </p>

                    </div>


                    <div className="social-links">

                        <div className="form-group">

                            <label>
                                GitHub
                            </label>

                            <div className="input-with-icon">

                                <i className="fa-brands fa-github"></i>

                                <input
                                    type="url"
                                    name="github"
                                    value={inputData.github}
                                    onChange={inputHandler}
                                    placeholder="https://github.com/username"
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                LinkedIn
                            </label>

                            <div className="input-with-icon">

                                <i className="fa-brands fa-linkedin"></i>

                                <input
                                    type="url"
                                    name="linkedIn"
                                    value={inputData.linkedIn}
                                    onChange={inputHandler}
                                    placeholder="https://linkedin.com/in/username"
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                X / Twitter
                            </label>

                            <div className="input-with-icon">

                                <i className="fa-brands fa-x-twitter"></i>

                                <input
                                    type="url"
                                    name="twitter"
                                    value={inputData.twitter}
                                    onChange={inputHandler}
                                    placeholder="https://x.com/username"
                                />

                            </div>

                        </div>


                    </div>

                </section>


                <div className="edit-profile-actions">

                    <button
                        type="button"
                        className="cancel-profile-btn"
                        onClick={() => navigate("/profile")}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="save-profile-btn"
                        onClick={handleProfileUpdate}
                    >

                        <i className="fa-solid fa-check"></i>

                        Save Changes

                    </button>

                </div>


            </form>

        </div>

    );
}


export default EditProfile;