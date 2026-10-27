

import { useContext, useEffect, useRef, useState } from "react";
import "./ReplyItem.css";
import { AuthContext } from "../../Context/AuthContext";
import { shortTimeAgo } from "../../utils/dateHelpers";

function ReplyItem({ reply, handleDeleteReply, setReplyId, setReplyText, setReplying }) {

    const [replyLiked, setReplyLiked] = useState(
        reply?.hasLikeReply || false
    );

    const { user } = useContext(AuthContext)
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isOwnReply = reply?.authorData?._id === user?.data?._id;

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleEditReply() {
        setMenuOpen(false);
       setReplying((prev) => !prev)
       setReplyText(reply.text)
       setReplyId(reply._id)
    }

    function DeleteReply() {
        setMenuOpen(false);
        handleDeleteReply(reply._id)
    }

    function handleReplyLike() {

        setReplyLiked((prev) => !prev);

        // Later:
        // Reply like API
    }

    const author = reply?.authorData;

    const initials = `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`;


    return (

        <div className="comment-reply">

            {/* Reply Avatar */}
            <div className="reply-avatar">
                {author?.profileImage ? (
                    <img
                        src={author.profileImage}
                        alt={`${author?.firstName || ""} ${author?.lastName || ""}`}
                    />
                ) : (
                    initials
                )}
            </div>

            {/* Reply Body */}
            <div className="reply-body">

                <div className="reply-top">

                    <div className="reply-user-info">
                        <strong>
                            {author?.firstName} {author?.lastName}
                        </strong>

                        {author?.role && (
                            <span>
                                {author.role}
                            </span>
                        )}

                        <span className="reply-time">{shortTimeAgo(reply.createdAt)}</span>
                    </div>

                    {/* ================================
                3-DOT MENU (sirf apni reply pe)
            ================================ */}

                    {isOwnReply ? (
                        <div className="reply-menu" ref={menuRef}>

                            <button
                                type="button"
                                className="reply-menu-trigger"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            {menuOpen ? (
                                <div className="reply-menu-dropdown">

                                    <button type="button" onClick={handleEditReply}>
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        Edit Reply
                                    </button>

                                    <button type="button" className="delete-option" onClick={DeleteReply}>
                                        <i className="fa-regular fa-trash-can"></i>
                                        Delete Reply
                                    </button>

                                </div>
                            ) : null}

                        </div>
                    ) : null}

                </div>

                <p>
                    {reply?.text}
                </p>

            </div>

        </div>
    );
}

export default ReplyItem;