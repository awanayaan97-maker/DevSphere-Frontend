

import CommentSection from "../CommentSection/CommentSection";

import { useContext, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";

import {
    javascript,
} from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

import "./CommunityPostCard.css";
import Alert from "../Alert/Alert";
import { AuthContext } from "../../Context/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";
import SharePostModal from "../SharePostModal/SharePostModal";
import { shortTimeAgo } from "../../utils/dateHelpers";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useBookmarkToggle } from "../../hooks/useBookmarkToggle";
import useComments from "../../hooks/useComments";
import useCheckLogin from "../../hooks/useCheckLogin";
const API_URL = import.meta.env.VITE_API_URL;

const codeLanguages = {
    javascript,
    jsx: javascript,
    typescript: javascript,
    python,
    html,
    css,
    json,
    sql,
    java,
    cpp,
};

function CommunityPostCard({
    post,
    onEdit,
    onDelete,
    isBookmarkPage,
    queryKey
}) {

    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const editorTheme = theme === "dark" ? oneDark : [];
    const [showShareModal, setShowShareModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [copied, setCopied] = useState(false);
    const { showAlert, setShowAlert, check } = useCheckLogin()
    const [menuOpen, setMenuOpen] = useState(false);
    const { showLikeAlert, setShowLikeAlert, toggleLikeMutation } = useLikeToggle()

    const {
        comments,
        commentsQueryKey,
        commentsOpen,
        setCommentsOpen,
        commentText,
        setCommentText,
        setEditingCommentId,
        handleAddComment,
        handleDeleteComment,
        toggleComments,
        commentsLoading
    } = useComments(post?._id, "post")

    const { showBookmarkAlert, setShowBookmarkAlert, bookmarksCount, toggleBookmark, isBookmarked } = useBookmarkToggle({
        initialIsBookmarked: post?.isBookmark,
        initialBookmarksCount: post?.savesCount,
        url: `${API_URL}/api/post/bookmark/${post._id}`,
    })

    const imageTrackRef = useRef(null);
    const codeRef = useRef(null);
    const menuRef = useRef(null);

    const author = post?.authorDetails || {};
    const authorName = [
        author.firstName,
        author.lastName,
    ].filter(Boolean).join(" ") || "Developer";

    const images = (post?.images || [])
        .map((image) => ({
            url: typeof image === "string"
                ? image
                : image?.url || image?.secure_url || image?.imageUrl || "",
            id: image?._id || image?.publicId || image?.url,
        }))
        .filter((image) => image.url);

    const text = post?.text || "";
    const isLongText = text.length > 280;
    const visibleText =
        expanded || !isLongText
            ? text
            : `${text.slice(0, 280).trimEnd()}...`;

    const code = post?.code || "";
    const language = (post?.codeLanguage || "javascript").toLowerCase();
    const languageExtension = codeLanguages[language] || javascript;
    const isOwnArticle = !isBookmarkPage && (post?.authorDetails?._id === user?._id);


    useEffect(() => {
        setExpanded(false);
        setActiveImage(0);

        if (imageTrackRef.current) {
            imageTrackRef.current.scrollLeft = 0;
        }
    }, [post?._id]);


    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const scrollToImage = (index) => {
        const track = imageTrackRef.current;
        if (!track) return;

        const nextIndex = Math.max(
            0,
            Math.min(index, images.length - 1)
        );

        track.scrollTo({
            left: track.clientWidth * nextIndex,
            behavior: "smooth",
        });

        setActiveImage(nextIndex);
    };

    const handleImageScroll = () => {
        const track = imageTrackRef.current;
        if (!track || !track.clientWidth) return;

        const index = Math.round(
            track.scrollLeft / track.clientWidth
        );

        setActiveImage(
            Math.max(0, Math.min(index, images.length - 1))
        );
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);

            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    const handleLikeClick = () => {

        toggleLikeMutation.mutate({
            url: `${API_URL}/api/post/like/${post._id}`,
            itemId: post._id,
            queryKey
        })

    }

    if (!post) return null;

    if (showAlert || showLikeAlert || showBookmarkAlert) return <Alert
        title="Login Required"
        message="Please login or create an account to like or comment article"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => {
            setShowAlert(false)
            setShowLikeAlert(false)
            setShowBookmarkAlert(false)
        }}
    />

    return (
        <article className="community-post-card">
            {/* Author */}
            <div className="community-post-author">
                <img
                    className="community-post-avatar"
                    src={author.profileImage || "/default-avatar.png"}
                    alt={authorName}
                    loading="lazy"
                />

                <div className="community-post-author-info">
                    <h3>{authorName}</h3>

                    {author.role && (
                        <p className="community-post-role">
                            {author.role}
                        </p>
                    )}

                    <span className="community-post-time">
                        {shortTimeAgo(post?.createdAt)}
                    </span>
                </div>

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
                                    onClick={() => onEdit(post._id)}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                    Edit Post
                                </button>

                                <button
                                    type="button"
                                    className="delete-option"
                                    onClick={() => onDelete(post._id)}
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                    Delete Post
                                </button>

                            </div>
                        ) : null}

                    </div>
                ) : null}

            </div>

            <div className="community-post-type">
                <span className={`post-type-badge post-type-${post.type?.toLowerCase()}`}>
                    {post.type}
                </span>
            </div>

            {/* Text — normal paragraph, not a heading */}
            {text && (
                <div className="community-post-text">
                    <p>{visibleText}</p>

                    {isLongText && (
                        <button
                            type="button"
                            className="community-post-more-btn"
                            onClick={() => setExpanded((prev) => !prev)}
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>
            )}

            {/* Images — after text */}
            {images.length > 0 && (
                <div className="community-post-images">
                    <div
                        className="community-post-image-track"
                        ref={imageTrackRef}
                        onScroll={handleImageScroll}
                    >
                        {images.map((image, index) => (
                            <div
                                className="community-post-image-slide"
                                key={image.id || `${post._id}-image-${index}`}
                            >
                                <img
                                    src={image.url}
                                    alt={`Post image ${index + 1}`}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    {images.length > 1 && (
                        <>
                            <span className="community-post-image-counter">
                                {activeImage + 1}/{images.length}
                            </span>

                            <div className="community-post-image-controls">
                                <button
                                    type="button"
                                    onClick={() => scrollToImage(activeImage - 1)}
                                    disabled={activeImage === 0}
                                    aria-label="Previous image"
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => scrollToImage(activeImage + 1)}
                                    disabled={activeImage === images.length - 1}
                                    aria-label="Next image"
                                >
                                    <i className="fa-solid fa-chevron-right" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Code — after images */}
            {code.trim() && (
                <div className="community-post-code">
                    <div className="community-post-code-header">
                        <span>
                            <i className="fa-solid fa-code" />
                            {language.toUpperCase()}
                        </span>

                        <button
                            type="button"
                            onClick={handleCopyCode}
                            className="community-post-copy-btn"
                        >
                            <i
                                className={`fa-solid ${copied ? "fa-check" : "fa-copy"
                                    }`}
                            />
                            {copied ? "Copied" : "Copy code"}
                        </button>
                    </div>

                    <div className="community-post-code-editor" ref={codeRef}>
                        <CodeMirror
                            value={code}
                            theme={editorTheme}
                            extensions={[
                                languageExtension(),
                                EditorView.editable.of(false),
                                EditorView.lineWrapping,
                            ]}
                            editable={false}
                            basicSetup={{
                                lineNumbers: true,
                                foldGutter: true,
                                highlightActiveLine: false,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Tags — after images and code */}
            {post.tags?.length > 0 && (
                <div className="community-post-tags">
                    {post.tags.map((tag) => (
                        <span className="community-post-tag" key={tag.tagId}>
                            #{tag.tagValue}
                        </span>
                    ))}
                </div>
            )}

            {/* Engagement counts */}
            <div className="community-post-stats">
                <span>
                    {post?.likesCount} Likes
                </span>

                <div>
                    <span>
                        {comments?.length === 0 ? post.commentsCount : comments?.length} comments
                    </span>

                    <span>
                        {bookmarksCount} saves
                    </span>
                </div>
            </div>

            <div className="community-post-divider" />

            {/* Actions */}
            <div className="community-post-actions">
                <button
                    type="button"
                    className={post.isLiked ? "is-liked" : ""}
                    onClick={handleLikeClick}
                >
                    {post?.isLiked ? (
                        <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i>
                    ) : (
                        <i className="fa-regular fa-heart"></i>
                    )}
                    <span>Like</span>
                </button>

                <button
                    type="button"
                    onClick={toggleComments}
                >
                    <i className="fa-regular fa-comment" />
                    <span>Comment</span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                >
                    <i className="fa-solid fa-share" />
                    <span>Share</span>
                </button>

                <button
                    type="button"
                    className={isBookmarked ? "is-bookmarked" : ""}
                    onClick={toggleBookmark}
                >
                    <i className={isBookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
                    <span>{post.isBookmark ? "Saved" : "Save"}</span>
                </button>
            </div>

            {commentsOpen && (
                <CommentSection
                    comments={comments}
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

            {showShareModal && (
                <SharePostModal
                    postId={post._id}
                    onClose={() => setShowShareModal(false)}
                />
            )}

        </article>
    );
}

export default CommunityPostCard;