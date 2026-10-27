
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import { AuthContext } from "../../Context/AuthContext";
import useCallApi from "../../hooks/useCallApi";
import Loader from "../../components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import ManageContent from "../../Components/ManageContent/ManageContent";

import "./Dashboard.css";
const API_URL = import.meta.env.VITE_API_URL;

const ROUTES = {
    createArticle: "/article-editor",
    editProfile: "/edit-profile",            
    article: (id) => `/article/${id}`,
    profile: (id) => `/profile`
};

const DELETE_URL = {
    publish: (id) => `${API_URL}/api/article/${id}`,        
    draft: (id) => `${API_URL}/api/article/${id}`,   
    posts: (id) => `${API_URL}/api/post/${id}`         
};

const COUNT_KEY = {
    publish: "publishArticles",
    draft: "draftArticles",
    posts: "communityPosts"
};

const STAT_CARDS = [
    { key: "publishArticles", label: "Published articles", sub: "Live on DevSphere", icon: "fa-newspaper" },
    { key: "draftArticles", label: "Drafts", sub: "Still in progress", icon: "fa-file-pen" },
    { key: "communityPosts", label: "Community posts", sub: "Shared with developers", icon: "fa-comments" },
    { key: "followers", label: "Followers", sub: "People following you", icon: "fa-users" },
    { key: "followings", label: "Following", sub: "People you follow", icon: "fa-user-plus" },
    { key: "totalLikes", label: "Total likes", sub: "On articles and posts", icon: "fa-heart" }
];

const PROFILE_ITEMS = [
    { label: "Profile image", done: (u) => Boolean(u?.profileImage) },
    { label: "Cover image", done: (u) => Boolean(u?.coverImage) },
    { label: "Headline", done: (u) => Boolean(u?.headline?.trim()) },
    { label: "Role", done: (u) => Boolean(u?.role?.trim()) }
];

function formatChartDate(dateStr, withYear = false) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        ...(withYear && { year: "numeric" })
    });
}

function formatNumber(value) {
    return typeof value === "number" ? value.toLocaleString() : "–";
}

function ChartTooltip({ active, payload }) {

    if (!active || !payload?.length) return null;

    const { date, count } = payload[0].payload;

    return (
        <div className="dash-tooltip">
            <span className="dash-tooltip-date">{formatChartDate(date, true)}</span>
            <strong>{count} new {count === 1 ? "follower" : "followers"}</strong>
        </div>
    );
}


function ProfileCompletion({ user, onEdit, onView }) {

    if (!user) return null;

    const results = PROFILE_ITEMS.map((item) => ({ ...item, isDone: item.done(user) }));
    const doneCount = results.filter((r) => r.isDone).length;
    const percent = Math.round((doneCount / PROFILE_ITEMS.length) * 100);

    if (percent === 100) return null;

    return (
        <section className="dash-card dash-profile">

            <div className="dash-profile-head">
                <div>
                    <h2 className="dash-card-title">Complete your profile</h2>
                    <p className="dash-card-sub">A complete profile helps other developers find and trust your work.</p>
                </div>

                <span className="dash-profile-percent">{percent}%</span>
            </div>

            <div
                className="dash-progress"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile completion"
            >
                <div className="dash-progress-fill" style={{ width: `${percent}%` }}></div>
            </div>

            <ul className="dash-checklist">
                {results.map((r) => (
                    <li key={r.label} className={r.isDone ? "dash-check-done" : ""}>
                        <span className="dash-check-circle">
                            {r.isDone && <i className="fa-solid fa-check"></i>}
                        </span>
                        {r.label}
                    </li>
                ))}
            </ul>

            <div className="dash-profile-actions">
                <button type="button" className="dash-btn dash-btn-primary" onClick={onEdit}>
                    Edit profile
                </button>

                <button type="button" className="dash-btn" onClick={onView}>
                    View profile
                </button>
            </div>

        </section>
    );
}


function Dashboard() {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();

    const token = localStorage.getItem("token");
    const profile = user?.data;

    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    const [summary, setSummary] = useState(null);
    const [topArticles, setTopArticles] = useState([]);
    const [chartData, setChartData] = useState([]);

    const [tab, setTab] = useState("publish");
    const [items, setItems] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);

    const [failed, setFailed] = useState({});
    const [error, setError] = useState(null);


    useEffect(() => {

        let cancelled = false;
        // callApi fail ho jaye to bhi baqi calls na toote
        const get = (path) =>
            callApi(`${API_URL}/api/dashboard/${path}`, "GET", [], token).catch(() => null);

        async function load() {

            setLoading(true);

            const [s, t, f, c] = await Promise.all([
                get("summary"),
                get("top-articles"),
                get("followers-chart"),
                get("content?type=publish")
            ]);

            if (cancelled) return;

            setSummary(s?.status ? s.data : null);
            setTopArticles(t?.status ? t.data : []);
            setChartData(f?.status ? f.data : []);
            setItems(c?.status ? c.data : []);
            setTab("publish");

            setFailed({
                summary: !s?.status,
                top: !t?.status,
                chart: !f?.status,
                content: !c?.status
            });

            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };

    }, [reloadKey]);

    async function handleTabChange(nextTab) {

        if (nextTab === tab) return;

        setTab(nextTab);
        setTabLoading(true);

        const result = await callApi(
            `${API_URL}/api/dashboard/content?type=${nextTab}`,
            "GET",
            [],
            token
        ).catch(() => null);

        if (result?.status) {
            setItems(result.data);
        } else {
            setItems([]);
            setError(result?.message || "Couldn't load this list. Please try again.");
        }

        setTabLoading(false);
    }


    async function handleDelete(currentTab, item) {

        const result = await callApi(
            DELETE_URL[currentTab](item._id),
            "DELETE",
            [],
            token
        ).catch(() => null);

        if (!result?.status) {
            setError(result?.message || "Couldn't delete. Please try again.");
            return;
        }

        // Server ne confirm kar diya: ab list aur numbers badlo
        setItems((prev) => prev.filter((i) => i._id !== item._id));

        setSummary((prev) => {
            if (!prev) return prev;

            const key = COUNT_KEY[currentTab];

            return {
                ...prev,
                [key]: Math.max(0, (prev[key] || 0) - 1),
                totalLikes: Math.max(0, (prev.totalLikes || 0) - (item.likesCount || 0))
            };
        });

        if (currentTab === "publish") {
            setTopArticles((prev) => prev.filter((a) => a._id !== item._id));
        }
    }


    if (loading) return <Loader />;

    const anyFailed = Object.values(failed).some(Boolean);
    const totalNewFollowers = chartData.reduce((sum, d) => sum + d.count, 0);

    return (
        <main className="dash-page">

            {error && <ResponsePopup message={error} closePopup={() => setError(null)} />}

            {/* Header */}
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">
                        Welcome back{profile?.firstName ? `, ${profile.firstName}` : ""}
                    </h1>
                    <p className="dash-subtitle">Here's how your content and audience are doing.</p>
                </div>

                <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => navigate(ROUTES.createArticle)}
                >
                    <i className="fa-solid fa-plus"></i>
                    Create article
                </button>
            </header>

            {/* Kuch section load na hua ho to */}
            {anyFailed && (
                <div className="dash-alert" role="alert">
                    <span>Some sections couldn't be loaded.</span>

                    <button type="button" className="dash-btn" onClick={() => setReloadKey((k) => k + 1)}>
                        Retry
                    </button>
                </div>
            )}

            {/* Profile completion */}
            <ProfileCompletion
                user={profile}
                onEdit={() => navigate(ROUTES.editProfile)}
                onView={() => navigate(ROUTES.profile(profile?._id))}
            />

            {/* Stat cards */}
            <section className="dash-stats" aria-label="Overview">
                {STAT_CARDS.map((card) => (
                    <div key={card.key} className="dash-stat">

                        <span className="dash-stat-icon">
                            <i className={`fa-solid ${card.icon}`}></i>
                        </span>

                        <span className="dash-stat-value">{formatNumber(summary?.[card.key])}</span>
                        <span className="dash-stat-label">{card.label}</span>
                        <span className="dash-stat-sub">{card.sub}</span>

                    </div>
                ))}
            </section>

            <section className="dash-card">

                <div className="dash-card-head">
                    <div>
                        <h2 className="dash-card-title">New followers</h2>
                        <p className="dash-card-sub">Last 30 days</p>
                    </div>

                    {!failed.chart && <span className="dash-badge">+{totalNewFollowers}</span>}
                </div>

                {failed.chart ? (
                    <p className="dash-muted">Couldn't load the chart.</p>
                ) : totalNewFollowers === 0 ? (
                    <p className="dash-muted">No new followers in the last 30 days. Share your articles to grow your audience.</p>
                ) : (
                    <div className="dash-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>

                                <defs>
                                    <linearGradient id="followersFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.28 }} />
                                        <stop offset="100%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(d) => formatChartDate(d)}
                                    tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                                    axisLine={{ stroke: "var(--color-border)" }}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                    minTickGap={32}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border-hover)" }} />

                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--color-accent)"
                                    strokeWidth={2}
                                    fill="url(#followersFill)"
                                    activeDot={{ r: 5 }}
                                />

                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

            </section>


            <section className="dash-card">

                <div className="dash-card-head">
                    <div>
                        <h2 className="dash-card-title">Best performing articles</h2>
                        <p className="dash-card-sub">Your top articles right now</p>
                    </div>
                </div>

                {failed.top ? (
                    <p className="dash-muted">Couldn't load your top articles.</p>
                ) : topArticles.length === 0 ? (
                    <p className="dash-muted">Publish an article to see your best performers here.</p>
                ) : (
                    <ol className="dash-top-list">
                        {topArticles.map((article, index) => (
                            <li className="dash-top-item" key={article._id}>

                                <span className="dash-top-rank">{index + 1}</span>

                                <p className="dash-top-title" title={article.title}>{article.title}</p>

                                <div className="dash-top-stats">
                                    <span><i className="fa-regular fa-heart"></i>{article.likesCount}</span>
                                    <span><i className="fa-regular fa-comment"></i>{article.commentsCount}</span>
                                    <span><i className="fa-regular fa-bookmark"></i>{article.savesCount}</span>
                                </div>

                                <button
                                    type="button"
                                    className="dash-btn dash-btn-small dash-top-action"
                                    onClick={() => navigate(ROUTES.article(article._id))}
                                >
                                    View article
                                    <i className="fa-solid fa-arrow-right"></i>
                                </button>

                            </li>
                        ))}
                    </ol>
                )}

            </section>


            {failed.content ? (
                <section className="dash-card">
                    <h2 className="dash-card-title">Manage content</h2>
                    <p className="dash-muted">Couldn't load your content. Use Retry above.</p>
                </section>
            ) : (
                <ManageContent
                    tab={tab}
                    onTabChange={handleTabChange}
                    counts={{
                        articles: summary?.publishArticles ?? 0,
                        drafts: summary?.draftArticles ?? 0,
                        posts: summary?.communityPosts ?? 0
                    }}
                    items={items}
                    loading={tabLoading}
                    onDelete={handleDelete}
                />
            )}

        </main>
    );
}

export default Dashboard;