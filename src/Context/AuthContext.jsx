import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useApiQuery from "../hooks/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const API_URL = import.meta.env.VITE_API_URL;
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const queryClient = useQueryClient();
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const { isLoading: loading, data: user } = useApiQuery({
        url: `${API_URL}/api/user/`,
        type: "GET",
        isAuthorized: true,
        staleTime: 1000 * 60 * 30
    })

    const [notifications, setNotifications] = useState(user?.notifications || null);

    useEffect(() => {
        if (!token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const connectSocket = io(API_URL, {
            auth: { token: token },
            transports: ["websocket"]
        });

        connectSocket.on("connect", () => {
            console.log("Socket connected successfully:", connectSocket.id);
        });

        connectSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            setSocket(null);
        });

        setSocket(connectSocket);

        return () => {
            connectSocket.off("connect");
            connectSocket.off("disconnect");
            connectSocket.disconnect();
        };

    }, [token]);


    useEffect(() => {

        if (!socket) return;

        const handleNewNotification = (data) => {
            setNotifications((prevData) => {
                if (!prevData) return [data];
                return [...prevData, data];
            });
            setUnreadCount((prev) => prev + 1);
        };

        socket.on("like_notification", handleNewNotification);
        socket.on("comment_notification", handleNewNotification);
        socket.on("follow_notification", handleNewNotification);
        socket.on("comment_like_notification", handleNewNotification);

        return () => {
            socket.off("like_notification", handleNewNotification);
            socket.off("comment_notification", handleNewNotification);
            socket.off("follow_notification", handleNewNotification);
            socket.off("comment_like_notification", handleNewNotification);
        };
    }, [socket]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken)
        setToken(newToken)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        queryClient.clear()
    }

    return (
        <AuthContext.Provider value={{ user, notifications, unreadCount, setUnreadCount, socket, logout, login, loading }}>
            {children}
        </AuthContext.Provider>
    )

} 