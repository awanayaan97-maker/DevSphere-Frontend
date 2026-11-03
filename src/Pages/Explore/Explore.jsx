
import PostCard from "../../Components/PostCard/PostCard";
import "./Explore.css";
import { useEffect, useState } from "react";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import NoResults from "../../Components/NoResults/NoResults";
import CategorySelect from "../../Components/CategorySelect/CategorySelect";
import DevelopersToFollow from "../../Components/DevelopersToFollow/DevelopersToFollow";
import useDiscoverData from "../../hooks/useDiscoverData";
import useUrlFilters from "../../hooks/useUrlFilters";


function Explore() {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [articles, setArticles] = useState([]);
    const { trendingTopics, popularUsers } = useDiscoverData("articles")
    const { getParam, updateFilter, buildUrl } = useUrlFilters({
        sort: "latest",
        category: "All Categories"
    });
    const sort = getParam("sort", "latest");
    const tag = getParam("tag");
    const category = getParam("category", "All Categories");
    const url = buildUrl(`${API_URL}/api/article/explore`);
    const { loading, error, setError, hasMore, articles: fetchedArticles } = useInfiniteArticles(url, "GET", [], token)


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


    const handleSortChange = (sortValue) => updateFilter("sort", sortValue);
    const handleTagChange = (tagValue) => updateFilter("tag", tagValue, "category");
    const handleCategoryChange = (e) => {
        const catVal = e.target.value;
        updateFilter("category", catVal === "All Categories" ? "" : catVal, "tag");
    };

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

            <DevelopersToFollow developers={popularUsers} variant="cards" />


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

                <aside className="explore-sidebar">
                    <div className="sidebar-filter-section">
                        <CategorySelect
                            selectedCategory={category}
                            onChange={handleCategoryChange}
                            label="Select Category"
                            size="default"
                        />
                    </div>

                    <DevelopersToFollow developers={popularUsers} variant="list" />

                </aside>

            </div>

        </div>
    );
}

export default Explore;