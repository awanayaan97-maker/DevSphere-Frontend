


import { createContext, useContext, useState } from "react";

const CommunityAIContext = createContext();

export function CommunityAIProvider({ children }) {
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [mode, setMode] = useState("ask");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function resetChat() {
        setMessages([]);
        setInput("");
        setMode("ask");
        setLoading(false);
        setError(null);
    }

    return (
        <CommunityAIContext.Provider
            value={{
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
                resetChat,
            }}
        >
            {children}
        </CommunityAIContext.Provider>
    );
}

export function useCommunityAI() {
    return useContext(CommunityAIContext);
}
