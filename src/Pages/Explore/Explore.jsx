
import { useNavigate, useSearchParams } from "react-router-dom";
import PostCard from "../../Components/PostCard/PostCard";
import "./Explore.css";
import useLoginChecker from "../../hooks/useLoginChecker";
import { useEffect, useState } from "react";
import useCallApi from "../../hooks/useCallApi";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import NoResults from "../../Components/NoResults/NoResults";
import CategorySelect from "../../Components/CategorySelect/CategorySelect";
import DevelopersToFollow from "../../Components/DevelopersToFollow/DevelopersToFollow";
import Alert from "../../Components/Alert/Alert";


function Explore() {

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { isLoggedIn } = useLoginChecker();
    const [trendingTopics, setTrendingTopics] = useState(null)
    const [popularUsers, setPopularUser] = useState([])
    const [articles, setArticles] = useState([]);
    const [followStates, setFollowStates] = useState({});
    const [showAlert, setShowAlert] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const tag = searchParams.get("tag") || null;
    const sort = searchParams.get("sort") || "latest";
    const category = searchParams.get("category") || "All Categories";

    let url = `${API_URL}/api/article/explore?sort=${sort}`;

    if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`;
    }

    if (category && category !== "All Categories") {
        url += `&category=${encodeURIComponent(category)}`;
    }

    const { callApi, loading: tagLoading } = useCallApi();

    const { loading, error, setError, hasMore, articles: fetchedArticles } = useInfiniteArticles(url, "GET", [], token)


    useEffect(() => {

        const getTags = async () => {

            const [topicsData, discoverFollower] = await Promise.all([
                callApi(`${API_URL}/api/discover/tags?source=articles`, "GET"),
                callApi(`${API_URL}/api/discover/discover-developers`, "GET", [], token)
            ])

            if (topicsData?.status) {
                setTrendingTopics(topicsData.data)
            }

            if (discoverFollower?.status) {
                setPopularUser(discoverFollower.data)
            }
        }

        getTags()

    }, [])

    useEffect(() => {
        setArticles([]);
    }, [tag, sort, category]);

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


    async function followCandidate(id) {

        if (!token) {
            setShowAlert(true)
            return
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

    function handleSortChange(sortValue) {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("sort", sortValue);
            return newParams;
        });
    }

    function handleTagChange(tagValue) {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.delete("category");
            newParams.set("tag", tagValue);
            return newParams;
        });
    }

    function handleCategoryChange(e) {

        const categoryValue = e.target.value

        if (!categoryValue) {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.delete("category");
                return newParams;
            });
            return
        }

        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.delete("tag");
            newParams.set("category", categoryValue);
            return newParams;
        });
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
        <div className="explore-page">

            <div className="explore-header">
                <span className="explore-eyebrow">Discover</span>
                <h1>Explore the developer community.</h1>
                <p>Discover trending topics, popular articles and developers worth following.</p>
            </div>


            <div className="explore-trending">
                <div className="explore-trending-list">
                    {[...(trendingTopics || []), ...(trendingTopics || [])].map((topic, index) => (
                        <button
                            type="button"
                            key={`${topic.tagValue}-${index}`}
                            className={`trending-pill ${index >= (trendingTopics?.length || 0) ? "trending-pill-duplicate" : ""} ${tag?.toLowerCase() === topic.tagValue?.toLowerCase() ? "trending-pill-active" : ""}`}
                            onClick={() => handleTagChange(topic.tagValue)}
                        >
                            <span className="trending-pill-hash">#</span>
                            {topic.tagValue}
                            <span className="trending-pill-count">{topic.count}</span>
                        </button>
                    ))}
                </div>
            </div>


            {/* =========================================================
        DEVELOPERS TO FOLLOW — MOBILE ONLY (horizontal cards)
        CSS se desktop par hide hoga
    ========================================================= */}

            <DevelopersToFollow developers={popularUsers} variant="cards" onFollow={followCandidate} followStates={followStates} />


            <div className="explore-grid">

                {/* ---------- ARTICLES ---------- */}

                <div className="explore-main">

                    <div className="explore-tabs">
                        <button
                            type="button"
                            className={`explore-tab ${sort === "latest" ? "explore-tab-active" : ""}`}
                            onClick={() => handleSortChange("latest")}
                        >
                            Latest
                        </button>

                        <button
                            type="button"
                            className={`explore-tab ${sort === "trending" ? "explore-tab-active" : ""}`}
                            onClick={() => handleSortChange("trending")}
                        >
                            Trending
                        </button>

                        <button
                            type="button"
                            className={`explore-tab ${sort === "mostDiscuss" ? "explore-tab-active" : ""}`}
                            onClick={() => handleSortChange("mostDiscuss")}
                        >
                            Most Discussed
                        </button>
                    </div>

                    <div className="explore-filter-bar-mobile">
                        <CategorySelect
                            selectedCategory={category}
                            onChange={handleCategoryChange}
                            label="Select Category"
                            size="sm"
                        />
                    </div>

                    <div className="explore-article-list">

                        {/* 1. Error State Handling */}
                        {error && (
                            <div className="error-message-box" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* 2. Initial Loader (Jab bilkul pehli dafa data fetch ho raha ho aur articles khali hon) */}
                        {loading && (!articles || articles.length === 0) && (
                            <div className="loader">
                                <SectionLoader />
                            </div>
                        )}

                        {/* 3. Articles List Mapping (Safely rendered with optional chaining) */}
                        {!error && articles && articles.length > 0 && (
                            articles.map((post) => (
                                <PostCard key={post?._id} post={post} />
                            ))
                        )}

                        {/* 4. Pagination / Infinite Scroll Loader */}
                        {loading && articles && articles.length > 0 && (
                            <div className="loader">
                                <SectionLoader />
                            </div>
                        )}

                        {/* 5. No Results State */}
                        {!loading && !error && (!articles || articles.length === 0) && (
                            <NoResults
                                title="No articles found"
                                message={`No articles are currently available under the topic ${tag || category || sort}.`}
                            />
                        )}

                        {/* 6. End of Feed Message */}
                        {!hasMore && articles && articles.length > 0 && (
                            <ArticlesEndMessage />
                        )}

                    </div>

                </div>

                {/* ---------- SIDEBAR — DESKTOP ONLY ---------- */}

                <aside className="explore-sidebar">

                    {/* Filter — DESKTOP ONLY, hamesha dikhega (CSS se mobile par chhupa rahega) */}
                    <div className="sidebar-filter-section">
                        <CategorySelect
                            selectedCategory={category}
                            onChange={handleCategoryChange}
                            label="Select Category"
                            size="default"
                        />
                    </div>

                    <DevelopersToFollow developers={popularUsers} variant="list" onFollow={followCandidate} followStates={followStates} />

                    {/* Developers widget — sirf tab dikhega jab data ho */}
                    {/* {popularUsers && popularUsers.length > 0 && (
                        <div className="sidebar-widget">
                            <div className="sidebar-widget-header">
                                <h3>Developers to Follow</h3>
                                <span>Discover new people.</span>
                            </div>

                            <div className="developer-list">
                                {popularUsers.map((dev) => (
                                    <div className="developer-item" key={dev?._id}>
                                        <div
                                            className="developer-avatar"
                                            onClick={() => navigate(`/user/${dev?._id}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {dev?.profileImage ? (
                                                <img src={dev.profileImage} alt={dev?.firstName} />
                                            ) : (
                                                <p>{`${dev?.firstName?.charAt(0) || ""}${dev?.lastName?.charAt(0) || ""}`}</p>
                                            )}
                                        </div>

                                        <div className="developer-info">
                                            <strong>{`${dev?.firstName} ${dev?.lastName}`}</strong>
                                            <span>{dev.role}</span>
                                            <span className="developer-followers">{`${dev?.followersCount} followers`}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className={
                                                followStates[dev?._id]
                                                    ? "follow-btn-following"
                                                    : "follow-btn"
                                            }
                                            onClick={() => followCandidate(dev?._id)}
                                        >
                                            {followStates[dev?._id] ? "Following" : "Follow"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )} */}

                </aside>

            </div>

        </div>
    );
}

export default Explore;