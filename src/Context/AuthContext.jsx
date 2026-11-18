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
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const { isLoading: loading, data: user } = useApiQuery({
        url: `${API_URL}/api/user/`,
        type: "GET",
        isAuthorized: true,
        staleTime: 1000 * 60 * 30
    })

    useEffect(() => {

        if (user?.notifications) {
            setNotifications(user?.notifications);
            setUnreadCount(user?.totalNotifications);
        }
    }, [user]);


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

        const handleCommentNotification = (data) => {
            console.log(data, "Comment ka data");

            handleNewNotification(data);
            const targetId = data?.post || data?.article || data?.postId || data?.articleId;
            const targetType = data?.post || data?.postId ? "post" : "article";
            if (targetId) {
                queryClient.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
            }
        };

        const handleLikeNotification = (data) => {
            handleNewNotification(data);
            const receiverId = data?.receiver;
            if (receiverId) queryClient.invalidateQueries({ queryKey: ["feed", receiverId] });
        };

        const handleCommentLikeNotification = (data) => {
            handleNewNotification(data);
            const targetId = data?.post || data?.article || data?.postId || data?.articleId;
            const targetType = data?.post || data?.postId ? "post" : "article";
            if (targetId) queryClient.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
        };

        socket.on("like_notification", handleLikeNotification);
        socket.on("comment_notification", handleCommentNotification);
        socket.on("follow_notification", handleNewNotification);
        socket.on("comment_like_notification", handleCommentLikeNotification);

        return () => {
            socket.off("like_notification", handleLikeNotification);
            socket.off("comment_notification", handleCommentNotification);
            socket.off("follow_notification", handleNewNotification);
            socket.off("comment_like_notification", handleCommentLikeNotification);
        };
    }, [socket, queryClient]);


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