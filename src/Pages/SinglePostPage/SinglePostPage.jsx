

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import CommunityPostCard from "../../Components/CommunityPostCard/CommunityPostCard";
import useCallApi from "../../hooks/useCallApi";

import "./SinglePostPage.css";

function SinglePostPage() {
    const { id } = useParams();

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const { callApi, loading } = useCallApi();

    const [post, setPost] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchPost() {
            setPost(null);
            setError("");

            try {
                const result = await callApi(
                    `${API_URL}/api/post/${id}`,
                    "GET",
                    null,
                    token
                );

                if (cancelled) return;

                if (result?.status && result?.data) {
                    setPost(result.data);
                } else {
                    setError("This post could not be found.");
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load this post. Please try again.");
                }
            }
        }

        if (id) {
            fetchPost();
        } else {
            setError("Invalid post link.");
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <main className="single-post-page">
            <div className="single-post-container">
                {loading && !post && !error && (
                    <div className="single-post-state">
                        <span className="single-post-spinner" />
                        <p>Loading post...</p>
                    </div>
                )}

                {error && (
                    <div className="single-post-state">
                        <div className="single-post-state-icon">
                            <i className="fa-regular fa-file-lines" />
                        </div>

                        <h2>Post unavailable</h2>
                        <p>{error}</p>

                        <div className="single-post-actions">
                            <Link
                                to="/community"
                                className="single-post-primary-btn"
                            >
                                Go to Community
                            </Link>

                            <Link
                                to="/articles"
                                className="single-post-secondary-btn"
                            >
                                Read Articles
                            </Link>
                        </div>
                    </div>
                )}

                {post && (
                    <>
                        <div className="single-post-back">
                            <Link to="/community">
                                <i className="fa-solid fa-arrow-left" />
                                Back to Community
                            </Link>
                        </div>

                        <section className="single-post-card">
                            <CommunityPostCard post={post} />
                        </section>

                        <section className="single-post-footer">
                            <div className="single-post-footer-icon">
                                <i className="fa-solid fa-code" />
                            </div>

                            <h2>Keep building with DevSphere</h2>

                            <p>
                                Discover projects, exchange ideas with
                                developers, and share what you are learning.
                                There is always something new to explore.
                            </p>

                            <div className="single-post-actions">
                                <Link
                                    to="/community"
                                    className="single-post-primary-btn"
                                >
                                    Go to Community
                                    <i className="fa-solid fa-arrow-right" />
                                </Link>

                                <Link
                                    to="/"
                                    className="single-post-secondary-btn"
                                >
                                    Read Articles
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

export default SinglePostPage;