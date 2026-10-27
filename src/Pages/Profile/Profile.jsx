import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { useContext, useEffect, useState } from "react";
import Alert from "../../Components/Alert/Alert";
import useFetch from "../../hooks/useFetch";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useLoginChecker from "../../hooks/useLoginChecker";
import PostCard from "../../Components/PostCard/PostCard";
import { AuthContext } from "../../Context/AuthContext";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";


function Profile() {

    const { user, socket } = useContext(AuthContext)
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useLoginChecker();
    const { loading, error, articles: fetchedArticles, hasMore, setError } = useInfiniteArticles(`${API_URL}/api/user/articles`, "GET", [], token);

    const [articles, setArticles] = useState([]);

    useEffect(() => {
        if (!fetchedArticles) return;

        setArticles((prev) => {
            if (prev.length === 0) {
                return fetchedArticles;
            } else {
                return [...prev, ...fetchedArticles];
            }
        });

    }, [fetchedArticles]);


    useEffect(() => {
        if (!socket) return;

        socket.on("like_notification", (data) => {
            console.log(data);

            setArticles((prevArticles) => {

                return prevArticles.map((article) => {

                    if (article._id === data.articleId) {
                        return {
                            ...article,
                            likesCount: data.likesCount
                        };
                    }
                    return article;
                });
            });
        });

        return () => {
            socket.off("like_notification");
        };
    }, [socket]);

    const authorDetails = {
        firstName: user?.data?.firstName,
        lastName: user?.data?.lastName,
        profileImage: user?.data?.profileImage,
        role: user?.data?.role,
        _id: user?.data?._id
    }

    function handleConnections(type) {

        console.log(type);

        if (type === "followers") {
            if (user?.data.followers === 0) return
            else navigate('/connections/followers')
        }

        if (type === "followings") {
            if (user?.data.followings === 0) return
            else navigate('/connections/followings')
        }

    }

    if (isLoggedIn) return <Alert
        title="Login Required"
        message="Please login or create an account to view your profile."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}
    />

    if (loading) return <SectionLoader />
    if (error) return <ResponsePopup message={error} closePopup={() => setError(null)} />
    if (!user) return null

    return (

        <div className="profile-page">

            {error ?
                <ResponsePopup
                    message={error}
                    closePopup={() => setError(null)}
                />
                : null}


            {/* =====================================
        PROFILE CARD
    ===================================== */}

            <section className="profile-card">

                {/* COVER */}
                {/* COVER */}

                <div className="profile-cover">

                    {user?.data?.coverImage ? (
                        <img
                            src={user?.data.coverImage}
                            alt="Cover"
                            className="profile-cover-image"
                        />
                    ) : null}

                </div>


                <div className="profile-main">

                    {/* =====================================
                PROFILE HEADER
            ===================================== */}

                    <div className="profile-header">

                        {/* PROFILE IMAGE */}

                        <div className="profile-avatar-wrapper">

                            {user?.data?.profileImage ?

                                <img
                                    src={user?.data.profileImage}
                                    alt={"profileImage"}
                                    className="profile-avatar-image"
                                />

                                :

                                <button className="profile-avatar profile-avatar-add">
                                    <i className="fa-solid fa-plus"></i>
                                </button>

                            }

                        </div>


                        {/* EDIT PROFILE */}

                        <button
                            className="profile-edit-btn"
                            onClick={() => navigate("/edit-profile")}
                        >
                            <i className="fa-solid fa-pen"></i>
                            Edit Profile
                        </button>

                    </div>


                    {/* =====================================
                        BASIC PROFILE INFO
                    ===================================== */}

                    <div className="profile-info">

                        {/* NAME */}

                        <h1 className="profile-name">
                            {`${user?.data?.firstName} ${user?.data?.lastName}`}
                        </h1>


                        {/* =====================================
                            ROLE (NEWLY ADDED FIELD)
                        ===================================== */}

                        {user?.data?.role ? (

                            <p className="profile-role">
                                <i className="fa-solid fa-user-tag"></i>
                                <span>{user?.data.role}</span>
                            </p>

                        ) : null}

                        {/* HEADLINE */}

                        {user?.data?.headline ? (

                            <p className="profile-headline">
                                {user?.data.headline}
                            </p>

                        ) : null}



                        {/* =====================================
                            PROFILE META
                        ===================================== */}

                        {(user?.data?.location || user?.data?.website) ? (

                            <div className="profile-meta">

                                {/* LOCATION */}

                                {user?.data?.location ? (

                                    <span className="profile-meta-item">

                                        <i className="fa-solid fa-location-dot"></i>

                                        {user?.data.location}

                                    </span>

                                ) : null}



                                {/* WEBSITE */}

                                {user?.data?.website ? (

                                    <a
                                        href={user?.data.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-meta-item profile-website"
                                    >

                                        <i className="fa-solid fa-link"></i>

                                        {user?.data.website}

                                    </a>

                                ) : null}

                            </div>

                        ) : null}



                        {/* =====================================
                            BIO
                        ===================================== */}

                        {user?.data?.bio ? (

                            <p className="profile-bio">
                                {user?.data.bio}
                            </p>

                        ) : null}



                        {/* =====================================
                            SOCIAL LINKS
                        ===================================== */}

                        {(user?.data?.github ||
                            user?.data?.linkedIn ||
                            user?.data?.twitter) ? (

                            <div className="profile-social-links">

                                {/* GITHUB */}

                                {user?.data?.github ? (

                                    <a
                                        href={user?.data.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-social-link"
                                    >

                                        <i className="fa-brands fa-github"></i>

                                        <span>GitHub</span>

                                    </a>

                                ) : null}



                                {/* LINKEDIN */}

                                {user?.data?.linkedIn ? (

                                    <a
                                        href={user?.data.linkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-social-link"
                                    >

                                        <i className="fa-brands fa-linkedin"></i>

                                        <span>LinkedIn</span>

                                    </a>

                                ) : null}



                                {/* X / TWITTER */}

                                {user?.data?.twitter ? (

                                    <a
                                        href={user?.data.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-social-link"
                                    >

                                        <i className="fa-brands fa-x-twitter"></i>

                                        <span>X / Twitter</span>

                                    </a>

                                ) : null}

                            </div>

                        ) : null}

                    </div>



                    {/* =====================================
                PROFILE STATS
            ===================================== */}

                    <div className="profile-stats">

                        <div className="profile-stat">

                            <strong>
                                {articles?.length}
                            </strong>

                            <span>
                                Articles
                            </span>

                        </div>


                        <div className="profile-stat">

                            <strong onClick={() => handleConnections("followers")}>
                                {user?.data?.followers}
                            </strong>

                            <span>
                                Followers
                            </span>

                        </div>


                        <div className="profile-stat">

                            <strong onClick={() => handleConnections("followings")}>
                                {user?.data?.followings}
                            </strong>

                            <span>
                                Following
                            </span>

                        </div>

                    </div>

                </div>

            </section>



            {/* =====================================
        PROFILE CONTENT
    ===================================== */}

            <div className="profile-content-grid">


                {/* =====================================
            ARTICLES
        ===================================== */}

                <section className="profile-articles">

                    <div className="profile-section-header">

                        <div>

                            <h2>
                                Articles
                            </h2>

                            <p>
                                Your published articles will appear here.
                            </p>

                        </div>


                        <button className="view-all-btn">
                            View all
                        </button>

                    </div>





                    {articles?.length === 0 ? (

                        <div className="empty-articles">

                            <div className="empty-articles-icon">
                                <i className="fa-regular fa-file-lines"></i>
                            </div>

                            <h3>
                                No articles yet
                            </h3>

                            <p>
                                Start sharing your ideas with the developer community.
                            </p>

                            <button className="create-article-btn" onClick={() => navigate('/article-editor')}>
                                <i className="fa-solid fa-plus"></i>
                                Create Article
                            </button>

                        </div>

                    ) : (

                        <div className="profile-article-list">

                            {articles?.map((article) => {

                                const articleWithAuthor = {
                                    ...article,
                                    authorDetails
                                }

                                return (
                                    <PostCard key={articleWithAuthor?._id} post={articleWithAuthor} />
                                )

                            })}


                            {loading && (
                                <div className="loader">
                                    <SectionLoader />
                                </div>
                            )}



                            {!hasMore && articles?.length > 0 && (
                                <ArticlesEndMessage />
                            )}

                        </div>

                    )}

                </section>



                {/* =====================================
            PROFILE DETAILS
        ===================================== */}

                {(user?.data?.bio ||
                    user?.data?.location ||
                    user?.data?.website ||
                    user?.data?.github ||
                    user?.data?.linkedIn ||
                    user?.data?.twitter) ? (

                    <aside className="profile-details">


                        {/* =================================
                    ABOUT
                ================================= */}

                        {user?.data?.bio ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-user"></i>

                                    <h3>
                                        About
                                    </h3>

                                </div>

                                <p>
                                    {user.data.bio}
                                </p>

                            </div>

                        ) : null}



                        {/* =================================
                    LOCATION
                ================================= */}

                        {user?.data?.location ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-location-dot"></i>

                                    <h3>
                                        Location
                                    </h3>

                                </div>

                                <p>
                                    {user?.data?.location}
                                </p>

                            </div>

                        ) : null}



                        {/* =================================
                    WEBSITE
                ================================= */}

                        {user?.data?.website ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-link"></i>

                                    <h3>
                                        Website
                                    </h3>

                                </div>

                                <a
                                    href={user?.data.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-detail-link"
                                >
                                    {user?.data.website}
                                </a>

                            </div>

                        ) : null}



                        {/* =================================
                    SOCIAL LINKS
                ================================= */}

                        {(user?.data?.github ||
                            user?.data?.linkedIn ||
                            user?.data?.twitter) ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-share-nodes"></i>

                                    <h3>
                                        Social Links
                                    </h3>

                                </div>


                                <div className="profile-detail-socials">


                                    {user?.data?.github ? (

                                        <a
                                            href={user.data.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i className="fa-brands fa-github"></i>

                                            GitHub

                                        </a>

                                    ) : null}



                                    {user?.data?.linkedIn ? (

                                        <a
                                            href={user?.data.linkedIn}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i className="fa-brands fa-linkedin"></i>

                                            LinkedIn

                                        </a>

                                    ) : null}



                                    {user?.data?.twitter ? (

                                        <a
                                            href={user.data.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i className="fa-brands fa-x-twitter"></i>

                                            X / Twitter

                                        </a>

                                    ) : null}


                                </div>

                            </div>

                        ) : null}


                    </aside>

                ) : null}


            </div>

        </div>


    );

}


export default Profile;