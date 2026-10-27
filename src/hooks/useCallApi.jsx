import { useState } from "react";


function useCallApi() {


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)

    const callApi = async (url, method, body, token) => {
        setLoading(true);
        setError(null)

        try {

            const isFormData = body instanceof FormData

            if (!token) {

                if (method === "GET") {

                    let response = await fetch(url, {
                        method: method,
                        headers: { "Content-Type": "application/json" },
                    })

                    let data = await response.json();
                    if (!data.status) throw new Error(data.message || "Something went wrong");
                    return data

                }

                let response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })

                let data = await response.json();
                if (!data.status) throw new Error(data.message || "Something went wrong");
                return data

            }

            else if (method === "GET") {

                const response = await fetch(url, {
                    method: method,
                    headers: token ? { Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" },
                })


                const data = await response.json()
                if (!data.status) throw new Error(data.message || "Something went wrong");
                return data

            }

            else if (method === "DELETE") {

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })

                const data = await response.json();
                if (!data.status) throw new Error(data.message || "Something went wrong");
                return data
            }


            let response = await fetch(url, {
                method: method,
                headers: isFormData ? { Authorization: `Bearer ${token}` } : {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: isFormData ? body : JSON.stringify(body)
            })

            let data = await response.json();
            if (!data.status) throw new Error(data.message || "Something went wrong");
            return data

        }

        catch (error) {

            let errorMessage;

            if (error.message === "Failed to fetch") {
                errorMessage = "Unable to connect. Please check your internet connection."
            } else {
                errorMessage = error.message;
            }

            setError(errorMessage)

            return { status: false, message: errorMessage };

        }

        finally {
            setLoading(false)
        }

    }

    return { loading, error, setError, callApi }
}

export default useCallApi