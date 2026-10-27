
import { useEffect, useMemo, useState } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import NoResults from "../../Components/NoResults/NoResults";

import "./Bookmarks.css";
import useCallApi from "../../hooks/useCallApi";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import CommunityPostCard from "../../Components/CommunityPostCard/CommunityPostCard";

function Bookmarks() {


    const navigate = useNavigate()
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [data, setData] = useState([])
    const [sortBy, setSortBy] = useState("recent");
    const [showAlert, setShowAlert] = useState(false);
    const [activeTab, setActiveTab] = useState("articles");
    const { isLoggedIn, setIsLoggedIn } = useLoginChecker();
    const { callApi, loading, error, setError, } = useCallApi();


    useEffect(() => {

        if (isLoggedIn) {
            setShowAlert(true)
            return
        }

        async function getBookmarks() {

            let source = activeTab?.trim() === "articles" ? `source=articles` : `source=posts`

            const result = await callApi(`${API_URL}/api/discover/bookmark?${source}`, "GET", [], token);

            if (result) {
                console.log(result);
                setData(result.data)
            } else {
                setError(result?.message)
            }

        }

        getBookmarks()

    }, [activeTab])

    if (showAlert) return <Alert
        title="Login Required"
        message="Please login or create an account"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate('/')}
    />

    if (loading) return <SectionLoader />

    if (error) {

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