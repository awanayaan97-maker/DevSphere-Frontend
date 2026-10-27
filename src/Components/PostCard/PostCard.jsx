

import "./PostCard.css";
import { shortTimeAgo } from "../../utils/dateHelpers";
import { data, useNavigate } from "react-router-dom";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import useCallApi from "../../hooks/useCallApi";
import { AuthContext } from "../../Context/AuthContext";
import { useState, useEffect, useRef, useContext } from "react";
import SectionLoader from "../SectionLoader/SectionLoader";
import CommentSection from "../CommentSection/CommentSection";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useBookmarkToggle } from "../../hooks/useBookmarkToggle";

function PostCard({ post, isBookmarkPage }) {

    const { user, socket } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useLoginChecker();
    const [showAlert, setShowAlert] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentText, setCommentText] = useState("");

    const { callApi, loading } = useCallApi();

    const { showLikeAlert, setShowLikeAlert, likesCount, toggleLike, isLiked } =
        useLikeToggle({
            initialIsLiked: post?.isLiked,
            initialLikesCount: post?.likesCount,
            Url: `${API_URL}/api/article/like/${post._id}`
        })

    const { showBookmarkAlert, setShowBookmarkAlert, bookmarksCount, toggleBookmark, isBookmarked } = useBookmarkToggle({
        initialIsBookmarked: post?.isBookmark,
        initialBookmarksCount: post?.bookmarkCounts,
        url: `${API_URL}/api/article/bookmark/${post._id}`,
    })

    const menuRef = useRef(null);
    const articleId = { articleId: post._id };
    const plainText = stripHTML(post.content);
    const preview = handlePostDescription(plainText, 200);
    const isOwnArticle = !isBookmarkPage && (post?.authorDetails?._id === user?.data?._id);

    function stripHTML(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    }

    async function handleAuthCheck(type) {

        if (isLoggedIn) {
            setShowAlert(true);
            return;
        }

        if (type?.trim() === "like") {
            setIsLiked(!currentStatus);
        }

        return true;
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
            articleId: post?._id,
            text: commentText,
            hasLikeComment: false,
            commentLikes: 0,
            replies: []
        };

        setComments((prev) => (prev === null ? [newCommentData] : [...prev, newCommentData]));
        setCommentText("");

        const commentData = { text: commentText, articleId: post?._id };
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

    function handlePostDescription(text, maxLength = 200) {

        if (text.length <= maxLength) return text;

        const trimText = text?.slice(0, maxLength);
        const checkText = trimText.lastIndexOf('.') !== -1 ? trimText.lastIndexOf('.') : trimText.lastIndexOf('!') ? trimText.lastIndexOf('!') : -1

        if (checkText === -1) {
            return `${trimText}...`
        }

        return trimText.slice(0, checkText + 1)

    }

    const handleDeleteDraft = (draftId) => {
        setMenuOpen(false);

        const deleteDraft = async () => {
            const result = await callApi(`${API_URL}/api/article/${draftId}`, "DELETE", [], token);
            if (result?.status) return window.location.reload();
            setError(result?.message);
        };

        deleteDraft();
    };


    useEffect(() => {
        if (!socket) return;

        socket.on("new_comment", (commentData) => {
            console.log("Live comment received on PostCard:", commentData);

            setComments((prevComments) => {
                if (!prevComments || !Array.isArray(prevComments)) {
                    return [commentData];
                }

                return [...prevComments, commentData];
            });
        });

        return () => {
            socket.off("new_comment");
        };
    }, [socket]);

    useEffect(() => {

        if (!commentsOpen) return;

        if (comments !== null) return;

        async function fetchComments() {

            const result = await callApi(
                `${API_URL}/api/article/comment/${post._id}`,
                "GET",
                [],
                token
            );

            if (result?.status) {
                setComments(result.data || []);
            }
        }

        fetchComments();

    }, [commentsOpen]);


    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (showAlert || showLikeAlert || showBookmarkAlert) return <Alert
        title="Login Required"
        message="Please log in or create an account to continue."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => {
            setShowAlert(false)
            setShowLikeAlert(false)
            setShowBookmarkAlert(false)
        }}
    />

    return (
        <article className="post-card">

            {isOwnArticle ? (
                <div className="post-card-menu" ref={menuRef}>

                    <button
                        type="button"
                        className="post-menu-trigger"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {menuOpen ? (
                        <div className="post-menu-dropdown">

                            <button
                                type="button"
                                onClick={() => navigate(`/article-editor/${post._id}`)}
                            >
                                <i className="fa-regular fa-pen-to-square"></i>
                                Edit Article
                            </button>

                            <button
                                type="button"
                                className="delete-option"
                                onClick={() => handleDeleteDraft(post._id)}
                            >
                                <i className="fa-regular fa-trash-can"></i>
                                Delete Article
                            </button>

                        </div>
                    ) : null}

                </div>
            ) : null}


            {/* Author Header Section */}
            <div className="post-header">
                <div className="post-author">
                    <div className="author-avatar" onClick={() => navigate(`/user/${post.authorDetails?._id}`)}>
                        {post?.authorDetails?.profileImage ? (
                            <img
                                src={post?.authorDetails?.profileImage}
                                alt={post?.authorDetails?.firstName}
                            />
                        ) : (
                            <p>
                                {`${post.authorDetails?.firstName?.charAt(0) || ''}${post.authorDetails?.lastName?.charAt(0) || ''}`}
                            </p>
                        )}
                    </div>

                    <div className="author-info">
                        <div className="author-name-row">
                            <h3>
                                {post.authorDetails?.firstName} {post.authorDetails?.lastName}
                            </h3>
                            <span className="post-date">
                                • {shortTimeAgo(post.createdAt)}
                            </span>
                        </div>
                        <p className="author-role">
                            {post.authorDetails?.role || ""}
                        </p>
                    </div>
                </div>

            </div>

            {/* Article Content */}
            <div className="post-content">
                <div className="post-category">
                    {post.category}
                </div>

                <h2>
                    {post.title}
                </h2>

                <p className="post-description">
                    {post.description ? post.description : preview}
                </p>

                <div className="post-tags">
                    {post.tags?.map((tag) => (
                        <span key={tag?.tagId}>
                            #{tag?.tagValue}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="post-footer">
                <div className="post-stats">
                    <span onClick={toggleLike} className="like-btn">
                        {isLiked ? (
                            <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i>
                        ) : (
                            <i className="fa-regular fa-heart"></i>
                        )}

                        <span className="stat-count">
                            {likesCount}
                        </span>
                    </span>

                    <span
                        className={`comment-btn ${commentsOpen ? "comment-btn-active" : ""}`}
                        onClick={() => setCommentsOpen(prev => !prev)}
                    >
                        <i className="fa-regular fa-comment"></i>
                        <span className="stat-count">{!comments ? post.commentsCount : comments?.length}</span>
                    </span>

                    <span
                        onClick={toggleBookmark}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            padding: "0",
                            margin: "0",
                            boxShadow: "none"
                        }}
                    >
                        {isBookmarked ? (
                            <i className="fa-solid fa-bookmark" style={{ color: "var(--color-accent)" }}></i>
                        ) : (
                            <i className="fa-regular fa-bookmark"></i>
                        )}
                        <span className="stat-count" style={{ lineHeight: "1" }}>
                            {bookmarksCount}
                        </span>
                    </span>

                </div>

                <button className="read-article-button" onClick={() => navigate(`/article/${post._id}`)}>
                    Read article
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>


            {commentsOpen && (
                <CommentSection
                    comments={comments}
                    loading={loading}
                    onClose={() => setCommentsOpen(false)}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    setEditingCommentId={setEditingCommentId}
                    onInput={handleAuthCheck}
                />
            )}

        </article>
    );
}

export default PostCard;