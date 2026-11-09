import Alert from "../../Components/Alert/Alert";
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useLoginChecker from "../../hooks/useLoginChecker";
import "./DraftArticles.css";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { useState, useEffect, useRef } from "react";
import useCallApi from "../../hooks/useCallApi";
import useApiQuery from "../../hooks/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";

function DraftArticles() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const { isLoggedIn } = useLoginChecker();
    const { callApi } = useCallApi();
    const { isLoading, error, setError, data } = useApiQuery({
        url: `${API_URL}/api/article/draft`,
        type: "GET",
        isAuthorized: true
    })

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteDraft = (draftId) => {
        setActiveDropdownId(null);

        const deleteDraft = async () => {
            const result = await callApi(`${API_URL}/api/article/draft/${draftId}`, "DELETE", [], token)
            if (result?.status) {
                queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/article/draft`] })
                return
            }
            setError(result?.message)
        }

        deleteDraft()
    };

    if (!isLoggedIn) return <Alert
        title="Login Required"
        message="Please login or create an account to view your profile."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}
    />;

    if (isLoading) return <Loader />;
    if (error) return <ResponsePopup message={error} closePopup={() => setError(null)} />;

    return (
        <main className="drafts-page">
            <section className="drafts-header">
                <div className="drafts-header-content">
                    <span className="drafts-eyebrow">YOUR ARTICLES</span>
                    <h1>Draft Articles</h1>
                    <p>Continue writing your unfinished articles and publish them when they are ready.</p>
                </div>
                <div className="drafts-count">
                    <span>Drafts</span>
                    <strong>{data?.length}</strong>
                </div>
            </section>

            <section className="drafts-section">
                <div className="drafts-section-header">
                    <div>
                        <h2>Your Drafts</h2>
                        <p>Articles saved for later</p>
                    </div>
                    <i className="fa-regular fa-file-lines"></i>
                </div>

                <div className="drafts-list">
                    {data?.map((draft) => (
                        <article className="draft-card" key={draft._id}>
                            <div className="draft-card-icon">
                                <i className="fa-regular fa-file-lines"></i>
                            </div>

                            <div className="draft-info">
                                <div className="draft-title-row">
                                    <h3>{draft.title}</h3>
                                </div>
                                <p>{formatDistanceToNowStrict(new Date(draft.updatedAt))}</p>
                            </div>

                            {/* 3-Dot Options Menu Container */}
                            <div className="draft-action-container" ref={activeDropdownId === draft._id ? dropdownRef : null}>
                                <button
                                    type="button"
                                    className="draft-options-btn"
                                    onClick={() => setActiveDropdownId(activeDropdownId === draft._id ? null : draft._id)}
                                    aria-label="Draft options"
                                >
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>

                                {activeDropdownId === draft._id && (
                                    <div className="draft-dropdown-menu">
                                        <button
                                            type="button"
                                            className="draft-dropdown-item"
                                            onClick={() => {
                                                setActiveDropdownId(null);
                                                navigate(`/article-editor/${draft._id}`);
                                            }}
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                            <span>Edit Article</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="draft-dropdown-item delete-item"
                                            onClick={() => handleDeleteDraft(draft._id)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                            <span>Delete Article</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default DraftArticles;