
import { useSearchParams } from "react-router-dom";

function useUrlFilters(defaultValues = {}) {

    const [searchParams, setSearchParams] = useSearchParams();

    const updateFilter = (key, value, deleteKey = null) => {

        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);

            if (!value || value === defaultValues[key]) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
            if (deleteKey) {
                newParams.delete(deleteKey);
            }
            return newParams;
        });
    };

    const removeFilter = (keysToRemove) => {

        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            const keysArray = Array.isArray(keysToRemove) ? keysToRemove : [keysToRemove];

            keysArray.forEach((k) => {
                newParams.delete(k);
            });

            return newParams;
        });
    }

    const buildUrl = (baseUrl) => {
        const paramsString = searchParams.toString();
        return paramsString ? `${baseUrl}?${paramsString}` : baseUrl;
    };

    return {
        searchParams,
        updateFilter,
        buildUrl,
        getParam: (key, fallback = "") => searchParams.get(key) || fallback,
        removeFilter
    };
}
export default useUrlFilters