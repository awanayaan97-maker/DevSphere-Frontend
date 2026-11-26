
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
    const { bookmarkAlert, setBookmarkAlert, toggleBookmarkMutation } = useBookmarkToggle();

    const { commentsOpen, setCommentsOpen, comments, commentsQueryKey, commentsLoading, handleAddComment, commentText, setCommentText, setEditingCommentId, handleDeleteComment } = useComments(id, "article");

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

    function getTableRows(tableNode) {
        const rows = [];

        function visit(node) {
            if (!node?.children) return;

            node.children.forEach((child) => {
                if (child.name === "tr") {
                    rows.push(child);
                } else if (child.name !== "table") {
                    visit(child);
                }
            });
        }

        visit(tableNode);

        return rows;
    }

    function getTableCells(rowNode) {
        return (rowNode?.children || []).filter(
            (child) =>
                child.name === "th" ||
                child.name === "td"
        );
    }

    function handleLikeClick() {
        toggleLikeMutation.mutate({
            url: `${API_URL}/api/article/like/${id}`,
            itemId: id,
            queryKey
        })
    }

    function handleBookmarkClick() {
        toggleBookmarkMutation.mutate({
            url: `${API_URL}/api/article/bookmark/${id}`,
            itemId: id,
            queryKey
        })
    }


    if (isLoading) return <Loader />;
    if (error) return <ResponsePopup message={error} closePopup={() => setError(null)} />;
    if (data.length === 0) return null

    if (showAlert || bookmarkAlert || showLikeAlert) return <Alert
        title="Login Required"
        message="Please log in or create an account to continue."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => {
            setShowAlert(false)
            setBookmarkAlert(false)
            setShowLikeAlert(false)
        }}
    />

    const article = data;
    const author = article?.authorDetails;
    const cleanHTML = DOMPurify.sanitize(article?.content || "");

    const options = {

        replace: (domNode) => {

            if (domNode.name === "table") {

                const rows = getTableRows(domNode);
                const headerRowIndex = rows.findIndex(
                    (row) =>
                        getTableCells(row).some(
                            (cell) => cell.name === "th"
                        )
                );

                if (headerRowIndex === -1) {
                    return (
                        <div className="article-table-wrap is-unstructured">

                            <table className="article-table-desktop">
                                {domToReact(domNode.children, options)}
                            </table>

                        </div>
                    );
                }

                const headerCells = getTableCells(
                    rows[headerRowIndex]
                );

                const headers = headerCells.map(
                    (cell) => getNodeText(cell).trim()
                );

                const hasHeaderLabels = headers.some(
                    (header) => header.length > 0
                );

                const dataRows = rows.filter(
                    (_, index) => index !== headerRowIndex
                );

                if (!hasHeaderLabels || dataRows.length === 0) {
                    return (
                        <div className="article-table-wrap is-unstructured">

                            <table className="article-table-desktop">
                                {domToReact(domNode.children, options)}
                            </table>

                        </div>
                    );
                }

                const isSingleColumn = headers.length === 1;
                const firstColumnIsTitle =
                    headers.length > 1 && !headers[0];

                return (

                    <div className="article-table-wrap">
                        <table className="article-table-desktop">

                            {domToReact(
                                domNode.children,
                                options
                            )}

                        </table>

                        <div className="article-table-mobile">

                            {isSingleColumn && (

                                <div className="article-table-mobile-heading">
                                    {headers[0]}
                                </div>

                            )}


                            {dataRows.map((row, rowIndex) => {

                                const cells = getTableCells(row);

                                if (cells.length === 0) return null;

                                if (
                                    isSingleColumn &&
                                    cells.length === 1
                                ) {

                                    return (

                                        <div
                                            className="article-table-card"
                                            key={rowIndex}
                                        >
                                            <div className="article-table-card-value">

                                                {domToReact(
                                                    cells[0].children,
                                                    options
                                                )}

                                            </div>

                                        </div>

                                    );
                                }

                                if (firstColumnIsTitle) {

                                    const title = getNodeText(
                                        cells[0]
                                    ).trim();

                                    return (

                                        <div
                                            className="article-table-card"
                                            key={rowIndex}
                                        >

                                            {title && (

                                                <div className="article-table-card-title">

                                                    {domToReact(
                                                        cells[0].children,
                                                        options
                                                    )}

                                                </div>

                                            )}


                                            {cells.slice(1).map(
                                                (cell, cellIndex) => {

                                                    const headerIndex = cellIndex + 1;

                                                    return (

                                                        <div
                                                            className="article-table-card-field"
                                                            key={cellIndex}
                                                        >

                                                            <span className="article-table-card-label">

                                                                {headers[headerIndex] ||
                                                                    `Column ${headerIndex + 1}`}

                                                            </span>


                                                            <div className="article-table-card-value">

                                                                {domToReact(
                                                                    cell.children,
                                                                    options
                                                                )}

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    );
                                }

                                return (

                                    <div
                                        className="article-table-card"
                                        key={rowIndex}
                                    >

                                        {cells.map((cell, cellIndex) => {

                                            const label =
                                                headers[cellIndex] ||
                                                `Column ${cellIndex + 1}`;

                                            return (

                                                <div
                                                    className="article-table-card-field"
                                                    key={cellIndex}
                                                >

                                                    <span className="article-table-card-label">
                                                        {label}
                                                    </span>


                                                    <div className="article-table-card-value">

                                                        {domToReact(
                                                            cell.children,
                                                            options
                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        })}

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                );
            }


            if (["h2", "h3"].includes(domNode.name)) {

                const text = getNodeText(domNode).trim();
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
                        className={`article-rail-button ${article.isBookmark
                            ? "article-rail-button-active"
                            : ""
                            }`}
                        onClick={handleBookmarkClick}
                        aria-label="Bookmark article"
                        title="Bookmark article"
                    >

                        <i
                            className={
                                article.isBookmark
                                    ? "fa-solid fa-bookmark"
                                    : "fa-regular fa-bookmark"
                            }
                        ></i>

                        <span>
                            {article.bookmarksCount}
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

                    </header>



                    {/* =================================================
                        ARTICLE BODY
                    ================================================= */}

                    <article className="article-body">

                        <div className="article-content">

                            {parsedContent}

                        </div>


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

                                        <div >
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