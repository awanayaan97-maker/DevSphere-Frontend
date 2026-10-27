

import { useContext, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useCommunityAI } from "../../Context/CommunityAIContext";
import useCallApi from "../../hooks/useCallApi";
import "./CommunityAI.css";
import AskAiButton from "../AskAiButton/AskAiButton";
import UserAvatar from "../UserAvatar/UserAvatar";
import { AuthContext } from "../../Context/AuthContext";

const modes = [
    { id: "ask", label: "Ask", icon: "✳", description: "Ask anything" },
    { id: "explain", label: "Explain", icon: "</>", description: "Understand code" },
    { id: "debug", label: "Debug", icon: "⌘", description: "Fix errors" },
    { id: "review", label: "Review", icon: "▤", description: "Improve code" },
];

function MarkdownMessage({ content }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ children, className, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");

                    if (!match && !code.includes("\n")) {
                        return (
                            <code className="community-inline-code" {...props}>
                                {children}
                            </code>
                        );
                    }

                    return (
                        <div className="community-code-block">
                            <div className="community-code-header">
                                <span>{match?.[1] || "Code"}</span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(code);
                                    }}
                                >
                                    Copy
                                </button>
                            </div>

                            <SyntaxHighlighter
                                language={match?.[1] || "text"}
                                style={oneDark}
                                PreTag="div"
                                customStyle={{
                                    margin: 0,
                                    borderRadius: 0,
                                    background: "#111827",
                                    fontSize: "13px",
                                }}
                            >
                                {code}
                            </SyntaxHighlighter>
                        </div>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

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
        setError,
    } = useCommunityAI();

    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();
    const API_URL = import.meta.env.VITE_API_URL;

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const wasNearBottomRef = useRef(true);
    const textareaRef = useRef(null);

    const token = localStorage.getItem("token")

    useEffect(() => {
        const container = messagesContainerRef.current;

        if (!container || !wasNearBottomRef.current) return;

        container.scrollTop = container.scrollHeight;
    }, [messages, loading]);

    function handleScroll() {
        const container = messagesContainerRef.current;

        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        wasNearBottomRef.current = distanceFromBottom < 100;
    }

    function handleInputChange(e) {
        const value = e.target.value.slice(0, 6000);

        setInput(value);
        setError(null);

        if (!value.trim()) {
            setMode("ask");
        }

        const target = e.target;
        target.style.height = "auto";
        const scrollHeight = target.scrollHeight;
        const maxHeight = 180;

        target.style.height = `${Math.min(scrollHeight, maxHeight)}px`;

        if (scrollHeight > maxHeight) {
            target.style.overflowY = "auto";
        } else {
            target.style.overflowY = "hidden";
        }
    }

    async function handleSend(e) {
        e?.preventDefault();

        const message = input.trim();

        if (!message || loading) return;

        if (!token) {
            setError("Please login to use AI assistant");
            return;
        }

        const history = messages
            .slice(-4)
            .map(({ role, content }) => ({ role, content }));

        const userMessage = {
            role: "user",
            content: message,
            relatedPosts: [],
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");
        setLoading(true);
        setError(null);
        setMode("ask");

        setInput("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const result = await callApi(
                `${API_URL}/api/ai/community-chat`,
                "POST",
                {
                    mode,
                    message,
                    history,
                },
                token
            );

            if (result?.status && result?.data) {
                const assistantMessage = {
                    role: "assistant",
                    content: result.data.answer,
                    relatedPosts: result.data.relatedPosts || [],
                };

                setMessages((previous) => [
                    ...previous,
                    assistantMessage,
                ]);
            } else {

                setMessages((previous) => {
                    const updated = [...previous];
                    updated.pop();
                    return updated;
                });

                setInput(message);
                setError(result?.message || "AI is busy. Please try again.");
            }
        } catch (err) {

            setMessages((previous) => {
                const updated = [...previous];
                updated.pop();
                return updated;
            });

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
            setMode("ask");
        }
    }

    return (
        <section className="community-ai">

            <header className="community-ai-header">
                <div className="community-ai-brand">
                    <div className="community-ai-logo" style={{ display: "flex", alignItems: "center" }}>
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

            {/* <header className="community-ai-header">
                <div className="community-ai-brand">
                    <div className="community-ai-logo">
                        <AskAiButton />
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
            </header> */}

            {/* <div className="community-ai-notice">
                <strong>A little heads-up</strong>
                <p>
                    Your chat stays available as you explore DevSphere,
                    but refreshing the page may clear your conversation.
                    Copy anything important before you leave.
                </p>
            </div> */}

            <div
                className="community-ai-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {messages.length === 0 && (
                    <div className="community-ai-welcome">
                        <div className="community-ai-welcome-icon">
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
                        </div>

                        <h1>What are we solving today?</h1>

                        <p>
                            Ask a question, understand a concept, fix a bug,
                            or get feedback on your code. Let's figure it
                            out together.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={`${message.role}-${index}`}
                        className={`community-ai-message-row ${message.role}`}
                    >
                        {message.role === "assistant" ? (
                            <div className="community-ai-message-avatar">
                                {/* Agar AskAiButton sirf logo hai, yahan use kar sakte ho. */}
                                <AskAiButton />
                            </div>
                        ) : (
                            <div className="community-ai-message-avatar">
                                <UserAvatar userData={user?.data} />
                            </div>
                        )}

                        <div className="community-ai-message-content">
                            {message.role === "assistant" ? (
                                <MarkdownMessage content={message.content} />
                            ) : (
                                <div className="community-user-text">
                                    {message.content}
                                </div>
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

                <div ref={messagesEndRef} />
            </div>

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

            <form className="community-ai-composer" onSubmit={handleSend}>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    maxLength={6000}
                    disabled={loading}
                    placeholder="Ask anything, paste your code, or share an error..."
                    rows={3}
                />

                <div className="community-ai-composer-footer">
                    <span className="community-ai-counter">
                        {input.length}/6000
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
                    {modes.map((item) => {
                        const disabled =
                            loading ||
                            (!input.trim() && item.id !== "ask");

                        return (
                            <button
                                type="button"
                                key={item.id}
                                className={
                                    mode === item.id
                                        ? "community-ai-mode active"
                                        : "community-ai-mode"
                                }
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
