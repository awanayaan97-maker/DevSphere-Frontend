

import { useContext, useEffect, useRef, useState } from "react";
import "./CommentItem.css";
import ReplyItem from "../ReplyItem/ReplyItem";
import useCallApi from "../../hooks/useCallApi";
import { AuthContext } from "../../Context/AuthContext";
import { shortTimeAgo } from "../../utils/dateHelpers";
import Alert from "../Alert/Alert";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useQueryClient } from "@tanstack/react-query";

const EMPTY_REPLIES = [];

function CommentItem({ comment, onDeleteComment, setCommentText, setEditingCommentId, commentsQueryKey }) {

    const { callApi } = useCallApi();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [repliesOpen, setRepliesOpen] = useState(false);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyId, setReplyId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const textareaRef = useRef(null);
    const replyData = comment?.replies ?? EMPTY_REPLIES;

    const pathname = window.location.pathname;
    const isCommunity = pathname.startsWith("/community");
    const isOwnComment = comment?.authorData?._id === user?._id;
    const url = isCommunity
        ? `${API_URL}/api/post/like-postComment/${comment._id}`
        : `${API_URL}/api/article/like-articleComment/${comment._id}`;

    const { showLikeAlert, setShowLikeAlert, toggleLikeMutation } = useLikeToggle();

    function patchReplies(updater) {
        queryClient.setQueryData(commentsQueryKey, (old) =>
            Array.isArray(old)
                ? old.map((c) =>
                    c._id === comment._id
                        ? { ...c, replies: updater(c.replies ?? []) }
                        : c
                )
                : old
        );
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (replying) {
            requestAnimationFrame(resizeTextarea);
        }
    }, [replying, replyText]);

    async function handleReplySubmit() {

        let url = "";
        if (replyId !== null) {
            const oldText = replyData.find(c => c._id === replyId)?.text;

            patchReplies((prev) =>
                prev.map((c) => (c._id === replyId ? { ...c, text: replyText } : c))
            );

            const currentReplyId = replyId;
            const currentReplyText = replyText;
            setReplyText("");
            setReplyId(null);

            url = isCommunity
                ? `${API_URL}/api/post/comment/${currentReplyId}`
                : `${API_URL}/api/article/comment/${currentReplyId}`;

            const result = await callApi(url, "PATCH", { text: currentReplyText }, token);

            if (!result?.status) {

                patchReplies((prev) =>
                    prev.map((c) => (c._id === currentReplyId ? { ...c, text: oldText } : c))
                );
            }
            return;
        }

        if (!replyText.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const textToSubmit = replyText;

        const newCommentReply = {
            _id: tempId,
            articleId: comment.articleId,
            user: user?._id,
            text: textToSubmit,
            parentComment: comment._id,
            likes: [],
            authorData: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profileImage: user.profileImage
            }
        };

        patchReplies((prev) => [...prev, newCommentReply]);
        setReplyText("");
        setReplying(false);
        setRepliesOpen(true);

        const payloadData = {
            text: textToSubmit,
            parentComment: comment._id
        };

        url = isCommunity
            ? `${API_URL}/api/post/comment/${comment.postId}`
            : `${API_URL}/api/article/comment/${comment.articleId}`;

        const result = await callApi(url, "POST", payloadData, token);

        if (result?.status && result?.data) {
            patchReplies((prev) =>
                prev.map((c) => (c._id === tempId ? result.data : c))
            );
        } else {
            patchReplies((prev) => prev.filter((c) => c._id !== tempId));
        }
    }

    async function handleDeleteReply(id) {
        const previousReplies = replyData;
        patchReplies((prev) => prev.filter((c) => c._id !== id));

        const deleteUrl = isCommunity
            ? `${API_URL}/api/post/comment/${id}`
            : `${API_URL}/api/article/comment/${id}`;

        const result = await callApi(deleteUrl, "DELETE", null, token);
        if (!result?.status) {
            patchReplies(() => previousReplies);
        }
    }

    function handleDeleteComment() {
        setMenuOpen(false);
        onDeleteComment(comment._id);
    }

    function handleEditComment() {
        setMenuOpen(false);
        setCommentText(comment?.text);
        setEditingCommentId(comment._id);
    }

    function handleLikeClick() {
        toggleLikeMutation.mutate({
            url: url,
            itemId: comment._id,
            queryKey: commentsQueryKey
        });
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (replyText.trim()) {
                handleReplySubmit();
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                }
            }
        }
    };

    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    };

    if (showLikeAlert) return (
        <Alert
            title="Login Required"
            message="Please login or create an account to like articles comments"
            actionText="Login Now"
            onAction={() => navigate("/login")}
            onClose={() => setShowLikeAlert(false)}
        />
    );

    const author = comment?.authorData;
    const initials = `${author?.firstName?.[0] || ""}`;

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
                    <button type="button" onClick={handleLikeClick}>
                        <i className={comment?.isLiked ? "fa-solid fa-heart comment-liked" : "fa-regular fa-heart"}></i>
                        {comment?.likesCount}
                    </button>

                    <button type="button" onClick={() => setReplying((prev) => !prev)}>
                        <i className="fa-solid fa-reply"></i>
                        Reply
                    </button>
                </div>

                {replyData.length > 0 && (
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
                        {replyData.map((reply) => (
                            <ReplyItem
                                key={reply._id}
                                reply={reply}
                                handleDeleteReply={handleDeleteReply}
                                setReplyId={setReplyId}
                                setReplyText={setReplyText}
                                setReplying={setReplying}
                            />
                        ))}
                    </div>
                )}

                {replying && (
                    <div className="reply-input-wrapper">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={replyText}
                            onChange={(e) => {
                                setReplyText(e.target.value);
                                resizeTextarea();
                            }}
                            onKeyDown={handleKeyDown}
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