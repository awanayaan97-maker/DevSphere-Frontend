
import React from "react";
import { useNavigate } from "react-router-dom";

function UserAvatar({ userData, id }) {
    const navigate = useNavigate();

    const avatarUrl = userData?.profileImage || "";

    const firstName = userData?.firstName || userData?.firstname || "";
    const lastName = userData?.lastName || userData?.lastname || "";

    const initials = `${firstName} ${lastName}`
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name[0]?.toUpperCase() || "")
        .join("") || "U";

    const handleClick = () => {
        if (id) {
            navigate(`/user/${id}`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="user-avatar-wrapper-btn"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={firstName || "User"}
                    className="user-avatar-img"
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div
                    className="user-avatar-initials-circle"
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-surface-hover, #21262d)",
                        color: "var(--color-accent, #2ea043)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "700",
                    }}
                >
                    <p style={{ margin: 0 }}>{initials}</p>
                </div>
            )}
        </button>
    );
}

export default UserAvatar