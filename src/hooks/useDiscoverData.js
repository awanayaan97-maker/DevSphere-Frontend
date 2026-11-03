
import useApiQuery from "./useApiQuery";

function useDiscoverData(source = "posts") {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const { data: topicsData, isLoading: tagsLoading } = useApiQuery({
        url: `${API_URL}/api/discover/tags?source=${source}`,
        type: "GET",
        isAuthorized: false,
    });

    const { data: developersData, isLoading: devsLoading } = useApiQuery({
        url: `${API_URL}/api/discover/discover-developers`,
        type: "GET",
        isAuthorized: true,
        token: token
    });

    return {
        trendingTopics: topicsData || [],
        popularUsers: developersData || [],
    };
}

export default useDiscoverData