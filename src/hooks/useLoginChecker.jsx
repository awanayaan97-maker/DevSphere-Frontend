import { useEffect, useState } from "react";



function useLoginChecker(){

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("token")

        if(!token) setIsLoggedIn(true)

    }, [])

    return {isLoggedIn, setIsLoggedIn}

}

export default useLoginChecker