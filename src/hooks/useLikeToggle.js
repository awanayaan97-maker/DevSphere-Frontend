

import { useState, useEffect } from "react";
import useCallApi from "./useCallApi";
import useLoginChecker from "./useLoginChecker";

export function useLikeToggle({ initialIsLiked, initialLikesCount = 0, Url }) {

    const token = localStorage.getItem("token");
    const { callApi } = useCallApi();
    const { isLoggedIn } = useLoginChecker()
    const [isLiked, setIsLiked] = useState(null);
    const [showLikeAlert, setShowLikeAlert] = useState(false)

    const currentStatus = isLiked !== null ? isLiked : initialIsLiked;
    const baseCount = Number(initialLikesCount) || 0;

    const likesCount = currentStatus === initialIsLiked
        ? baseCount
        : (currentStatus ? baseCount + 1 : Math.max(0, baseCount - 1));

    const toggleLike = () => {

        if (isLoggedIn) {
            setShowLikeAlert(true)
            return
        }

        const nextState = !currentStatus;
        setIsLiked(nextState);
    };

    useEffect(() => {
        if (isLiked === null) return;

        const timer = setTimeout(async () => {
            try {
                await callApi(Url, "PATCH", {}, token);
            } catch (error) {
                console.error("Failed to update like status:", error);

            }
        }, 600);

        return () => {
            clearTimeout(timer);
        };
    }, [isLiked]);

    return {
        isLiked: currentStatus,
        likesCount,
        toggleLike,
        showLikeAlert,
        setShowLikeAlert
    };
}