

import "./CommentSection.css";
import SectionLoader from "../SectionLoader/SectionLoader";
import CommentItem from "../CommentItem/CommentItem";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { getInitials } from "../../utils/getInitials";

function CommentSection({
    comments,
    loading,
    onClose,
    onAddComment,
    onDeleteComment,
    commentText,
    setCommentText,
    setEditingCommentId,
    onInput,
    commentsQueryKey
}) {
    const { user } = useContext(AuthContext);
    const textareaRef = useRef(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [commentText]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (commentText?.trim()) {
                onAddComment();
            }
        }
    };

    return (
        <div className="comments-section">

            {/* Header */}
            <div className="comments-header">
                <div>
                    <h3>Comments</h3>
                    <span>
                        {comments?.length || 0} comments
                    </span>
                </div>

                <button
                    type="button"
                    className="comments-close-button"
                    onClick={onClose}
                    aria-label="Close comments"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Comments */}
            {loading ? (
                <SectionLoader />
            ) : comments?.length > 0 ? (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            onDeleteComment={onDeleteComment}
                            setCommentText={setCommentText}
                            setEditingCommentId={setEditingCommentId}
                            commentsQueryKey={commentsQueryKey}
                        />
                    ))}
                </div>
            ) : (
                <div className="comments-empty">
                    <span>No comments yet.</span>
                </div>
            )}

            {/* Add Comment */}
            <div className="add-comment">
                <div className="add-comment-avatar">
                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.firstName}
                        />
                    ) : (
                        <span>
                            {getInitials(user)}
                        </span>
                    )}
                </div>

                <div className="add-comment-input">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onClick={onInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a comment..."
                    />

                    <button
                        type="button"
                        className="comment-send-btn"
                        disabled={!commentText?.trim()}
                        onClick={onAddComment}
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>

        </div>
    );
}

export default CommentSection;