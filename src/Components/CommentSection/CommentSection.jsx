
import "./CommentSection.css";
import SectionLoader from "../SectionLoader/SectionLoader";
import CommentItem from "../CommentItem/CommentItem";
import { useContext } from "react";
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
    onInput
}) {

    const { user } = useContext(AuthContext)

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
                    {user?.data?.profileImage ? (
                        <img
                            src={user.data.profileImage}
                            alt={user.data.firstName}
                        />
                    ) : (
                        <span>
                            {getInitials(user?.data?.firstName, user?.data?.lastName)}
                        </span>
                    )}
                </div>

                <div className="add-comment-input">

                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onClick={onInput}
                        placeholder="Write a comment..."
                    />

                    <button
                        type="button"
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