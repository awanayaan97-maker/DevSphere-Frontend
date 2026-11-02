
import { useState } from 'react';

function useLoginChecker() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token;
    });

    return { isLoggedIn, setIsLoggedIn };
}

export default useLoginChecker;