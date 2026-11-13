import { useContext, useEffect, useRef, useState, memo, Children } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useCommunityAI } from "../../Context/CommunityAIContext";
import useCallApi from "../../hooks/useCallApi";
import AskAiButton from "../AskAiButton/AskAiButton";
import UserAvatar from "../UserAvatar/UserAvatar";
import { AuthContext } from "../../Context/AuthContext";
import "./CommunityAI.css";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_MESSAGE_LENGTH = 6000;
const MAX_HISTORY = 4;
const MAX_INPUT_HEIGHT = 180;

const MODES = [
    { id: "ask", label: "Ask", icon: "✳", description: "Ask anything" },
    { id: "explain", label: "Explain", icon: "</>", description: "Understand code" },
    { id: "debug", label: "Debug", icon: "⌘", description: "Fix errors" },
    { id: "review", label: "Review", icon: "▤", description: "Improve code" }
];


/* =========================================================
   SMALL PIECES
========================================================= */

function SparkleIcon() {
    return (
        <svg
            className="article-ai-sparkle"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
            style={{ width: "28px", height: "28px", flexShrink: 0 }}
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
    );
}


/* =========================================================
   MARKDOWN
========================================================= */

const BR_TAG = /<br\s*\/?>/gi;

// "<br>" likha ho to asli line break lagao (HTML chalaye baghair, safe)
function withLineBreaks(children) {
    return Children.toArray(children).flatMap((child, i) => {

        if (typeof child !== "string") return [child];

        return child.split(BR_TAG).flatMap((part, j, parts) =>
            j < parts.length - 1 ? [part, <br key={`${i}-${j}`} />] : [part]
        );
    });
}

function CodeBlock({ language, code }) {

    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard block ho (jaise http par) to chupke se chhor do
        }
    }

    return (
        <div className="community-code-block">

            <div className="community-code-header">
                <span>{language || "Code"}</span>

                <button type="button" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            <SyntaxHighlighter
                language={language || "text"}
                style={oneDark}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: "#111827",
                    fontSize: "13px"
                }}
            >
                {code}
            </SyntaxHighlighter>

        </div>
    );
}

// Function ke bahar: har render par naya object nahi banta
const markdownComponents = {

    // code block ka apna wrapper hai, isliye pre ko khali rakho
    pre: ({ children }) => <>{children}</>,

    code({ node, children, className, ...props }) {

        const match = /language-(\w+)/.exec(className || "");
        const code = String(children).replace(/\n$/, "");

        if (!match && !code.includes("\n")) {
            return (
                <code className="community-inline-code" {...props}>
                    {children}
                </code>
            );
        }

        return <CodeBlock language={match?.[1]} code={code} />;
    },

    // Tables: chaurai se bahar na jayein, aur <br> sambhal jaye
    table: ({ node, children }) => (
        <div className="community-table-wrap">
            <table>{children}</table>
        </div>
    ),
    th: ({ node, children }) => <th>{withLineBreaks(children)}</th>,
    td: ({ node, children }) => <td>{withLineBreaks(children)}</td>,

    // Links naye tab mein
    a: ({ node, children, ...props }) => (
        <a {...props} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    )
};

// content badle tabhi dobara render hota hai (typing par purane messages nahi)
const MarkdownMessage = memo(function MarkdownMessage({ content }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
        </ReactMarkdown>
    );
});


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CommunityAI({ onClose }) {

    const {
        messages,
        setMessages,
        input,
        setInput,
        mode,
        setMode,
        loading,
        setLoading,
        error,
        setError
    } = useCommunityAI();

    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const messagesContainerRef = useRef(null);
    const wasNearBottomRef = useRef(true);
    const textareaRef = useRef(null);


    // Naya message aane par neeche scroll, lekin sirf agar user pehle se neeche ho
    useEffect(() => {

        const container = messagesContainerRef.current;

        if (!container || !wasNearBottomRef.current) return;

        container.scrollTop = container.scrollHeight;

    }, [messages, loading]);


    function handleScroll() {

        const container = messagesContainerRef.current;

        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;

        wasNearBottomRef.current = distanceFromBottom < 100;
    }


    function handleInputChange(e) {

        const value = e.target.value.slice(0, MAX_MESSAGE_LENGTH);

        setInput(value);
        setError(null);

        // Input khali ho to mode wapas Ask
        if (!value.trim()) setMode("ask");

        const target = e.target;

        target.style.height = "auto";
        target.style.height = `${Math.min(target.scrollHeight, MAX_INPUT_HEIGHT)}px`;
        target.style.overflowY = target.scrollHeight > MAX_INPUT_HEIGHT ? "auto" : "hidden";
    }


    function removeLastMessage() {
        setMessages((previous) => previous.slice(0, -1));
    }


    async function handleSend(e) {

        e?.preventDefault();

        const message = input.trim();

        if (!message || loading) return;

        if (!token) {
            setError("Please login to use AI assistant");
            return;
        }

        // History pehle nikalo: naya sawal is mein shamil nahi hoga
        const history = messages
            .slice(-MAX_HISTORY)
            .map(({ role, content }) => ({ role, content }));

        // Sawal foran chat mein dikhao
        setMessages((previous) => [
            ...previous,
            { role: "user", content: message, relatedPosts: [] }
        ]);

        setInput("");
        setLoading(true);
        setError(null);

        if (textareaRef.current) textareaRef.current.style.height = "auto";

        try {

            const result = await callApi(
                `${API_URL}/api/ai/community-chat`,
                "POST",
                { mode, message, history },
                token
            );

            if (result?.status && result?.data) {

                setMessages((previous) => [
                    ...previous,
                    {
                        role: "assistant",
                        content: result.data.answer,
                        relatedPosts: result.data.relatedPosts || []
                    }
                ]);

            } else {

                // Fail hua: sawal wapas input mein, aur chat se hata do
                removeLastMessage();
                setInput(message);
                setError(result?.message || "AI is busy. Please try again.");
            }

        } catch (err) {

            removeLastMessage();
            setInput(message);

            if (err?.status === 401 || err?.response?.status === 401) {
                setError("Please login to use AI assistant");
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong. Please try again."
                );
            }

        } finally {
            setLoading(false);
            setMode("ask");     // har message ke baad mode wapas Ask
        }
    }


    return (
        <section className="community-ai">

            {/* Header */}
            <header className="community-ai-header">

                <div className="community-ai-brand">
                    <div className="community-ai-logo" style={{ display: "flex", alignItems: "center" }}>
                        <SparkleIcon />
                    </div>

                    <div>
                        <h2>DevSphere Assistant</h2>
                        <p>Your coding companion</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="community-ai-close"
                    onClick={onClose}
                    aria-label="Close assistant"
                >
                    ×
                </button>

            </header>


            {/* Messages */}
            <div
                className="community-ai-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >

                {messages.length === 0 && (
                    <div className="community-ai-welcome">

                        <div className="community-ai-welcome-icon">
                            <SparkleIcon />
                        </div>

                        <h1>What are we solving today?</h1>

                        <p>
                            Ask a question, understand a concept, fix a bug,
                            or get feedback on your code. Let's figure it out together.
                        </p>

                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={`${message.role}-${index}`}
                        className={`community-ai-message-row ${message.role}`}
                    >

                        <div className="community-ai-message-avatar">
                            {message.role === "assistant"
                                ? <AskAiButton />
                                : <UserAvatar userData={user} />}
                        </div>

                        <div className="community-ai-message-content">
                            {message.role === "assistant" ? (
                                <MarkdownMessage content={message.content} />
                            ) : (
                                <div className="community-user-text">{message.content}</div>
                            )}
                        </div>

                    </div>
                ))}

                {loading && (
                    <div className="community-ai-loading" role="status">
                        <span />
                        <span />
                        <span />
                        <p>Thinking through your question...</p>
                    </div>
                )}

            </div>


            {/* Error */}
            {error && (
                <div className="community-ai-error" role="alert">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError(null)}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}


            {/* Composer */}
            <form className="community-ai-composer" onSubmit={handleSend}>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    maxLength={MAX_MESSAGE_LENGTH}
                    disabled={loading}
                    placeholder="Ask anything, paste your code, or share an error..."
                    rows={3}
                />

                <div className="community-ai-composer-footer">

                    <span className="community-ai-counter">
                        {input.length}/{MAX_MESSAGE_LENGTH}
                    </span>

                    <button
                        type="submit"
                        className="community-ai-send"
                        disabled={loading || !input.trim()}
                    >
                        {loading ? "Sending..." : "↑ Send"}
                    </button>

                </div>

                <div className="community-ai-modes">
                    {MODES.map((item) => {

                        // Khali input par sirf Ask chal sakta hai
                        const disabled = loading || (!input.trim() && item.id !== "ask");

                        return (
                            <button
                                type="button"
                                key={item.id}
                                className={mode === item.id ? "community-ai-mode active" : "community-ai-mode"}
                                disabled={disabled}
                                onClick={() => setMode(item.id)}
                                title={item.description}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </div>

            </form>

        </section>
    );
}