

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import "./Connections.css";
import useApiQuery from "../../hooks/useApiQuery";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import { AuthContext } from "../../Context/AuthContext";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";

const VALID_TABS = ["followers", "followings"];

function isValidTab(value) {
  return VALID_TABS.includes(value);
}

function Connections() {
  const { type } = useParams();
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL;
  const { isLoggedIn } = useLoginChecker();

  const [activeTab, setActiveTab] = useState(
    isValidTab(type) ? type : "followers"
  );

  useEffect(() => {
    if (isValidTab(type) && type !== activeTab) {
      setActiveTab(type);
    }
  }, [type, activeTab]);

  const queryKey = ["connections", activeTab, user._id];
  const { isLoading, error, setError, data } = useApiQuery({
    url: `${API_URL}/api/user/connections/${activeTab}`,
    type: "GET",
    isAuthorized: true,
    enabled: isValidTab(type),
    queryKey,
  });

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    navigate(`/connections/${nextTab}`, { replace: true });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["connections"] });
  };

  if (!isValidTab(type)) {
    return (
      <div className="connections-page">
        <div className="connections-container">
          <div className="connections-empty">
            <div className="connections-empty-icon">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <h2>Invalid Connection Type</h2>
            <p>The connections view you are looking for does not exist.</p>
            <div className="connections-empty-actions">
              <button
                type="button"
                className="connections-btn-primary"
                onClick={() => handleTabChange("followers")}
              >
                Go to Followers
              </button>
              <button
                type="button"
                className="connections-btn-secondary"
                onClick={() => navigate("/profile")}
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Alert
        title="Login Required"
        message="Please login or create an account to view your connections."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}
      />
    );
  }

  if (isLoading) {
    return <SectionLoader />;
  }

  const list = Array.isArray(data) ? data : [];
  
  return (
    <main className="connections-page">
      <div className="connections-container">
        {error ? (
          <ResponsePopup message={error} closePopup={() => setError(null)} />
        ) : null}

        {/* Top Header */}
        <header className="connections-header">
          <div className="connections-topbar">
            <button
              type="button"
              className="connections-back-btn"
              onClick={() => navigate("/profile")}
              aria-label="Back to profile"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Profile</span>
            </button>

            <button
              type="button"
              className="connections-refresh-btn"
              onClick={handleRefresh}
              aria-label="Refresh connections"
              title="Refresh list"
            >
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>

          <div className="connections-title-row">
            <div>
              <h1>Connections</h1>
              <p className="connections-subtitle">
                {list.length} {list.length === 1 ? "person" : "people"} in{" "}
                {activeTab === "followers" ? "followers" : "following"}
              </p>
            </div>
          </div>

          {/* 2 Tabs: Followers & Following */}
          <div
            className="connections-tabs"
            role="tablist"
            aria-label="Connection tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "followers"}
              className={`connections-tab ${
                activeTab === "followers" ? "is-active" : ""
              }`}
              onClick={() => handleTabChange("followers")}
            >
              <span>Followers</span>
              {activeTab === "followers" ? (
                <span className="connections-tab-badge">{list.length}</span>
              ) : null}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "followings"}
              className={`connections-tab ${
                activeTab === "followings" ? "is-active" : ""
              }`}
              onClick={() => handleTabChange("followings")}
            >
              <span>Following</span>
              {activeTab === "followings" ? (
                <span className="connections-tab-badge">{list.length}</span>
              ) : null}
            </button>
          </div>
        </header>

        {/* Vertical List or Empty State */}
        {list.length > 0 ? (
          <ul className="connections-list">
            {list.map((item) => {
              const profile = item?.followersData || item?.followingsData;
              const targetId = profile?._id;
              const fullName =
                [profile?.firstName, profile?.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || "Developer";
              const initial =
                profile?.firstName?.charAt(0)?.toUpperCase() || "D";
              const handle =
                profile?.username ||
                profile?.firstName?.toLowerCase().replace(/\s+/g, "") ||
                "member";
              const subtitleText =
                profile?.role || profile?.headline || "DevSphere Member";

              return (
                <li className="connection-row" key={item._id || targetId}>
                  <div
                    className="connection-user-info"
                    onClick={() => {
                      if (targetId) navigate(`/user/${targetId}`);
                    }}
                  >
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={fullName}
                        className="connection-avatar"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="connection-avatar-fallback"
                        aria-hidden="true"
                      >
                        {initial}
                      </div>
                    )}

                    <div className="connection-meta">
                      <div className="connection-name-line">
                        <h2 className="connection-name">{fullName}</h2>
                        <span className="connection-handle">@{handle}</span>
                      </div>
                      <p className="connection-role">{subtitleText}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="connection-profile-btn"
                    disabled={!targetId}
                    onClick={() => {
                      if (targetId) navigate(`/user/${targetId}`);
                    }}
                  >
                    <span>View Profile</span>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <section className="connections-empty" aria-live="polite">
            <div className="connections-empty-icon">
              <i className="fa-solid fa-user-group"></i>
            </div>

            <h2>
              {activeTab === "followers"
                ? "No followers yet"
                : "Not following anyone yet"}
            </h2>

            <p>
              {activeTab === "followers"
                ? "When other developers follow your profile, they will show up in this list."
                : "Discover creators and builders on Explore to start following people."}
            </p>

            <div className="connections-empty-actions">
              <button
                type="button"
                className="connections-btn-primary"
                onClick={() => navigate("/explore")}
              >
                <i className="fa-solid fa-compass"></i>
                <span>Explore Developers</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Connections;