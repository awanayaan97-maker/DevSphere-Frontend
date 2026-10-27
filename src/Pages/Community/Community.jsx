

import { useContext, useEffect, useState } from "react";
import CommunityPostCard from "../../Components/CommunityPostCard/CommunityPostCard";
import "./Community.css";
import CommunityComposer from "../../Components/CommunityComposer/CommunityComposer";
import { AuthContext } from "../../Context/AuthContext";
import SortDropdown from "../../Components/SortDropdown/SortDropdown";
import { useSearchParams } from "react-router-dom";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useCallApi from "../../hooks/useCallApi";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import NoResults from "../../Components/NoResults/NoResults";
import DevelopersToFollow from "../../Components/DevelopersToFollow/DevelopersToFollow";
import AskAiButton from "../../Components/AskAiButton/AskAiButton";
import CommunityAI from "../../Components/CommunityAI/CommunityAI";
import Alert from "../../Components/Alert/Alert";
import useLoginChecker from "../../hooks/useLoginChecker";
import useCheckLogin from "../../hooks/useCheckLogin";

function Community() {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [showComposer, setShowComposer] = useState(false);
    const [postToEdit, setPostToEdit] = useState(null);
    const [popularUsers, setPopularUser] = useState([])
    const [trendingTopics, setTrendingTopics] = useState(null)
    const [followStates, setFollowStates] = useState({});
    const [isAIopen, setIsAIopen] = useState(false);
    const { user } = useContext(AuthContext);
    const [searchParam, setSearchParam] = useSearchParams();
    const [post, setPost] = useState(null)
    const { callApi } = useCallApi();
    const { showAlert, setShowAlert, check } = useCheckLogin();
    const sort = searchParam.get("sort") || "latest";
    const feed = searchParam.get("feed") || "All Posts"
    const topic = searchParam.get("topic")
    let url = `${API_URL}/api/post?sort=${sort}`

    if (topic) {
        url += `&topic=${topic}`
    }

    if (feed) {
        url += `&feed=${feed}`
    }

    const { articles: postsData, loading, error, setError, hasMore } = useInfiniteArticles(url, "GET", [], token)

    const showEmpty = !loading && !error && postsData.length === 0;

    useEffect(() => {

        const getDevelopers = async () => {

            const [topicsData, discoverFollower] = await Promise.all([
                callApi(`${API_URL}/api/discover/tags?source=posts`, "GET"),
                callApi(`${API_URL}/api/discover/discover-developers`, "GET", [], token)
            ])

            if (topicsData?.status) {
                setTrendingTopics(topicsData.data)
            }

            if (discoverFollower?.status) {
                setPopularUser(discoverFollower.data)
            }
        }

        getDevelopers()

    }, [])

    useEffect(() => {
        setPost(postsData || []);
    }, [postsData]);

    function handleEditPost(postId) {
        const selectedPost = post.find(
            (post) => post._id === postId
        );

        if (!selectedPost) {
            console.error("Post not found");
            return;
        }

        setPostToEdit(selectedPost);
        setShowComposer(true);
    }

    async function handleDeletePost(postId) {
        let deletedPost = null;

        setPost((prevPosts) => {
            deletedPost = prevPosts.find((p) => p._id === postId);
            return prevPosts.filter((post) => post._id !== postId);
        });

        try {
            const url = `${API_URL}/api/post/${postId}`;
            await callApi(url, "DELETE", null, token);
        }

        catch (error) {
            console.error("API fail:", error);

            if (deletedPost) {
                setPost((prevPosts) => [deletedPost, ...prevPosts]);
            }
        }
    }

    const handleSort = (e) => {
        const sortValue = e.target.value.trim();
        setSearchParam((prev) => {
            const newParam = new URLSearchParams(prev);
            newParam.set("sort", sortValue);
            return newParam;
        });
    };

    const handleFeed = (value) => {
        setSearchParam((prev) => {
            const newParam = new URLSearchParams(prev);
            newParam.set("feed", value);
            newParam.delete("topic")
            return newParam;
        });
    };

    const handleTopic = (value) => {
        setSearchParam((prev) => {
            const newParam = new URLSearchParams(prev);
            newParam.set("topic", value);
            newParam.delete("feed")
            return newParam;
        });
    };

    async function followCandidate(id) {

        if (!token) {
            setShowAlert(true)
            return;
        }

        const isCurrentlyFollowing = !!followStates[id];
        const nextIsFollow = !isCurrentlyFollowing;

        setFollowStates((prev) => ({
            ...prev,
            [id]: nextIsFollow
        }));

        const followedUser = {
            followedUser: id,
            action: nextIsFollow ? "follow" : "unfollow"
        };

        const result = await callApi(
            `${API_URL}/api/user/follow`,
            "POST",
            followedUser,
            token
        );

        if (!result?.status) {
            setFollowStates((prev) => ({
                ...prev,
                [id]: isCurrentlyFollowing
            }));
        }
    }

    if (showAlert) return <Alert
        title="Login Required"
        message="Please log in or create an account to continue."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => setShowAlert(false)}
    />

    if (error) return <ResponsePopup message={error} closePopup={() => setError(null)} />

    return (
        <main className="community-page">
            {/* Page heading */}
            <header className="community-header">
                <div className="community-heading">
                    <h1>Community</h1>
                    <p>
                        Connect with developers, share ideas, and grow together.
                    </p>
                </div>

                <button className="ai-assistant-btn" onClick={() => check(setIsAIopen)}>
                    <svg
                        className="ai-sparkle-icon"
                        viewBox="0 0 48 48"
                        fill="none"
                        aria-hidden="true"
                        style={{ width: "18px", height: "18px", flexShrink: 0 }}
                    >
                        <path
                            d="M24 3.5C26.7 15.2 32.8 21.3 44.5 24C32.8 26.7 26.7 32.8 24 44.5C21.3 32.8 15.2 26.7 3.5 24C15.2 21.3 21.3 15.2 24 3.5Z"
                            fill="currentColor"
                        />
                        <path
                            d="M39 3.5C39.8 7 41.5 8.7 45 9.5C41.5 10.3 39.8 12 39 15.5C38.2 12 36.5 10.3 33 9.5C36.5 8.7 38.2 7 39 3.5Z"
                            fill="currentColor"
                        />
                    </svg>
                    <span>AI Assistant</span>
                </button>

            </header>

            {/* Create post placeholder: baad mein composer yahan add hoga */}
            <section
                className="community-create-card"
                onClick={() => check(setShowComposer)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowComposer(true);
                    }
                }}
            >
                <div className="community-create-top">
                    <div className="community-create-avatar">
                        {user?.data?.profileImage ? (
                            <img
                                src={user.data.profileImage}
                                alt={`${user?.data?.firstName || ""} ${user?.data?.lastName || ""}`}
                                className="community-avatar-img"
                            />
                        ) : (
                            <span className="community-avatar-initials">
                                {user?.data?.firstName?.[0] || ""}
                                {user?.data?.lastName?.[0] || ""}
                            </span>
                        )}
                    </div>

                    <div className="community-create-placeholder">
                        <h3>Write a post...</h3>
                        <p>
                            Ask a question, share code, or showcase your latest project.
                        </p>
                    </div>
                </div>

                <div className="community-create-actions">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            check(setShowComposer)
                        }}
                    >
                        <i className="fa-solid fa-code" />
                        Code
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            check(setShowComposer)
                        }}
                    >
                        <i className="fa-regular fa-image" />
                        Media
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            check(setShowComposer)
                        }}
                    >
                        <i className="fa-regular fa-circle-question" />
                        Discussion
                    </button>
                </div>
            </section>

            {showComposer && (
                <div className="community-composer-overlay">
                    <div className="community-composer-modal">
                        <CommunityComposer
                            onClose={() => {
                                setShowComposer(false);
                                setPostToEdit(null);
                            }}
                            postToEdit={postToEdit}
                            setPost={setPost}
                        />
                    </div>
                </div>
            )}

            <div className="community-mobile-recommendations">

                <section className="community-sidebar-card">
                    <h3>Trending Topics</h3>

                    <div className="community-trending-list">
                        <div className="community-trending-track">
                            {trendingTopics?.map((item) => {
                                return (
                                    <div className="community-trending-item">
                                        <span onClick={() => handleTopic(item.tagValue)}>#{item.tagValue}</span>
                                        <small>{item.count}posts</small>
                                    </div>
                                )

                            })}

                        </div>
                    </div>
                </section>

                <DevelopersToFollow
                    developers={popularUsers}
                    variant="cards"
                    onFollow={followCandidate}
                    followStates={followStates}
                />

            </div>

            {/* Feed tabs: UI only */}
            <nav className="community-feed-tabs">
                <button
                    type="button"
                    className={`community-tab ${feed === "All Posts" ? "active" : ""}`}
                    onClick={() => handleFeed("All Posts")}
                >
                    All Posts
                </button>

                <button
                    type="button"
                    className={`community-tab ${feed === "Discussion" ? "active" : ""}`}
                    onClick={() => handleFeed("Discussion")}
                >
                    Discussions
                </button>

                <button
                    type="button"
                    className={`community-tab ${feed === "Projects" ? "active" : ""}`}
                    onClick={() => handleFeed("Projects")}
                >
                    Projects
                </button>

                <button
                    type="button"
                    className={`community-tab ${feed === "Learning" ? "active" : ""}`}
                    onClick={() => handleFeed("Learning")}
                >
                    Learning
                </button>

            </nav>

            {/* Feed layout */}
            <div className="community-layout">

                {/* Desktop sidebar — right side */}
                <aside className="community-sidebar community-sidebar-desktop">

                    <section className="community-sidebar-card">
                        <h3>Trending Topics</h3>

                        <div className="community-trending-list">

                            {trendingTopics?.map((item) => {
                                return (
                                    <div className="community-trending-item">
                                        <span onClick={() => handleTopic(item.tagValue)}>#{item.tagValue}</span>
                                        <small>{item.count} posts</small>
                                    </div>
                                )

                            })}

                        </div>
                    </section>

                    <DevelopersToFollow
                        developers={popularUsers}
                        variant="list"
                        onFollow={followCandidate}
                        followStates={followStates}
                    />

                </aside>


                {/* Community feed */}
                <section className="community-feed">

                    <div className="community-feed-heading">
                        <h2>Community Feed</h2>
                        <SortDropdown sort={sort} handleSort={handleSort} />
                    </div>

                    {post?.map((post) => (
                        <CommunityPostCard
                            key={post._id}
                            post={post}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                        />
                    ))}

                    {loading && (
                        <div className="loader">
                            <SectionLoader />
                        </div>
                    )}

                    {showEmpty && (
                        <NoResults
                            title="No posts yet"
                            message={
                                feed
                                    ? `No ${feed.toLowerCase()} posts have been shared yet.`
                                    : "Be the first to share something with the community."
                            }
                        />
                    )}

                    {!hasMore && !loading && post.length > 0 && (
                        <ArticlesEndMessage />
                    )}

                </section>

            </div>

            {isAIopen && (
                <div className="community-ai-overlay">
                    <CommunityAI onClose={() => setIsAIopen(false)} />
                </div>
            )}

        </main>
    );
}

export default Community;