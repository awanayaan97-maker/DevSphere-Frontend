
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import useCallApi from "./useCallApi";

function usePaginationQuery(url, method = "GET", actions = [], token) {

    const { callApi } = useCallApi();
    const { user } = useContext(AuthContext);
    const userId = user?._id ?? "guest";
    const [customError, setCustomError] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const queryKey = ["feed", userId, url]

    const {
        data, fetchNextPage, hasNextPage, isFetchingNextPage,
        isLoading, isError, error: queryError
    } = useInfiniteQuery({

        queryKey: queryKey ,
        queryFn: async ({ pageParam = 1 }) => {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set("page", pageParam);
            urlObj.searchParams.set("limit", 10);

            const result = await callApi(urlObj.toString(), method, actions, token);
            if (!result?.status) throw new Error(result?.message || "Something went wrong");
            return result.data || [];
        },

        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            !lastPage || lastPage.length < 10 ? undefined : allPages.length + 1,

        enabled: Boolean(url),
        retry: 2,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false
    });

    useEffect(() => { setDismissed(false); }, [url]);

    useEffect(() => {

        function scrollHandler() {
            if (isFetchingNextPage || !hasNextPage) return;
            const { scrollHeight } = document.documentElement;
            const scrollTop = document.documentElement.scrollTop;
            if (window.innerHeight + scrollTop >= scrollHeight - 50) fetchNextPage();
        }
        window.addEventListener("scroll", scrollHandler);
        return () => window.removeEventListener("scroll", scrollHandler);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const fetchData = useMemo(() => data?.pages?.flatMap((p) => p) ?? [], [data]);
    const error = dismissed ? null : (customError || (isError ? queryError?.message : null));

    return {
        fetchData,
        loading: isLoading || isFetchingNextPage,
        hasMore: Boolean(hasNextPage),
        error,
        queryKey,
        setError: () => { setCustomError(null); setDismissed(true); }
    };
}

export default usePaginationQuery;