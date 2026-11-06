
import { useContext, useEffect, useState } from "react";
import "./Home.css";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import PostCard from "../../Components/PostCard/PostCard";
import { useNavigate } from "react-router-dom";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import NoResults from "../../Components/NoResults/NoResults";
import { AuthContext } from "../../Context/AuthContext";
import SortDropdown from "../../Components/SortDropdown/SortDropdown";
import { SORT_LABELS } from "../../constants/appConstants";
import useUrlFilters from "../../hooks/useUrlFilters";
import usePaginationQuery from "../../hooks/usePaginationQuery";
import { useQueryClient } from "@tanstack/react-query";


function Home() {

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const { socket } = useContext(AuthContext);
    const { getParam, buildUrl, updateFilter, removeFilter } = useUrlFilters({
        sort: "latest",
        feed: "all"
    })
    const sort = getParam("sort", "latest");
    const feed = getParam("feed", 'all');
    const searchQuery = getParam("q", null)
    const url = searchQuery ? buildUrl(`${API_URL}/api/article/search`)
        : buildUrl(`${API_URL}/api/article/publish`)

    const { loading, fetchData, hasMore, error, setError } = usePaginationQuery(url, "GET", [], token);

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
                    )
                };
            });
        };

        socket.on("like_notification", onLike);
        return () => socket.off("like_notification", onLike);

    }, [socket, queryClient]);

    const handleSortChange = (e) => {
        const sortValue = e.target.value;
        updateFilter("sort", sortValue)
    }
    const clearSearch = () => {
        if (sort === "relevance") {
            removeFilter(['q', 'feed', 'sort'])
        } else {
            removeFilter(['q', 'feed'])
        }
    }
    const handleFeedChange = (value) => updateFilter('feed', value)
    const showEmpty = !loading && !error && fetchData.length === 0;

    return (
        <main className="home-page">

            {error ? <ResponsePopup message={error} closePopup={() => setError(null)} /> : ''}

            <section className="home-header">

                <div className="home-header-content">
                    <span className="home-eyebrow">DEVELOPER COMMUNITY</span>
                    <h1>Discover what developers are building.</h1>
                    <p>
                        Read ideas, share knowledge and connect with
                        developers from around the world.
                    </p>
                </div>

                <button
                    type="button"
                    className="create-article-button"
                    onClick={() => navigate('/article-editor')}
                >
                    <i className="fa-solid fa-plus"></i>
                    Create Article
                </button>

            </section>


            {/* =========================
                SEARCH MODE  ya  TABS
            ========================= */}

            {searchQuery ? (

                <section className="search-banner">

                    <div className="search-banner-info">

                        <div className="search-banner-icon">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </div>

                        <div className="search-banner-text">
                            <span className="search-banner-label">Search results for</span>
                            <strong className="search-banner-query" title={searchQuery}>
                                {searchQuery}
                            </strong>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="search-banner-clear"
                        onClick={clearSearch}
                        aria-label="Clear search"
                    >
                        <i className="fa-solid fa-xmark"></i>
                        <span>Clear</span>
                    </button>

                </section>

            ) : (

                // Guest ke liye Following ka koi matlab nahi, to tabs hide
                token && (
                    <section className="article-feed-tabs">

                        <button
                            type="button"
                            className={feed === "all" ? "article-feed-tab active" : "article-feed-tab"}
                            onClick={() => handleFeedChange("all")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={feed === "following" ? "article-feed-tab active" : "article-feed-tab"}
                            onClick={() => handleFeedChange("following")}
                        >
                            Following
                        </button>

                    </section>
                )

            )}

            <section className="latest-articles">

                <div className="latest-articles-header">

                    <h2>{SORT_LABELS[sort] || "Articles"}</h2>

                    <SortDropdown sort={sort} handleSort={handleSortChange} searchQuery={searchQuery} />

                </div>


                <div className="posts-list">

                    {fetchData.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}

                    {loading && (
                        <div className="loader">
                            <SectionLoader />
                        </div>
                    )}

                    {showEmpty && searchQuery && (
                        <NoResults
                            title="No articles found"
                            message={`We couldn't find any articles matching "${searchQuery}". Try searching with different keywords.`}
                        />
                    )}

                    {showEmpty && !searchQuery && feed === "following" && (
                        <>
                            <NoResults
                                title="Nothing here yet"
                                message="Follow developers to see their articles in this feed."
                            />
                            <button
                                type="button"
                                className="feed-empty-action"
                                onClick={() => navigate("/explore")}
                            >
                                <i className="fa-solid fa-compass"></i>
                                Find developers in Explore
                            </button>
                        </>
                    )}

                    {showEmpty && !searchQuery && feed === "all" && (
                        <NoResults
                            title="No articles yet"
                            message="Be the first to share something with the community."
                        />
                    )}

                    {!hasMore && fetchData.length > 0 && (
                        <ArticlesEndMessage />
                    )}

                </div>

            </section>

        </main>
    );
}

export default Home;