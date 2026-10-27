
import { useState, useEffect } from "react";
import useCallApi from "./useCallApi";

function useInfiniteArticles(url, method, actions = [], token) {

    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function buildPaginatedUrl(baseUrl, page, limit) {
        const urlObj = new URL(baseUrl);
        urlObj.searchParams.set("page", page);
        urlObj.searchParams.set("limit", limit);
        return urlObj.toString();
    }

    const { callApi } = useCallApi();


    useEffect(() => {

        setArticles([]);
        setPage(1);
        setHasMore(true);
    }, [url]);


    useEffect(() => {

        function scrollHandler() {

            if (loading || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollTop = document.documentElement.scrollTop;

            if (clientHeight + scrollTop >= scrollHeight) {
                setPage((prevPage) => prevPage + 1);
            }
        }

        window.addEventListener("scroll", scrollHandler);
        return () => window.removeEventListener("scroll", scrollHandler);

    }, [loading, hasMore]);


    useEffect(() => {

        let cancelled = false;

        async function fetchArticles() {
            setLoading(true)
            const setUrl = buildPaginatedUrl(url, page, 10);
            console.log(setUrl);
            console.log(method);
            console.log(actions);

            const result = await callApi(setUrl, method, actions, token);

            if (cancelled) return;

            if (result?.data?.length > 0) {
                setArticles((prev) => [...prev, ...result.data]);
            }

            else if (!result?.status) {
                setError(result?.message || "Something went wrong")
            }

            else {
                setHasMore(false);
            }

            setLoading(false);
        }

        fetchArticles();

        return () => {
            cancelled = true;
        };

    }, [page, url]);


    return { articles, loading, hasMore, error, setError };
}

export default useInfiniteArticles;