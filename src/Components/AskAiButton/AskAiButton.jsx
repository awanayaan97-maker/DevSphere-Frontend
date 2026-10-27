

import React from "react";

function AskAiButton({ onClick, className = "", value, ...props }) {
    return (
        <button
            type="button"
            className={`article-rail-button article-rail-ai-button ${className}`.trim()}
            onClick={onClick}
            aria-label="Ask AI about this article"
            title="Ask AI"
            {...props}
        >
            <svg
                className="article-ai-sparkle"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M24 3.5C26.7 15.2 32.8 21.3 44.5 24C32.8 26.7 26.7 32.8 24 44.5C21.3 32.8 15.2 26.7 3.5 24C15.2 21.3 21.3 15.2 24 3.5Z"
                    fill="var(--color-accent)"
                />
                <path
                    d="M39 3.5C39.8 7 41.5 8.7 45 9.5C41.5 10.3 39.8 12 39 15.5C38.2 12 36.5 10.3 33 9.5C36.5 8.7 38.2 7 39 3.5Z"
                    fill="var(--color-accent)"
                />
            </svg>
            <span>{value}</span>
        </button>
    );
}

export default AskAiButton