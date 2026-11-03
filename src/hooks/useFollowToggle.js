
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCallApi from "./useCallApi";
import useLoginChecker from "./useLoginChecker";

export function useFollowToggle({ userId, initialIsFollowing }) {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { callApi } = useCallApi();
    const { isLoggedIn } = useLoginChecker();
    const queryClient = useQueryClient();
    const [isFollowing, setIsFollowing] = useState(null);
    const [showFollowAlert, setShowFollowAlert] = useState(false);
    const currentStatus = isFollowing !== null ? isFollowing : initialIsFollowing;

    const toggleFollow = () => {
        if (!isLoggedIn) {
            setShowFollowAlert(true);
            return;
        }
        const nextState = !currentStatus;
        setIsFollowing(nextState);
    };

    useEffect(() => {
        if (isFollowing === null) return;

        const timer = setTimeout(async () => {
            const actionType = isFollowing ? "follow" : "unfollow";

            try {
                const result = await callApi(
                    `${API_URL}/api/user/follow`,
                    "POST",
                    { followedUser: userId, action: actionType },
                    token
                );

                if (!result?.status) {
                    setIsFollowing(initialIsFollowing);
                } else {
                    queryClient.invalidateQueries({
                        predicate: (query) => query.queryKey[0]?.includes('/api/user')
                    });
                }
            } 
            
            catch (error) {
                console.error("Failed to update follow status:", error);
                setIsFollowing(initialIsFollowing);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [isFollowing, userId, token, initialIsFollowing, queryClient, API_URL]);

    return {
        isFollowing: currentStatus,
        toggleFollow,
        showFollowAlert,
        setShowFollowAlert,
    };
}