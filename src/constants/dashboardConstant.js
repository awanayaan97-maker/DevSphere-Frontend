

const API_URL = import.meta.env.VITE_API_URL;

const ROUTES = {
    createArticle: "/article-editor",
    editProfile: "/edit-profile",
    article: (id) => `/article/${id}`,
    profile: (id) => `/profile`
};

const DELETE_URL = {
    publish: (id) => `${API_URL}/api/article/${id}`,
    draft: (id) => `${API_URL}/api/article/draft/${id}`,
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

export { ROUTES, DELETE_URL, COUNT_KEY, STAT_CARDS, PROFILE_ITEMS }