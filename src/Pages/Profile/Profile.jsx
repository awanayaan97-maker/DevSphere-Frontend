import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { useContext, useEffect } from "react";
import Alert from "../../Components/Alert/Alert";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useLoginChecker from "../../hooks/useLoginChecker";
import PostCard from "../../Components/PostCard/PostCard";
import { AuthContext } from "../../Context/AuthContext";
import usePaginationQuery from "../../hooks/usePaginationQuery";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import { useQueryClient } from "@tanstack/react-query";


function Profile() {

    const queryClient = useQueryClient()
    const { user, socket } = useContext(AuthContext)
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { isLoggedIn } = useLoginChecker();
    const { loading, error, fetchData, hasMore, setError } = usePaginationQuery(`${API_URL}/api/user/articles`, "GET", [], token);


    useEffect(() => {
    if (!socket) return;
    const onLike = (data) => {
        queryClient.setQueriesData({ queryKey: ["feed"] }, (old) => {
            if (!old) return old;

            return {
                ...old,
                pages: old.pages.map((page) =>
                    page.map((article) =>
                        article._id === data.articleId
                            ? { ...article, likesCount: data.likesCount }
                            : article
                    )
                ),
            };
        });
    };

    socket.on("like_notification", onLike);
    return () => {
        socket.off("like_notification", onLike);
    };
}, [socket, queryClient]);

    const authorDetails = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        profileImage: user?.profileImage,
        role: user?.role,
        _id: user?._id
    }

    function handleConnections(type) {

        if (type === "followers") {
            if (user?.followers === 0) return
            else navigate('/connections/followers')
        }

        if (type === "followings") {
            if (user?.followings === 0) return
            else navigate('/connections/followings')
        }

    }

    if (!isLoggedIn) return <Alert
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

                    {user?.coverImage ? (
                        <img
                            src={user?.coverImage}
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

                            {user?.profileImage ?

                                <img
                                    src={user?.profileImage}
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
                            {`${user?.firstName} ${user?.lastName}`}
                        </h1>


                        {/* =====================================
                            ROLE (NEWLY ADDED FIELD)
                        ===================================== */}

                        {user?.role ? (

                            <p className="profile-role">
                                <i className="fa-solid fa-user-tag"></i>
                                <span>{user.role}</span>
                            </p>

                        ) : null}

                        {/* HEADLINE */}

                        {user?.headline ? (

                            <p className="profile-headline">
                                {user?.headline}
                            </p>

                        ) : null}



                        {/* =====================================
                            PROFILE META
                        ===================================== */}

                        {(user?.location || user?.website) ? (

                            <div className="profile-meta">

                                {/* LOCATION */}

                                {user?.location ? (

                                    <span className="profile-meta-item">

                                        <i className="fa-solid fa-location-dot"></i>

                                        {user?.location}

                                    </span>

                                ) : null}



                                {/* WEBSITE */}

                                {user?.website ? (

                                    <a
                                        href={user?.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-meta-item profile-website"
                                    >

                                        <i className="fa-solid fa-link"></i>

                                        {user?.website}

                                    </a>

                                ) : null}

                            </div>

                        ) : null}



                        {/* =====================================
                            BIO
                        ===================================== */}

                        {user?.bio ? (

                            <p className="profile-bio">
                                {user?.bio}
                            </p>

                        ) : null}



                        {/* =====================================
                            SOCIAL LINKS
                        ===================================== */}

                        {(user?.github ||
                            user?.linkedIn ||
                            user?.twitter) ? (

                            <div className="profile-social-links">

                                {/* GITHUB */}

                                {user?.github ? (

                                    <a
                                        href={user?.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-social-link"
                                    >

                                        <i className="fa-brands fa-github"></i>

                                        <span>GitHub</span>

                                    </a>

                                ) : null}



                                {/* LINKEDIN */}

                                {user?.linkedIn ? (

                                    <a
                                        href={user?.linkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-social-link"
                                    >

                                        <i className="fa-brands fa-linkedin"></i>

                                        <span>LinkedIn</span>

                                    </a>

                                ) : null}



                                {/* X / TWITTER */}

                                {user?.twitter ? (

                                    <a
                                        href={user?.twitter}
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
                                {fetchData?.length}
                            </strong>

                            <span>
                                Articles
                            </span>

                        </div>


                        <div className="profile-stat">

                            <strong onClick={() => handleConnections("followers")}>
                                {user?.followers}
                            </strong>

                            <span>
                                Followers
                            </span>

                        </div>


                        <div className="profile-stat">

                            <strong onClick={() => handleConnections("followings")}>
                                {user?.followings}
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





                    {fetchData?.length === 0 ? (

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

                            {fetchData?.map((article) => {

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



                            {!hasMore && fetchData?.length > 0 && (
                                <ArticlesEndMessage />
                            )}

                        </div>

                    )}

                </section>



                {/* =====================================
            PROFILE DETAILS
        ===================================== */}

                {(user?.bio ||
                    user?.location ||
                    user?.website ||
                    user?.github ||
                    user?.linkedIn ||
                    user?.twitter) ? (

                    <aside className="profile-details">


                        {/* =================================
                    ABOUT
                ================================= */}

                        {user?.bio ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-user"></i>

                                    <h3>
                                        About
                                    </h3>

                                </div>

                                <p>
                                    {user?.bio}
                                </p>

                            </div>

                        ) : null}



                        {/* =================================
                    LOCATION
                ================================= */}

                        {user?.location ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-location-dot"></i>

                                    <h3>
                                        Location
                                    </h3>

                                </div>

                                <p>
                                    {user?.location}
                                </p>

                            </div>

                        ) : null}



                        {/* =================================
                    WEBSITE
                ================================= */}

                        {user?.website ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-link"></i>

                                    <h3>
                                        Website
                                    </h3>

                                </div>

                                <a
                                    href={user?.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-detail-link"
                                >
                                    {user?.website}
                                </a>

                            </div>

                        ) : null}



                        {/* =================================
                    SOCIAL LINKS
                ================================= */}

                        {(user?.github ||
                            user?.linkedIn ||
                            user?.twitter) ? (

                            <div className="profile-detail-section">

                                <div className="profile-detail-title">

                                    <i className="fa-solid fa-share-nodes"></i>

                                    <h3>
                                        Social Links
                                    </h3>

                                </div>


                                <div className="profile-detail-socials">


                                    {user?.github ? (

                                        <a
                                            href={user?.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i className="fa-brands fa-github"></i>

                                            GitHub

                                        </a>

                                    ) : null}



                                    {user?.linkedIn ? (

                                        <a
                                            href={user?.linkedIn}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i className="fa-brands fa-linkedin"></i>

                                            LinkedIn

                                        </a>

                                    ) : null}



                                    {user?.twitter ? (

                                        <a
                                            href={user?.twitter}
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