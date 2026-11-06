import { useState } from "react";
import useCallApi from "./useCallApi"
import { useQuery } from '@tanstack/react-query';

function useApiQuery({
    url,
    type,
    data = [],
    isAuthorized = false,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 30
}) {

    const token = localStorage.getItem("token");
    const { callApi } = useCallApi();
    const [error, setError] = useState()

    const getData = async () => {
        const result = await callApi(url, type, data, token);
        if (!result.status) {
            const errMsg = result?.message || "Something went wrong";
            setError(errMsg);
            throw new Error(errMsg);
        }
        
        return result.data
    }

    const isEnabled = isAuthorized ? Boolean(token) : true;

    const queryResult = useQuery({
        queryKey: [url],
        queryFn: getData,
        enabled: isEnabled,
        staleTime,
        gcTime,
    });

    const isReallyLoading = (isAuthorized) || queryResult.isLoading;

    return {
        ...queryResult,
        isLoading: isReallyLoading,
        data: queryResult.data || [],
        error,
        setError
    };
}

export default useApiQuery