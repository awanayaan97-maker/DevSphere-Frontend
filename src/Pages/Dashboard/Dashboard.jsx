
import { useState, useContext } from "react";
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
import Loader from "../../Components/Loader/Loader";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import ManageContent from "../../Components/ManageContent/ManageContent";
import { ROUTES, DELETE_URL, STAT_CARDS, PROFILE_ITEMS, COUNT_KEY } from "../../constants/dashboardConstant"
import "./Dashboard.css";
import useApiQuery from "../../hooks/useApiQuery";
import { useQueryClient } from "@tanstack/react-query"


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

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();
    const token = localStorage.getItem("token");
    const profile = user;

    const [tab, setTab] = useState("publish");
    const [error, setError] = useState(null);

    const { data: summary, isLoading: summaryLoading } = useApiQuery({
        url: `${API_URL}/api/dashboard/summary`,
        type: "GET",
        isAuthorized: true
    });

    const { data: topArticles, isLoading: topLoading } = useApiQuery({
        url: `${API_URL}/api/dashboard/top-articles`,
        type: "GET",
        isAuthorized: true
    });

    const { data: chartData, isLoading: chartLoading } = useApiQuery({
        url: `${API_URL}/api/dashboard/followers-chart`,
        type: "GET",
        isAuthorized: true
    });

    const { data: items, isLoading: tabLoading } = useApiQuery({
        url: `${API_URL}/api/dashboard/content?type=${tab}`,
        type: "GET",
        isAuthorized: true
    });


    function handleTabChange(nextTab) {
        if (nextTab === tab) return;
        setTab(nextTab);
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

    const tokenSlice = token ? token.slice(-10) : "";

    queryClient.invalidateQueries({
        queryKey: [`${API_URL}/api/dashboard/content?type=${currentTab}`, tokenSlice]
    });

    queryClient.invalidateQueries({
        queryKey: [`${API_URL}/api/dashboard/summary`, tokenSlice]
    });

    if (currentTab === "publish") {
        queryClient.invalidateQueries({
            queryKey: [`${API_URL}/api/dashboard/top-articles`, tokenSlice]
        });
    }
}


    if (summaryLoading || topLoading || chartLoading || tabLoading) {
        return <Loader />;
    }

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

                    {<span className="dash-badge">+{totalNewFollowers}</span>}
                </div>

                {totalNewFollowers === 0 ? (
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

                {topArticles.length === 0 ? (
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
        </main>
    );
}

export default Dashboard;