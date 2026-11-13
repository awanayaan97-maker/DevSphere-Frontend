
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "dompurify";

import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import CommentSection from "../../Components/CommentSection/CommentSection";
import "./ReadArticle.css";
import { setupSidebarSticky } from "../../utils/setupSidebarSticky";
import { shortTimeAgo } from "../../utils/dateHelpers";
import Alert from "../../Components/Alert/Alert";
import UserAvatar from "../../Components/UserAvatar/UserAvatar";
import { getInitials } from "../../utils/getInitials";
import AskAiButton from "../../Components/AskAiButton/AskAiButton";
import ArticleAIChat from "../../Components/ArticleAIChat/ArticleAIChat";
import { useBookmarkToggle } from "../../hooks/useBookmarkToggle";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import useApiQuery from "../../hooks/useApiQuery";
import useCheckLogin from "../../hooks/useCheckLogin";
import useComments from "../../hooks/useComments";


function ReadArticle() {

    const { id } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const commentsRef = useRef(null);
    const { isLoading, error, setError, data, queryKey } = useApiQuery({
        url: `${API_URL}/api/article/publish/${id}`,
        type: "GET",
        isAuthorized: false
    })

    const { showAlert, setShowAlert, check } = useCheckLogin();
    const [messages, setMessages] = useState([]);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const { showLikeAlert, setShowLikeAlert, toggleLikeMutation } = useLikeToggle();

    const { commentsOpen, setCommentsOpen, comments, commentsQueryKey, commentsLoading, handleAddComment, commentText, setCommentText, setEditingCommentId, handleDeleteComment } = useComments(id, "article");

    const { showBookmarkAlert, setShowBookmarkAlert, bookmarksCount, toggleBookmark, isBookmarked } = useBookmarkToggle({
        initialIsBookmarked: data?.isBookmark,
        initialBookmarksCount: data?.bookmarksCount,
        url: `${API_URL}/api/article/bookmark/${id}`
    })



    useEffect(() => {
        return setupSidebarSticky();
    }, [data]);


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

    function handleLikeClick() {
        toggleLikeMutation.mutate({
            url: `${API_URL}/api/article/like/${id}`,
            itemId: id,
            queryKey
        })
    }


    if (isLoading) {
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

    const article = data;
    const author = article?.authorDetails;
    const cleanHTML = DOMPurify.sanitize(article?.content || "");

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

    async function handleShare() {

        try {
            await navigator.clipboard.writeText(
                window.location.href
            );
        } catch (error) {
            setError("Could not copy article link.")
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
                        className={`article-rail-button ${article?.isLiked
                            ? "article-rail-button-active"
                            : ""
                            }`}
                        onClick={handleLikeClick}
                        aria-label="Like article"
                        title="Like article"
                    >

                        {article?.isLiked ? (
                            <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i>
                        ) : (
                            <i className="fa-regular fa-heart"></i>
                        )}

                        <span>
                            {article?.likesCount}
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
                            {data ? article?.commentsCount : 0}
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

                    <AskAiButton onClick={() => check(setIsAiOpen)} value={"Ask AI"} />

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
                                        <span className="comments-count">{data ? article?.commentsCount : 0} comments</span>
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
                                    onInput={check}
                                    commentsQueryKey={commentsQueryKey}
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