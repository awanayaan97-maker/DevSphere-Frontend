import { useEffect, useState } from "react"


function useFetch(Url, token) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null)


    useEffect(() => {

        async function getData() {

            setLoading(true)

            try {

                if (!token) {

                    const response = await fetch(Url, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    })

                    const data = await response.json();

                    if (!response.ok) throw new Error(data.message || "Something went wrong");

                    setData(data)

                }

                else {

                    const response = await fetch(Url, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    })

        
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "Something went wrong");
                    setData(data)

                }

            }

            catch (error) {

                if (error.message === "Failed to fetch") setError("Unable to connect. Please check your internet connection.")

                else setError(error.message)
            }

            finally {
                setLoading(false)
            }
        }

        getData()

    }, [Url])

    return { data, error, setError, loading }
}

export default useFetch