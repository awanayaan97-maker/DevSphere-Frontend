import { useState } from "react";

function useCallApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = async (url, method = "GET", body = null, token = null) => {
        setLoading(true);
        setError(null);

        if (!navigator.onLine) {
            const networkMsg = "No internet connection. Please check your network.";
            setError(networkMsg);
            setLoading(false);
            return { status: false, message: networkMsg };
        }

        try {
            const isFormData = body instanceof FormData;
            const headers = {};

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            if (!isFormData && body && method !== "GET") {
                headers["Content-Type"] = "application/json";
            } 
            
            else if (!token && method === "GET") {
                headers["Content-Type"] = "application/json";
            }

            const options = {
                method,
                headers,
            };

            if (body && method !== "GET") {
                options.body = isFormData ? body : JSON.stringify(body);
            }

            const response = await fetch(url, options);
            // console.log(response, 'response');

            // if (!response.ok) {
            //     throw new Error(`Server error: ${response.status} ${response.statusText}`);
            // }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || "Something went wrong");
            }

            return data;

        } 
        
        catch (error) {

            let errorMessage;

            if (!navigator.onLine || error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
                errorMessage = "Unable to connect to server. Please check your internet connection.";
            } else {
                errorMessage = error.message;
            }

            setError(errorMessage);
            return { status: false, message: errorMessage };

        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, callApi };
}

export default useCallApi;