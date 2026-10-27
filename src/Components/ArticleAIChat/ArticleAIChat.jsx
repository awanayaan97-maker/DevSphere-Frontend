
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { AuthContext } from "../../Context/AuthContext";
import useCallApi from "../../hooks/useCallApi";
import UserAvatar from "../UserAvatar/UserAvatar";
import AskAiButton from "../AskAiButton/AskAiButton";

import "./ArticleAIChat.css";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const QUICK_OPTIONS = [
    { key: "summary", label: "Summarize this article", icon: "fa-align-left" },
    { key: "keyPoints", label: "What are the main points?", icon: "fa-list-check" },
    { key: "simple", label: "Explain in simple words", icon: "fa-lightbulb" },
    { key: "example", label: "Give me a simple example", icon: "fa-code" },
    { key: "prerequisites", label: "What should I know first?", icon: "fa-book-open" },
    { key: "quiz", label: "Quiz me on this article", icon: "fa-circle-question" },
];

export default function ArticleAIChat({
    articleId,
    isOpen,
    onClose,
    messages,
    setMessages,
 }) {
    const { user } = useContext(AuthContext);
    const userData = user?.data;
    const userId = userData?._id || userData?.id;

    const { loading, error, setError, callApi } = useCallApi();
    const [input, setInput] = useState("");

    const messagesEndRef = useRef(null);
    const messagesRef = useRef([]);
    const requestLockRef = useRef(false);
    const articleIdRef = useRef(articleId);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);


    useEffect(() => {
        articleIdRef.current = articleId;
        messagesRef.current = [];
        // setMessages([]);
        setInput("");
        setError(null);
    }, [articleId, setError]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages, loading, isOpen]);

    const clearError = useCallback(() => {
        setError(null);
    }, [setError]);

    const sendMessage = useCallback(async ({ message, quick, label }) => {
        if (!isOpen || !articleId || requestLockRef.current || loading) {
            return;
        }

        if (!token) {
            setError("Please login to use AI assistant");
            return;
        }

        // Exactly one of message or quick must be provided.
        if (Boolean(message) === Boolean(quick)) {
            setError("Please select an option or enter a question.");
            return;
        }

        // History mein naya sawal include nahi hoga.
        const history = messagesRef.current
            .slice(-6)
            .map(({ role, content }) => ({ role, content }));

        const userMessage = {
            role: "user",
            content: label || message,
        };

        const previousMessages = messagesRef.current;
        const updatedMessages = [...previousMessages, userMessage];

        requestLockRef.current = true;
        messagesRef.current = updatedMessages;
        setMessages(updatedMessages);
        setError(null);

        const body = {
            articleId,
            history,
            ...(quick ? { quick } : { message }),
        };

        try {
            const response = await callApi(
                `${API_URL}/api/ai/article-chat`,
                "POST",
                body,
                token
            );

            // Agar user ne article change kar diya ho, purana jawab mat dikhana.
            if (articleIdRef.current !== articleId) return;

            if (response?.status !== true) {
                throw new Error(
                    response?.message || "AI is temporarily unavailable."
                );
            }

            const answer = response?.data?.answer;

            if (typeof answer !== "string" || !answer.trim()) {
                throw new Error("AI returned an empty response.");
            }

            const assistantMessage = {
                role: "assistant",
                content: answer,
            };

            const finalMessages = [
                ...messagesRef.current,
                assistantMessage,
            ];

            messagesRef.current = finalMessages;
            setMessages(finalMessages);
        } catch (err) {
            if (articleIdRef.current !== articleId) return;

            // Failed request ka latest user message remove karo.
            const rolledBackMessages = messagesRef.current.slice(0, -1);

            messagesRef.current = rolledBackMessages;
            setMessages(rolledBackMessages);

            setError(
                err?.message || "Something went wrong. Please try again."
            );
        } finally {
            requestLockRef.current = false;
        }
    }, [articleId, callApi, isOpen, loading, setError, token]);

    const handleQuickOption = (option) => {
        sendMessage({
            quick: option.key,
            label: option.label,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const text = input.trim();

        if (!text || loading || text.length > 300) return;

        setInput("");

        sendMessage({
            message: text,
            label: text,
        });
    };

    const handleClose = () => {
        if (!loading) onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="article-ai-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
        }}>
            <section
                className="article-ai-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="article-ai-title"
            >
                <header className="article-ai-header">
                    <div className="article-ai-brand">
                        <AskAiButton className="article-ai-brand-logo" />

                        <div>
                            <h2 id="article-ai-title">Article Assistant</h2>
                            <p>Understand this article better</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="article-ai-close"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close assistant"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </header>

                <div className="article-ai-messages" aria-busy={loading}>
                    {messages.length === 0 && (
                        <div className="article-ai-welcome">
                            <div className="article-ai-welcome-icon">
                                {/* <AskAiButton /> */}
                            </div>

                            <h3>What would you like to explore?</h3>
                            <p>
                                Choose an option to get started, or ask
                                your own question about this article.
                            </p>

                            <div className="article-ai-options">
                                {QUICK_OPTIONS.map((option) => (
                                    <button
                                        type="button"
                                        className="article-ai-option"
                                        key={option.key}
                                        onClick={() => handleQuickOption(option)}
                                        disabled={loading}
                                    >
                                        <span className="article-ai-option-icon">
                                            <i className={`fa-solid ${option.icon}`} />
                                        </span>

                                        <span className="article-ai-option-label">
                                            {option.label}
                                        </span>

                                        <i className="fa-solid fa-arrow-up-right-from-square article-ai-option-arrow" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            className={`article-ai-message article-ai-message-${message.role}`}
                            key={`${index}-${message.role}`}
                        >
                            {message.role === "user" ? (
                                <>
                                    <div className="article-ai-bubble article-ai-user-bubble">
                                        {message.content}
                                    </div>

                                    <UserAvatar
                                        userData={userData}
                                        id={userId}
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="article-ai-message-avatar">
                                        <AskAiButton />
                                    </div>

                                    <div className="article-ai-bubble article-ai-assistant-bubble">
                                        <ReactMarkdown>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="article-ai-searching">
                            <div className="article-ai-searching-avatar">
                                <AskAiButton />
                            </div>

                            <div className="article-ai-searching-content">
                                <span className="article-ai-searching-title">
                                    Searching this article
                                </span>

                                <span className="article-ai-dots" aria-label="Loading">
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="article-ai-error" role="alert">
                        <i className="fa-solid fa-circle-exclamation" />
                        <span>{typeof error === "string" ? error : error?.message || "Something went wrong."}</span>

                        <button
                            type="button"
                            onClick={clearError}
                            aria-label="Dismiss error"
                            disabled={loading}
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                )}

                <form className="article-ai-composer" onSubmit={handleSubmit}>
                    <UserAvatar userData={userData} id={userId} />

                    <div className="article-ai-composer-box">
                        <textarea
                            value={input}

                            onChange={(event) => {
                                const value = event.target.value.slice(0, 300);
                                setInput(value);

                                event.target.style.height = "auto";
                                event.target.style.height =
                                    `${Math.min(event.target.scrollHeight, 120)}px`;
                            }}

                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                ) {
                                    event.preventDefault();
                                    handleSubmit(event);
                                }
                            }}
                            placeholder="Ask about this article..."
                            maxLength={300}
                            rows={1}
                            aria-label="Ask about this article"
                            disabled={loading}
                        />

                        <div className="article-ai-composer-footer">
                            <span>{input.length}/300</span>

                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                aria-label="Send message"
                            >
                                <i className="fa-solid fa-arrow-up" />
                            </button>
                        </div>
                    </div>
                </form>

                <footer className="article-ai-footer">
                    <i className="fa-solid fa-sparkles" />
                    Answers focused on your current article
                </footer>
            </section>
        </div>
    );
}
