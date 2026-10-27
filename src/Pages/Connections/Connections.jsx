
import "./Connections.css"

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import useFetch from "../../hooks/useFetch";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";

function Connections() {

    const { type } = useParams();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { isLoggedIn } = useLoginChecker();
    const { loading, error, setError, data } = useFetch(`${API_URL}/api/user/connections/${type}`, token)


    if (type !== "followers" && type !== "followings") {
        return (
            <div className="connections-page">
                <div className="connections-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <h2>Invalid Connection</h2>
                    <p>
                        The connection type you are looking for does not exist.
                    </p>

                    <button
                        onClick={() => navigate("/profile")}
                        className="connections-back-btn"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    if (isLoggedIn) return <Alert
        title="Login Required"
        message="Please login or create an account to view your profile."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}
    />;

    if (loading) return <Loader />

    if (!data) return null;

    if (!data.status) {
        return <ResponsePopup message={data.message} closePopup={() => setError(null)} />;
    }

    console.log(data);


    return (
        <div className="connections-page">

            {error ? <ResponsePopup message={data.message} closePopup={() => setError(null)} /> : ""}

            <div className="connections-header">

                <div className="connections-heading">
                    <button
                        className="connections-back"
                        onClick={() => navigate("/profile")}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>

                    <div>
                        <h1>
                            {type === "followers"
                                ? "Followers"
                                : "Followings"}
                        </h1>

                        <p>
                            {data?.data?.length}{" "}
                            {data?.data?.length === 1 ? "person" : "people"}
                        </p>
                    </div>
                </div>

                {/* TABS */}
                <div className="connections-tabs">

                    <button
                        className={
                            type === "followers"
                                ? "connection-tab active"
                                : "connection-tab"
                        }
                        onClick={() =>
                            navigate("/connections/followers")
                        }
                    >
                        Followers
                    </button>

                    <button
                        className={
                            type === "followings"
                                ? "connection-tab active"
                                : "connection-tab"
                        }
                        onClick={() =>
                            navigate("/connections/followings")
                        }
                    >
                        Following
                    </button>

                </div>

            </div>

            { }



            {/* USERS LIST */}
            <div className="connections-list">

                {data?.data?.length > 0 ?

                    data?.data?.map((user) => (

                        <div
                            className="connection-card"
                            key={user.id}
                        >

                            {/* PROFILE */}
                            <div
                                className="connection-user"
                                onClick={() =>
                                    navigate(`/user/${user?.followingsData?._id}`)
                                }
                            >

                                {user?.followingsData?.profileImage ?
                                    <img
                                        src={user?.followingsData?.profileImage}
                                        alt={`${user?.followingsData?.firstName} ${user?.followingsData?.lastName}`}
                                        className="connection-avatar"
                                    />

                                    :

                                    <h1>{user?.followingsData?.firstName.charAt(0)}</h1>
                                }

                                <div className="connection-user-info">

                                    <h3>
                                        {user?.followingsData?.firstName}{" "}
                                        {user?.followingsData?.lastName}
                                    </h3>

                                    <span className="connection-username">
                                        @{user?.followingsData?.firstName}
                                    </span>

                                    <p>
                                        {user?.followingsData?.headline}
                                    </p>

                                </div>

                            </div>


                            {/* ACTION */}
                            <button
                                className="connection-view-profile"
                                onClick={() => navigate(`/user/${user?.followingsData?._id}`)}
                            >
                                View Profile
                            </button>
                        </div>

                    ))

                    :

                    /* EMPTY STATE */
                    <div className="connections-empty">

                        <div className="connections-empty-icon">
                            <i className="fa-solid fa-user-group"></i>
                        </div>

                        <h2>
                            {type === "followers"
                                ? "No followers yet"
                                : "You're not following anyone yet"}
                        </h2>

                        <p>
                            {type === "followers"
                                ? "When people follow you, they will appear here."
                                : "People you follow will appear here."}
                        </p>

                    </div>

                }

            </div>

        </div>
    );
}

export default Connections;