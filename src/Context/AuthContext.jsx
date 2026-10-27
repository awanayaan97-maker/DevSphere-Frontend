import { createContext, useEffect, useState } from "react";
import useCallApi from "../hooks/useCallApi";
import { io } from "socket.io-client";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const API_URL = import.meta.env.VITE_API_URL;
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const { callApi } = useCallApi();

    useEffect(() => {

        if(user !== null || !token?.trim()) return
         
        async function fetchUser() {
            const result = await callApi(`${API_URL}/api/user/`, "GET", [], token);

            if (result?.status) {
                setUser(result)
                setNotifications(result?.data?.notifications)
            }
        }

        fetchUser()

    }, [token])


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
        setUser(null)
    }


    return (
        <AuthContext.Provider value={{ user, notifications, unreadCount, setUnreadCount,  socket, setUser, logout, login }}>
            {children}
        </AuthContext.Provider>
    )

} 