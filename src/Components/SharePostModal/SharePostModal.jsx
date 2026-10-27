


import { useEffect, useState } from "react";
import "./SharePostModal.css";

function SharePostModal({ postId, onClose }) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);

    const postUrl = `${window.location.origin}/community/post/${postId}`;

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        if (!copied && !copyError) return;

        const timeout = setTimeout(() => {
            setCopied(false);
            setCopyError(false);
        }, 2500);

        return () => clearTimeout(timeout);
    }, [copied, copyError]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopyError(false);
            setCopied(true);
        } catch {
            setCopied(false);
            setCopyError(true);
        }
    };

    return (
        <div
            className="share-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <section
                className="share-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
            >
                <header className="share-modal-header">
                    <div className="share-modal-heading">
                        <span className="share-modal-icon">
                            <i className="fa-solid fa-share-nodes" />
                        </span>

                        <div>
                            <h2 id="share-modal-title">Share post</h2>
                            <p>Share this post with your community.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="share-modal-close"
                        onClick={onClose}
                        aria-label="Close share modal"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </header>

                <div className="share-modal-content">
                    <label
                        className="share-modal-label"
                        htmlFor="share-post-url"
                    >
                        Post link
                    </label>

                    <div className="share-modal-link-box">
                        <i className="fa-solid fa-link" />

                        <input
                            id="share-post-url"
                            type="text"
                            value={postUrl}
                            readOnly
                            onFocus={(event) => event.target.select()}
                        />
                    </div>

                    <button
                        type="button"
                        className="share-modal-copy-btn"
                        onClick={handleCopyLink}
                    >
                        <i
                            className={`fa-solid ${
                                copied ? "fa-check" : "fa-copy"
                            }`}
                        />
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                </div>

                {(copied || copyError) && (
                    <div
                        className={`share-modal-toast ${
                            copyError ? "error" : "success"
                        }`}
                        role="status"
                    >
                        <i
                            className={`fa-solid ${
                                copyError
                                    ? "fa-circle-exclamation"
                                    : "fa-circle-check"
                            }`}
                        />
                        {copied
                            ? "Link copied to clipboard!"
                            : "Could not copy. Select the link and copy it manually."}
                    </div>
                )}
            </section>
        </div>
    );
}

export default SharePostModal;