

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionLoader from "../SectionLoader/SectionLoader";
import { shortTimeAgo } from "../../utils/dateHelpers";
import "./ManageContent.css";
import Alert from "../Alert/Alert";


const TABS = [
    { key: "publish", label: "Articles", countKey: "articles", noun: "article" },
    { key: "draft", label: "Drafts", countKey: "drafts", noun: "draft" },
    { key: "posts", label: "Posts", countKey: "posts", noun: "post" }
];

const STAT_COLUMNS = [
    { label: "Date", align: "left", hideOnMobile: true, render: (i) => i.formattedDate },
    { label: "Likes", align: "center", icon: "fa-regular fa-heart", render: (i) => i.likesCount },
    { label: "Comments", align: "center", icon: "fa-regular fa-comment", render: (i) => i.commentsCount },
    { label: "Saves", align: "center", icon: "fa-regular fa-bookmark", render: (i) => i.savesCount }
];

const COLUMNS = {
    publish: STAT_COLUMNS,
    posts: STAT_COLUMNS,
    draft: [{ label: "Last edited", align: "left", render: (i) => shortTimeAgo(i.updatedAt) }]
};

const EMPTY_TEXT = {
    publish: "You haven't published any articles yet.",
    draft: "You have no drafts.",
    posts: "You haven't shared any community posts yet."
};


function ManageContent({ tab, onTabChange, counts, items, loading, onDelete }) {

    const navigate = useNavigate();

    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const busy = loading || deleting;
    const currentTab = TABS.find((t) => t.key === tab);
    const columns = COLUMNS[tab];
    const isWide = tab !== "draft";


    useEffect(() => {

        if (!itemToDelete) return;

        const onKey = (e) => {
            if (e.key === "Escape") setItemToDelete(null);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);

    }, [itemToDelete]);


    function getTitle(item) {
        if (tab === "posts") return item.text?.trim() || "Post without text";
        return item.title || "Untitled";
    }

    function handleEdit(item) {
        if (tab === "posts") return;                     
        navigate(`/article-editor/${item._id}`);       
    }

    async function confirmDelete() {

        const item = itemToDelete;

        setItemToDelete(null);       
        setDeleting(true);        

        await onDelete(tab, item); 

        setDeleting(false);
    }

    if (itemToDelete) return <Alert
        title={`Delete this ${currentTab.noun}?`}
        message={getTitle(itemToDelete)}
        actionText="Delete"
        onAction={confirmDelete}
        onClose={() => setItemToDelete(null)}
    />

    return (
        <section className="manage-content">

            <h2 className="manage-title">Manage content</h2>

            <div className="manage-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        disabled={busy}
                        className={`manage-tab ${tab === t.key ? "manage-tab-active" : ""}`}
                        onClick={() => onTabChange(t.key)}
                    >
                        {t.label} ({counts?.[t.countKey] ?? 0})
                    </button>
                ))}
            </div>

            <div className="manage-body">

                {busy ? (

                    <div className="manage-loader">
                        <SectionLoader />
                    </div>

                ) : items.length === 0 ? (

                    <p className="manage-empty">{EMPTY_TEXT[tab]}</p>

                ) : (

                    <>
                        <div className="manage-table-wrap">

                            <table className={`manage-table ${isWide ? "manage-table-wide" : ""}`}>

                                <thead>
                                    <tr>
                                        <th className="manage-th-title">{tab === "posts" ? "Post" : "Title"}</th>

                                        {columns.map((c) => (
                                            <th
                                                key={c.label}
                                                title={c.label}
                                                className={`manage-align-${c.align} ${c.hideOnMobile ? "manage-hide-mobile" : ""}`}
                                            >
                                                <span className="manage-th-text">{c.label}</span>
                                                {c.icon && <i className={`manage-th-icon ${c.icon}`} aria-hidden="true"></i>}
                                            </th>
                                        ))}

                                        <th className="manage-th-actions">
                                            <span className="manage-sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item._id}>

                                            <td className="manage-td-title">
                                                <span className="manage-title-text" title={getTitle(item)}>
                                                    {getTitle(item)}
                                                </span>

                                                {isWide && <span className="manage-meta">{item.formattedDate}</span>}
                                            </td>

                                            {columns.map((c) => (
                                                <td
                                                    key={c.label}
                                                    className={`manage-align-${c.align} ${c.hideOnMobile ? "manage-hide-mobile" : ""}`}
                                                >
                                                    {c.render(item)}
                                                </td>

                                            ))}
                                            <td className="manage-td-actions">
                                                <button
                                                    type="button"
                                                    className="manage-icon-btn"
                                                    aria-label={`Edit ${currentTab.noun}`}
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="manage-icon-btn manage-icon-btn-danger"
                                                    aria-label={`Delete ${currentTab.noun}`}
                                                    onClick={() => setItemToDelete(item)}
                                                >
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </>
                )}

            </div>

        </section>
    );
}

export default ManageContent;