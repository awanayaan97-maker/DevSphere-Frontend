
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "dompurify";

import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import CommentSection from "../../Components/CommentSection/CommentSection";


import useFetch from "../../hooks/useFetch";
import useCallApi from "../../hooks/useCallApi";

import "./ReadArticle.css";
import { setupSidebarSticky } from "../../utils/setupSidebarSticky";
import useLoginChecker from "../../hooks/useLoginChecker";
import { AuthContext } from "../../Context/AuthContext";
import { shortTimeAgo } from "../../utils/dateHelpers";
import Alert from "../../Components/Alert/Alert";
import UserAvatar from "../../Components/UserAvatar/UserAvatar";
import { getInitials } from "../../utils/getInitials";
import AskAiButton from "../../Components/AskAiButton/AskAiButton";
import ArticleAIChat from "../../Components/ArticleAIChat/ArticleAIChat";
import { useBookmarkToggle } from "../../hooks/useBookmarkToggle";
import { useLikeToggle } from "../../hooks/useLikeToggle";


function ReadArticle() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext)
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const commentsRef = useRef(null)
    const { loading, error, setError, data } = useFetch(
        `${API_URL}/api/article/publish/${id}`, token
    );

    const { callApi, loading: commentsLoading } = useCallApi();
    const { isLoggedIn, setIsLoggedIn } = useLoginChecker();

    const [showAlert, setShowAlert] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);

    const { showLikeAlert, setShowLikeAlert, likesCount, toggleLike, isLiked } =
        useLikeToggle({
            initialIsLiked: data?.data?.isLiked,
            initialLikesCount: data?.data?.likesCount,
            Url: `${API_URL}/api/article/like/${id}`
        })

    const { showBookmarkAlert, setShowBookmarkAlert, bookmarksCount, toggleBookmark, isBookmarked } = useBookmarkToggle({
        initialIsBookmarked: data?.data?.isBookmark,
        initialBookmarksCount: data?.data?.bookmarksCount,
        url: `${API_URL}/api/article/bookmark/${id}`
    })

    useEffect(() => {

        if (!commentsOpen) return;

        if (comments !== null) return;

        async function fetchComments() {

            const result = await callApi(
                `${API_URL}/api/article/comment/${id}`,
                "GET",
                [],
                token
            );

            if (result?.status) {
                setComments(result.data || []);
            }
        }

        fetchComments();

    }, [commentsOpen, id]);

    useEffect(() => {
        setCommentsOpen(false);
        setComments(null);
        setMessages([])
    }, [id]);


    useEffect(() => {
        return setupSidebarSticky();
    }, [data]);


    async function handleAuthCheck(type) {

        if (isLoggedIn) {
            setShowAlert(true);
            return;
        }

        if (type === "like") {
            return setIsLiked(!currentStatus)
        }

        if (type === "bookmark") {
            setIsBookmarked(!currentBookmarkStatus);
            return
        }

        if (type === 'ask-ai') {
            setIsAiOpen(true);
        }

    }

    function scrollToComments() {

        setCommentsOpen(true);

        commentsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    function getNodeText(node) {

        if (!node) {
            return "";
        }

        if (node.type === "text") {
            return node.data;
        }

        if (node.children) {

            return node.children
                .map(getNodeText)
                .join("");

        }

        return "";
    }


    async function handleAddComment() {

        if (!commentText?.trim()) return;

        if (editingCommentId !== null) {

            const oldText = comments.find(c => c._id === editingCommentId)?.text;

            setComments((prev) =>
                prev.map((c) => (c._id === editingCommentId ? { ...c, text: commentText } : c))
            );

            setCommentText("");
            setEditingCommentId(null);

            const result = await callApi(`${API_URL}/api/article/comment/${editingCommentId}`, "PATCH", { text: commentText }, token);

            if (!result?.status) {
                setComments((prev) =>
                    prev.map((c) => (c._id === editingCommentId ? { ...c, text: oldText } : c))
                );
            }

            return;
        }

        const tempId = `temp-${Date.now()}`;

        const newCommentData = {
            authorData: {
                _id: user?.data?._id,
                firstName: user?.data?.firstName,
                lastName: user?.data?.lastName,
                role: user?.data?.role,
                profileImage: user?.data?.profileImage
            },
            _id: tempId,
            articleId: id,
            text: commentText,
            hasLikeComment: false,
            commentLikes: 0,
            replies: []
        };

        setComments((prev) => (prev === null ? [newCommentData] : [...prev, newCommentData]));
        setCommentText("");

        const commentData = { text: commentText, articleId: id };
        const result = await callApi(`${API_URL}/api/article/comment`, "POST", commentData, token);

        if (result?.status && result?.data) {
            setComments((prev) => prev.map((c) => (c._id === tempId ? result.data : c)));
        } else {
            setComments((prev) => prev.filter((c) => c._id !== tempId));
        }
    }


    async function handleDeleteComment(commentId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        const result = await callApi(`${API_URL}/api/article/comment/${commentId}`, "DELETE", null, token);
    }


    if (loading) {
        return <Loader />;
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


    if (showAlert || showBookmarkAlert || showLikeAlert) return <Alert
        title="Login Required"
        message="Please log in or create an account to continue."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => {
            setShowAlert(false)
            setShowBookmarkAlert(false)
            setShowLikeAlert(false)
        }}
    />


    const article = data?.data;
    const author = article?.authorDetails;

    const cleanHTML = DOMPurify.sanitize(
        article?.content || ""
    );


    const options = {

        replace: (domNode) => {

            if (
                ["h2", "h3"].includes(domNode.name)
            ) {

                const text = getNodeText(
                    domNode
                ).trim();

                const headingId = text
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-");


                const Tag = domNode.name;


                return (
                    <Tag id={headingId}>

                        {domToReact(
                            domNode.children,
                            options
                        )}

                    </Tag>
                );
            }
        }

    };


    const parsedContent = parse(
        cleanHTML,
        options
    );

    // =================================================
    // SHARE
    // =================================================

    async function handleShare() {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

        } catch (error) {

            console.log(
                "Could not copy article link."
            );

        }

    }

    return (

        <main className="read-article-page">

            <div className="read-article-grid">


                {/* =================================================
                    LEFT INTERACTION RAIL
                ================================================= */}

                <aside className="article-interaction-rail">


                    {/* LIKE */}

                    <button
                        type="button"
                        className={`article-rail-button ${isLiked
                            ? "article-rail-button-active"
                            : ""
                            }`}
                        onClick={toggleLike}
                        aria-label="Like article"
                        title="Like article"
                    >

                        {isLiked ? (
                            <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i>
                        ) : (
                            <i className="fa-regular fa-heart"></i>
                        )}

                        <span>
                            {likesCount}
                        </span>

                    </button>


                    {/* COMMENTS */}

                    <button
                        type="button"
                        className="article-rail-button"
                        onClick={scrollToComments}
                        aria-label="View comments"
                        title="View comments"
                    >

                        <i className="fa-regular fa-comment"></i>

                        <span>
                            {comments ? comments?.length : data?.data?.commentsCount}
                        </span>

                    </button>



                    {/* BOOKMARK */}

                    <button
                        type="button"
                        className={`article-rail-button ${isBookmarked
                            ? "article-rail-button-active"
                            : ""
                            }`}
                        onClick={toggleBookmark}
                        aria-label="Bookmark article"
                        title="Bookmark article"
                    >

                        <i
                            className={
                                isBookmarked
                                    ? "fa-solid fa-bookmark"
                                    : "fa-regular fa-bookmark"
                            }
                        ></i>

                        <span>
                            {bookmarksCount}
                        </span>

                    </button>



                    {/* SHARE */}

                    <button
                        type="button"
                        className="article-rail-button"
                        onClick={handleShare}
                        aria-label="Share article"
                        title="Copy article link"
                    >

                        <i className="fa-solid fa-share-nodes"></i>

                    </button>


                    {/* ASK AI */}

                    <AskAiButton onClick={() => handleAuthCheck("ask-ai")} value={"Ask AI"} />

                </aside>

                {/* =================================================
                    CENTER CONTENT
                ================================================= */}

                <div className="article-main-content">


                    {/* =================================================
                        ARTICLE HEADER
                    ================================================= */}

                    <header className="article-read-header">


                        {/* CATEGORY */}

                        {article?.category ? (

                            <div className="article-read-category">

                                {article.category}

                            </div>

                        ) : null}



                        {/* TITLE */}

                        <h1>

                            {article?.title}

                        </h1>



                        {/* DESCRIPTION */}

                        {article?.description ? (

                            <p className="article-read-description">

                                {article.description}

                            </p>

                        ) : null}



                        {/* AUTHOR / META */}

                        <div className="article-read-author">

                            <UserAvatar userData={author} id={article?.author} />

                            <div className="article-author-info">

                                <strong>

                                    {getInitials(author)}

                                </strong>


                                {author?.role ? (

                                    <span>

                                        {author.role}

                                    </span>

                                ) : null}

                            </div>



                            <span className="article-header-divider">
                                •
                            </span>

                            <span className="article-meta">

                                {shortTimeAgo(article?.createdAt)} - ago

                            </span>

                            {article?.readTime ? (

                                <>

                                    <span className="article-header-divider">
                                        •
                                    </span>

                                    <span className="article-meta">

                                        {article.readTime} min read

                                    </span>

                                </>

                            ) : null}

                        </div>



                        {/* TAGS */}

                        {article?.tags?.length > 0 ? (

                            <div className="article-read-tags">

                                {article.tags.map(
                                    (tag) => (

                                        <span
                                            key={tag.tagId}
                                        >

                                            #{tag.tagValue}

                                        </span>

                                    )
                                )}

                            </div>

                        ) : null}

                    </header>



                    {/* =================================================
                        ARTICLE BODY
                    ================================================= */}

                    <article className="article-body">

                        <div className="article-content">

                            {parsedContent}

                        </div>


                        {/* =================================================
                            ARTICLE END
                        ================================================= */}

                        {/* <div className="article-end">

                            <span>
                                End of article
                            </span>

                        </div> */}


                        {/* =================================================
                            COMMENTS
                        ================================================= */}

                        <section ref={commentsRef} >

                            {!commentsOpen && (

                                <button
                                    type="button"
                                    className="article-comments-toggle"
                                    onClick={() => setCommentsOpen(true)}
                                >
                                    <div className="comments-toggle-left">
                                        <i className="fa-regular fa-comments"></i>

                                        <div>
                                            <span className="comments-eyebrow">Discussion</span>
                                            <h2>Comments</h2>
                                        </div>
                                    </div>

                                    <div className="comments-toggle-right">
                                        <span className="comments-count">{comments ? comments?.length : data?.data?.commentsCount} comments</span>
                                        <i className="fa-solid fa-chevron-down"></i>
                                    </div>
                                </button>

                            )}

                            {commentsOpen && (
                                <CommentSection
                                    comments={comments || []}
                                    loading={commentsLoading}
                                    onClose={() => setCommentsOpen(false)}
                                    onAddComment={handleAddComment}
                                    onDeleteComment={handleDeleteComment}
                                    commentText={commentText}
                                    setCommentText={setCommentText}
                                    setEditingCommentId={setEditingCommentId}
                                    onInput={handleAuthCheck}
                                />
                            )}

                        </section>

                    </article>

                </div>



                {/* =================================================
                    RIGHT SIDEBAR
                ================================================= */}

                <aside className="article-read-sidebar">


                    {/* =================================================
                        AUTHOR CARD
                    ================================================= */}

                    <div className="article-sidebar-card article-author-card">


                        <div className="sidebar-card-label">
                            Written by
                        </div>



                        <div className="sidebar-author-content">

                            <UserAvatar userData={author} id={article?.author} />

                            <div className="sidebar-author-info">

                                <strong>
                                    {getInitials(author)}
                                </strong>


                                {author?.role ? (

                                    <span>
                                        {author.role}
                                    </span>

                                ) : null}

                            </div>

                        </div>



                        <button
                            type="button"
                            className="sidebar-view-profile"
                            onClick={() =>
                                navigate(
                                    `/user/${article?.author}`
                                )
                            }
                        >

                            View Profile

                        </button>

                    </div>



                    {/* =================================================
                        ARTICLE INFO
                    ================================================= */}

                    <div className="article-sidebar-card">


                        <div className="sidebar-card-title">

                            <span>
                                Article
                            </span>

                            <i className="fa-regular fa-file-lines"></i>

                        </div>



                        {article?.category ? (

                            <div className="sidebar-detail">

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {article.category}
                                </strong>

                            </div>

                        ) : null}



                        {article?.readTime ? (

                            <div className="sidebar-detail">

                                <span>
                                    Reading time
                                </span>

                                <strong>
                                    {article.readTime} min read
                                </strong>

                            </div>

                        ) : null}


                        <div className="sidebar-detail">

                            <span>
                                Published
                            </span>

                            <strong>
                                {shortTimeAgo(article?.createdAt)}
                            </strong>

                        </div>



                        <div className="sidebar-detail">

                            <span>
                                Engagement
                            </span>

                            <strong>
                                {data?.data?.likesCount} Likes
                                {" · "}
                                {comments ? comments.length : data?.data?.commentsCount} Comments
                            </strong>

                        </div>

                    </div>



                    {/* =================================================
                        TABLE OF CONTENT
                    ================================================= */}

                    {article?.tableOfContent?.length > 0 ? (

                        <div className="article-sidebar-card article-outline">


                            <div className="sidebar-card-title">

                                <span>
                                    In this article
                                </span>

                            </div>



                            <nav>

                                {article.tableOfContent.map(
                                    (item) => (

                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                        >

                                            {item.text}

                                        </a>

                                    )
                                )}

                            </nav>

                        </div>

                    ) : null}

                </aside>

            </div>

            {isAiOpen ?
                <ArticleAIChat
                    articleId={id}
                    isOpen={isAiOpen}
                    onClose={() => setIsAiOpen(false)}
                    messages={messages}
                    setMessages={setMessages}
                />

                :

                ""
            }

        </main>
    );
}

export default ReadArticle;