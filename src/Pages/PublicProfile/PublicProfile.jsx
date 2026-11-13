
import { useNavigate, useParams } from "react-router-dom";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import "./PublicProfile.css";
import Alert from "../../Components/Alert/Alert";
import { useState } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import useApiQuery from "../../hooks/useApiQuery";
import { useFollowToggle } from "../../hooks/useFollowToggle";
const API_URL = import.meta.env.VITE_API_URL;

function PublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    const { isLoading, error, setError, data, queryKey } = useApiQuery({
        url: `${API_URL}/api/user/public/${id}`,
        type: "GET",
        isAuthorized: false
    })

    const { isFollowing, toggleFollow, showFollowAlert, setShowFollowAlert } = useFollowToggle({
        userId: id,
        initialIsFollowing: data?.isFollowingAuthor
    })

    if (isLoading) {
        return <SectionLoader />;
    }


    if (error) {
        return (
            <ResponsePopup
                message={error}
                closePopup={() => setError(null)}
            />
        );
    }


    if (!data) {
        return null;
    }

    const user = data;
    const serverFollowers = user?.followers || 0;
    const serverIsFollowing = user?.isFollowingAuthor || false;
    let displayFollowers = serverFollowers;
    if (isFollowing !== serverIsFollowing) {
        displayFollowers = serverIsFollowing ? serverFollowers - 1 : serverFollowers + 1;
    }

    if (showAlert || showFollowAlert) return <Alert
        title="Login Required"
        message="Please login or create an account to like or comment article"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => {
            setShowAlert(false)
            setShowFollowAlert(false)
        }}
    />


    return (
        <main className="public-profile-page">

            <section className="public-profile-header">

                <div className="public-profile-cover">
                    {user?.coverImage ? (
                        <img
                            src={user.coverImage}
                            alt="Profile cover"
                            className="public-profile-cover-image"
                        />
                    ) : (
                        <div className="public-profile-cover-placeholder"></div>
                    )}
                </div>


                {/* Profile Content */}
                <div className="public-profile-content">

                    {/* Avatar */}
                    <div className="public-profile-avatar">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Profile"
                            />
                        ) : (
                            <span>
                                {user?.firstName
                                    ? user.firstName.charAt(0).toUpperCase()
                                    : "D"}
                            </span>
                        )}
                    </div>


                    {/* Name + Follow */}
                    <div className="public-profile-heading">
                        <div className="public-profile-name">
                            <h1>
                                {user?.firstName || "Developer"}{" "}
                                {user?.lastName || ""}
                            </h1>

                            {user?.username ? (
                                <span className="public-profile-username">
                                    @{user.username}
                                </span>
                            ) : null}
                        </div>

                        {isFollowing ? (
                            /* 1. BUTTON: Jab User Follow Kar Chuka Ho */
                            <button
                                type="button"
                                className="public-profile-btn btn-following"
                                onClick={toggleFollow}
                            >
                                <i className="fa-solid fa-user-check"></i>
                                <span>Following</span>
                            </button>
                        ) : (
                            /* 2. BUTTON: Jab User Follow NAHI Kar Raha Ho */
                            <button
                                type="button"
                                className="public-profile-btn btn-follow"
                                onClick={toggleFollow}
                            >
                                <i className="fa-solid fa-user-plus"></i>
                                <span>Follow</span>
                            </button>
                        )}
                    </div>


                    {/* Headline */}
                    {user?.headline ? (
                        <p className="public-profile-headline">
                            {user.headline}
                        </p>
                    ) : null}


                    {/* Bio */}
                    {user?.bio ? (
                        <p className="public-profile-bio">
                            {user.bio}
                        </p>
                    ) : null}


                    {/* Details */}
                    {(user?.location || user?.website) ? (
                        <div className="public-profile-details">
                            {user?.location ? (
                                <span>
                                    <i className="fa-solid fa-location-dot"></i>
                                    {user.location}
                                </span>
                            ) : null}

                            {user?.website ? (
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className="fa-solid fa-link"></i>
                                    Website
                                </a>
                            ) : null}
                        </div>
                    ) : null}


                    {/* Social Links */}
                    {(user?.github || user?.linkedIn || user?.twitter) ? (
                        <div className="public-profile-socials">
                            {user?.github ? (
                                <a
                                    href={user.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="GitHub"
                                >
                                    <i className="fa-brands fa-github"></i>
                                </a>
                            ) : null}

                            {user?.linkedIn ? (
                                <a
                                    href={user.linkedIn}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <i className="fa-brands fa-linkedin-in"></i>
                                </a>
                            ) : null}

                            {user?.twitter ? (
                                <a
                                    href={user.twitter}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Twitter"
                                >
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>
                            ) : null}
                        </div>
                    ) : null}


                    {/* Stats */}
                    <div className="public-profile-stats">
                        <div className="public-profile-stat">
                            <strong>
                                {user?.userArticleData?.length || 0}
                            </strong>
                            <span>Articles</span>
                        </div>

                        <div className="public-profile-stat">
                            <strong>
                                {displayFollowers}
                            </strong>
                            <span>Followers</span>
                        </div>

                        <div className="public-profile-stat">
                            <strong>
                                {user?.followings}
                            </strong>
                            <span>Following</span>
                        </div>
                    </div>

                </div>

            </section>


            {/* =========================================
        Articles Section
    ========================================= */}

            <section className="public-profile-articles">

                <div className="public-profile-section-header">
                    <div>
                        <span>Published</span>
                        <h2>Articles</h2>
                    </div>
                </div>


                {user?.userArticleData?.length === 0 ? (

                    <div className="public-profile-empty">
                        <div className="public-profile-empty-icon">
                            <i className="fa-regular fa-file-lines"></i>
                        </div>
                        <h3>No articles yet</h3>
                        <p>This developer hasn't published any articles yet.</p>
                    </div>

                ) : (

                    <div className="public-profile-article-list">
                        {user?.userArticleData?.map((article) => (

                            <PostCard key={article._id} post={article} queryKey={queryKey} />
                        ))}
                    </div>

                )}

            </section>

        </main>


    );
}

export default PublicProfile;