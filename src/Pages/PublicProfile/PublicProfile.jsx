
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useFetch from "../../hooks/useFetch";
import "./PublicProfile.css";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import { useContext, useEffect, useState } from "react";
import useCallApi from "../../hooks/useCallApi";
import PostCard from "../../Components/PostCard/PostCard";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import { AuthContext } from "../../Context/AuthContext";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";

function PublicProfile() {
    const { id } = useParams();
    const { user: contextUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [isFollow, setIsFollow] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const { isLoggedIn, setIsLoggedIn } = useLoginChecker();
    const { callApi } = useCallApi();

    const API_URL = import.meta.env.VITE_API_URL;

    const {
        loading,
        error,
        setError,
        data,
    } = useFetch(`${API_URL}/api/user/public/${id}`, token);

//     const {articles, loading: articleLoading} = useInfiniteArticles(`${API_URL}/api/user/public/${id}`, "GET", 
//     [], 
//     token
// );

    function handleAction() {

        if (isLoggedIn) {
            setShowAlert(true)
            return
        }

        setIsFollow(!currentFollow)
    }

    useEffect(() => {

        if (isFollow === null) return;

        const followedUser = { followedUser: id };
        followedUser.action = isFollow ? "follow" : "unfollow"

        const timer = setTimeout(async () => {
            const result = await callApi(`${API_URL}/api/user/follow`, "POST", followedUser, token);
        }, 700)


        return () => {
            clearTimeout(timer)
        }

    }, [isFollow])

    if (loading) {
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

    const user = data?.data;
    const currentFollow = isFollow !== null ? isFollow : user?.isFollowingAuthor;


    if (showAlert) return <Alert
        title="Login Required"
        message="Please login or create an account to like or comment article"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => setShowAlert(false)}
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

                        {currentFollow ? (
                            /* 1. BUTTON: Jab User Follow Kar Chuka Ho */
                            <button
                                type="button"
                                className="public-profile-btn btn-following"
                                onClick={handleAction}
                            >
                                <i className="fa-solid fa-user-check"></i>
                                <span>Following</span>
                            </button>
                        ) : (
                            /* 2. BUTTON: Jab User Follow NAHI Kar Raha Ho */
                            <button
                                type="button"
                                className="public-profile-btn btn-follow"
                                onClick={handleAction}
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
                                {isFollow ? user?.followers + 1 : user.followers}
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
                           
                            <PostCard key={article._id} post={article} />
                        ))}
                    </div>

                )}

            </section>

        </main>


    );
}

export default PublicProfile;