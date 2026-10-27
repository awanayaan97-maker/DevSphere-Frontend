
import { useContext, useEffect, useState } from "react";
import "./Home.css";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import PostCard from "../../Components/PostCard/PostCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import useInfiniteArticles from "../../hooks/useInfiniteArticles";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ArticlesEndMessage from "../../Components/ArticlesEndMessage/ArticlesEndMessage";
import NoResults from "../../Components/NoResults/NoResults";
import { AuthContext } from "../../Context/AuthContext";
import SortDropdown from "../../Components/SortDropdown/SortDropdown";


const SORT_LABELS = {
    relevance: "Best match",
    latest: "Latest articles",
    oldest: "Oldest articles",
    mostLiked: "Most liked articles"
};

function Home() {

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [searchParam, setSearchParam] = useSearchParams();
    const searchQuery = searchParam.get("q") || null;
    const sort = searchParam.get("sort") || "latest";
    const feed = searchParam.get("feed") === "following" ? "following" : "all";
    const { socket } = useContext(AuthContext);

    let url = `${API_URL}/api/article`;

    if (searchQuery) {
        url += `/search?q=${encodeURIComponent(searchQuery)}&sort=${sort}`;
    } else {
        url += `/publish?sort=${sort}&feed=${feed}`;
    }

    const { loading, articles: fetchedArticles, hasMore, error, setError } = useInfiniteArticles(url, "GET", [], token);

    const [articles, setArticles] = useState([]);

    useEffect(() => {
        setArticles(fetchedArticles || []);
    }, [fetchedArticles]);


    useEffect(() => {
        if (!socket) return;

        socket.on("like_notification", (data) => {
            setArticles((prevArticles) =>
                prevArticles.map((article) =>
                    article._id === data.articleId
                        ? { ...article, likesCount: data.likesCount }
                        : article
                )
            );
        });

        return () => {
            socket.off("like_notification");
        };
    }, [socket]);


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
            if (value === "all") {
                newParam.delete("feed");   // URL saaf rahe
            } else {
                newParam.set("feed", value);
            }
            return newParam;
        });
    };

    const clearSearch = () => {
        setSearchParam((prev) => {
            const newParam = new URLSearchParams(prev);
            newParam.delete("q");
            newParam.delete("feed");
            if (newParam.get("sort") === "relevance") newParam.delete("sort");
            return newParam;
        });
    };

    const showEmpty = !loading && !error && articles.length === 0;

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
                            onClick={() => handleFeed("all")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={feed === "following" ? "article-feed-tab active" : "article-feed-tab"}
                            onClick={() => handleFeed("following")}
                        >
                            Following
                        </button>

                    </section>
                )

            )}

            <section className="latest-articles">

                <div className="latest-articles-header">

                    <h2>{SORT_LABELS[sort] || "Articles"}</h2>

                    <SortDropdown sort={sort} handleSort={handleSort} searchQuery={searchQuery} />

                </div>


                <div className="posts-list">

                    {articles.map((post) => (
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

                    {!hasMore && articles.length > 0 && (
                        <ArticlesEndMessage />
                    )}

                </div>

            </section>

        </main>
    );
}

export default Home;