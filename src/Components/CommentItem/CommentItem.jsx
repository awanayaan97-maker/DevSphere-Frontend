

import { useContext, useEffect, useRef, useState } from "react";
import "./CommentItem.css";
import ReplyItem from "../ReplyItem/ReplyItem";
import useCallApi from "../../hooks/useCallApi";
import { AuthContext } from "../../Context/AuthContext";
import { shortTimeAgo } from "../../utils/dateHelpers";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import Alert from "../Alert/Alert";

function CommentItem({ comment, onDeleteComment, setCommentText, setEditingCommentId }) {

    const { callApi } = useCallApi();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { user, socket } = useContext(AuthContext)
    const [repliesOpen, setRepliesOpen] = useState(false);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyData, setReplyData] = useState(comment?.replies);
    const [replyId, setReplyId] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const pathname = window.location.pathname;
    const isCommunity = pathname.startsWith("/community");
    const isOwnComment = comment?.authorData?._id === user?.data?._id;
    const url = isCommunity
        ? `${API_URL}/api/posts/like-postComment/${comment._id}`
        : `${API_URL}/api/article/like-articleComment/${comment._id}`;

    const { showLikeAlert, setShowLikeAlert, likesCount, toggleLike, isLiked } =
        useLikeToggle({
            initialIsLiked: comment?.hasLikeComment,
            initialLikesCount: comment?.commentLikes,
            Url: url
        })


    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleReplySubmit() {

        let url = ""

        if (replyId !== null) {

            const oldText = replyData.find(c => c._id === replyId)?.text;

            setReplyData((prev) =>
                prev.map((c) => (c._id === replyId ? { ...c, text: replyText } : c))
            );

            setReplyText("");
            setReplyId(null);

            isCommunity ? url = `${API_URL}/api/posts/comment/${replyId}` : `${API_URL}/api/article/comment/${replyId}`

            const result = await callApi(url, "PATCH", { text: replyText }, token);

            if (!result?.status) {
                setReplyData((prev) =>
                    prev.map((c) => (c._id === replyId ? { ...c, text: oldText } : c))
                );
            }

            return;
        }


        if (!replyText.trim()) return;

        const tempId = `temp-${Date.now()}`;

        const newCommentReply = {
            _id: tempId,
            articleId: comment.articleId,
            user: comment.authorData._id,
            text: replyText,
            parentComment: null,
            likes: [],
            authorData: {
                _id: user.data._id,
                firstName: user.data.firstName,
                lastName: user.data.lastName,
                role: user.data.role,
                profileImage: user.data.profileImage
            }
        }

        if (!replyData || replyData?.length === 0) {
            setReplyData([newCommentReply])
        }

        else {
            setReplyData((prevData) => [...prevData, newCommentReply])
        }

        setReplyText("");
        setReplying(false);

        const data = {
            text: replyText,
            parentComment: comment._id
        }

        isCommunity ? url = `${API_URL}/api/posts/comment/${comment._id}` : `${API_URL}/api/article/comment/${comment._id}`

        const result = await callApi(url, "POST", data, token);

        if (result?.status && result?.data) {

            setReplyData((prev) =>
                prev.map((c) => (c._id === tempId ? result.data : c))
            );

        } else {
            setReplyData((prev) => prev.filter((c) => c._id !== tempId));
        }

    }

    async function handleDeleteReply(id) {

        let url = ""
        setReplyData((prevData) => prevData.filter((c) => c._id !== id));

        isCommunity ? url = `${API_URL}/api/posts/comment/${id}` : `${API_URL}/api/article/comment/${id}`
        const result = await callApi(url, "DELETE", null, token);
    }

    function handleDeleteComment() {
        setMenuOpen(false);
        onDeleteComment(comment._id)
    }

    function handleEditComment() {
        setMenuOpen(false);
        setCommentText(comment?.text)
        setEditingCommentId(comment._id)
    }

    if (showLikeAlert) return <Alert
        title="Login Required"
        message="Please login or create an account to like articles comments"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => setShowLikeAlert(false)}
    />

    const author = comment?.authorData;
    const initials = `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`;

    return (

        <div className="comment-item">

            <div className="comment-avatar">
                {author?.profileImage ? (
                    <img src={author.profileImage} alt={`${author?.firstName || ""} ${author?.lastName || ""}`} />
                ) : (
                    initials
                )}
            </div>

            <div className="comment-body">

                <div className="comment-top">

                    <div className="comment-user-info">
                        <strong>{author?.firstName} {author?.lastName}</strong>
                        {author?.role && <span>{author.role}</span>}
                        <span className="comment-time">{shortTimeAgo(comment.createdAt)}</span>
                    </div>

                    {isOwnComment ? (
                        <div className="comment-menu" ref={menuRef}>
                            <button
                                type="button"
                                className="comment-menu-trigger"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            {menuOpen ? (
                                <div className="comment-menu-dropdown">
                                    <button type="button" onClick={handleEditComment}>
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        Edit Comment
                                    </button>

                                    <button type="button" className="delete-option" onClick={handleDeleteComment}>
                                        <i className="fa-regular fa-trash-can"></i>
                                        Delete Comment
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                </div>

                <p className="comment-text">{comment?.text}</p>

                <div className="comment-actions">
                    <button type="button" onClick={toggleLike}>
                        <i className={isLiked ? "fa-solid fa-heart comment-liked" : "fa-regular fa-heart"}></i>
                        {likesCount}
                    </button>

                    <button type="button" onClick={() => setReplying((prev) => !prev)}>
                        <i className="fa-solid fa-reply"></i>
                        Reply
                    </button>
                </div>

                {replyData?.length > 0 && (
                    <button type="button" className="view-replies-button" onClick={() => setRepliesOpen((prev) => !prev)}>
                        <span className="view-replies-line"></span>
                        <span>
                            {repliesOpen ? "Hide replies" : `View ${replyData.length} ${replyData.length === 1 ? "reply" : "replies"}`}
                        </span>
                        <i className={repliesOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}></i>
                    </button>
                )}

                {repliesOpen && (
                    <div className="comment-replies">
                        {replyData?.map((reply) => (
                            <ReplyItem
                                key={reply._id}
                                reply={reply}
                                handleDeleteReply={handleDeleteReply}
                                setReplyId={setReplyId}
                                setReplyText={setReplyText}
                                // replyText={replyText}
                                setReplying={setReplying}
                            />
                        ))}
                    </div>
                )}

                {replying && (
                    <div className="reply-input-wrapper">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${author?.firstName || "user"}...`}
                        />
                        <button type="button" disabled={!replyText.trim()} onClick={handleReplySubmit}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                )}

            </div>

        </div>

    );
}

export default CommentItem;