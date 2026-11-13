

import { useState } from "react";

const useCheckLogin = () => {

    const [showAlert, setShowAlert] = useState(false);

    function check(stateFn) {

        const token = localStorage.getItem("token");
        if (!token) {
            setShowAlert(true);
            return;
        }

        if (stateFn) {
            stateFn(true);
            return;
        }
    }

    return { showAlert, setShowAlert, check };
};

export default useCheckLogin