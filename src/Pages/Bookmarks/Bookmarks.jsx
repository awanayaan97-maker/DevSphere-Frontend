
import { useState } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import "./Bookmarks.css";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import CommunityPostCard from "../../Components/CommunityPostCard/CommunityPostCard";
import useApiQuery from "../../hooks/useApiQuery";

function Bookmarks() {

    const navigate = useNavigate()
    const API_URL = import.meta.env.VITE_API_URL;
    const [activeTab, setActiveTab] = useState("articles");
    const { isLoggedIn } = useLoginChecker();
    const { data, isError, isLoading, error, setError } = useApiQuery({
        url: `${API_URL}/api/discover/bookmark?source=${activeTab}`,
        type: "GET",
        isAuthorized: true
    })

    if (!isLoggedIn) return <Alert
        title="Login Required"
        message="Please login or create an account"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate('/')}
    />

    if (isLoading) return <SectionLoader />

    if (isError) {

        return (
            <ResponsePopup
                message={error}
                closePopup={() => setError(null)}
            />
        );

    }

    return (
        <main className="bookmarks-page">

            {/* Header */}
            <section className="bookmarks-header">
                <div className="bookmarks-title-wrapper">
                    <div className="bookmarks-icon">
                        <i className="fa-solid fa-bookmark"></i>
                    </div>

                    <div>
                        <h1>Bookmarks</h1>
                        <p>
                            {activeTab === "articles"
                                ? "Articles you've saved to read later."
                                : "Community posts you've saved for later."}
                        </p>
                    </div>
                </div>

                <div className="bookmarks-count">
                    <i className="fa-solid fa-bookmark"></i>
                    <span>
                        {data?.length || 0} Saved
                    </span>
                </div>
            </section>

            <div className="bookmarks-tabs">
                <button
                    className={`bookmarks-tab ${activeTab === "articles" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("articles")}
                >
                    <i className="fa-solid fa-newspaper"></i>
                    Articles
                </button>

                <button
                    className={`bookmarks-tab ${activeTab === "posts" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("posts")}
                >
                    <i className="fa-solid fa-users"></i>
                    Posts
                </button>
            </div>

            {/* Results heading */}
            <div className="bookmarks-results-header">
                <div>
                    <h2>
                        {activeTab === "articles"
                            ? "Saved Articles"
                            : "Saved Posts"}
                    </h2>

                    <span>
                        {activeTab === "articles"
                            ? `${data?.length || 0} ${data?.length === 1 ? "article" : "articles"
                            }`
                            : `${data?.length || 0} ${data?.length === 1 ? "post" : "posts"
                            }`}
                    </span>
                </div>
            </div>



            {/* Articles / Posts */}
            {activeTab === "articles" ? (

                data?.length > 0 ? (

                    <section className="bookmarks-articles">

                        {data?.map((article) => (
                            <PostCard
                                key={article._id}
                                post={article}
                                isBookmarkPage={true}
                            />
                        ))}

                    </section>

                ) : (

                    <div className="bookmarks-empty">

                        <div className="bookmarks-empty-icon">
                            <i className="fa-regular fa-bookmark"></i>
                        </div>

                        <h3>No saved articles yet</h3>

                        <p>
                            Articles you bookmark will appear
                            here so you can easily read them later.
                        </p>

                    </div>

                )

            ) : (

                data?.length > 0 ? (

                    <section className="bookmarks-posts">

                        {data?.map((post) => (
                            <CommunityPostCard
                                key={post._id}
                                post={post}
                                isBookmarkPage={true}
                            />
                        ))}

                    </section>

                ) : (

                    <div className="bookmarks-empty">

                        <div className="bookmarks-empty-icon">
                            <i className="fa-regular fa-bookmark"></i>
                        </div>

                        <h3>No saved posts yet</h3>

                        <p>
                            Community posts you bookmark will appear
                            here so you can easily find them later.
                        </p>

                    </div>

                )

            )}

        </main>
    );
}

export default Bookmarks;