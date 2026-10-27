
import { useState, useEffect } from "react";
import useCallApi from "./useCallApi";
import useLoginChecker from "./useLoginChecker";

export function useBookmarkToggle({ initialIsBookmarked, initialBookmarksCount = 0, url }) {

    const token = localStorage.getItem("token");
    const { callApi } = useCallApi();
    const { isLoggedIn } = useLoginChecker();

    const [isBookmarked, setIsBookmarked] = useState(null);
    const [showBookmarkAlert, setShowBookmarkAlert] = useState(false);

    const currentStatus = isBookmarked !== null ? isBookmarked : initialIsBookmarked;
    const baseCount = Number(initialBookmarksCount) || 0;

    const bookmarksCount = currentStatus === initialIsBookmarked
        ? baseCount
        : (currentStatus ? baseCount + 1 : Math.max(0, baseCount - 1));

    const toggleBookmark = () => {

        if (isLoggedIn) {
            setShowBookmarkAlert(true);
            return;
        }

        const nextState = !currentStatus;
        setIsBookmarked(nextState);
    };

    useEffect(() => {
        if (isBookmarked === null) return;

        const timer = setTimeout(async () => {
            try {
                await callApi(url, "POST", {}, token);
            } catch (error) {
                console.error("Failed to update bookmark status:", error);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [isBookmarked, url, token]);

    return {
        isBookmarked: currentStatus,
        bookmarksCount,
        toggleBookmark,
        showBookmarkAlert,
        setShowBookmarkAlert,
    };
}