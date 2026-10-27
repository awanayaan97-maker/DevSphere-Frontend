

import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";
import { useEffect } from "react";
import { shortTimeAgo } from "../../utils/dateHelpers";

function NotificationDropdown({ notifications = [] }) {

    const navigate = useNavigate();
    let location = ""

    console.log(notifications, "notifications");

    return (
        <div className="notification-dropdown">

            {/* Header */}

            <div className="notification-header">

                <div>

                    <h3>
                        Notifications
                    </h3>

                    <span>
                        {notifications?.length}{" "}
                        {notifications?.length === 1
                            ? "notification"
                            : "notifications"}
                    </span>

                </div>

            </div>


            {/* Notification List */}

            <div className="notification-list">

                {notifications?.length > 0 ? (

                    notifications.map((notification) => {

                        const sender = notification?.senderData;

                        if (notification?.post) {
                            location = `/community/post/${notification.post}`
                        }

                        else if (notification?.article === null) {
                            location = `/user/${notification?.senderData?._id}`
                        }

                        else {
                            location = `/article/${notification?.article}`
                        }

                        const senderName =
                            `${sender?.firstName || ""} ${sender?.lastName || ""
                                }`.trim();


                        const initials =
                            `${sender?.firstName?.[0] || ""}${sender?.lastName?.[0] || ""
                            }`;


                        return (
                            <div
                                className="notification-item"
                                key={notification._id}
                                onClick={() => navigate(location)}
                            >
                                {/* Sender Avatar */}

                                <div className="notification-avatar" onClick={() => navigate(`/user/${sender._id}`)}>

                                    {sender?.profileImage ? (

                                        <img
                                            src={sender.profileImage}
                                            alt={senderName}
                                        />

                                    ) : (

                                        <span>
                                            {initials}
                                        </span>

                                    )}

                                </div>


                                {/* Notification Content */}

                                <div className="notification-content">

                                    <p className="notification-message">
                                        {notification.message}
                                    </p>


                                    <div className="notification-meta">

                                        <span className="notification-time">
                                            {shortTimeAgo(notification.createdAt)}
                                        </span>

                                    </div>

                                </div>

                            </div>
                        );

                    })

                ) : (

                    /* Empty State */

                    <div className="notification-empty">

                        <div className="notification-empty-icon">

                            <i className="fa-regular fa-bell"></i>

                        </div>


                        <h4>
                            No new notifications
                        </h4>


                        <p>
                            You're all caught up. We'll let you know
                            when something new happens.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}


export default NotificationDropdown;