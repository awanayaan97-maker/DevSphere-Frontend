

import { useEffect, useState } from "react";
import ArticleEditor from "../../Components/ArticleEditor/ArticleEditor";
import "./CreateArticle.css";
import useForm from "../../hooks/useInputHandler";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import useCallApi from "../../hooks/useCallApi";
import Loader from "../../Components/Loader/Loader";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import CategorySelect from "../../Components/CategorySelect/CategorySelect";


function CreateArticle() {

    const { id } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { isLoggedIn } = useLoginChecker();
    // const [error, setError] = useState(null);
    const { loading, callApi, error, setError } = useCallApi();
    const [tagInput, setTagInput] = useState("");
    const { inputData, setInputData, inputHandler } = useForm({
        title: "",
        description: "",
        category: "",
        content: "",
        tags: []
    })


    async function handleSaveDraft() {

        if (!inputData.title.trim()) return setError("Please add a title for your article.");

        const data = { ...inputData, articleId: id }

        const result = await callApi(`${API_URL}/api/article/draft`, "POST", data, token)

        if (result.status) navigate('/drafts');

        if (!result.status) return setError(result.message)

    }

    async function handlePublish() {

        if (!inputData.title.trim()) return setError("Please add a title for your article.");
        if (!inputData.content.trim()) return setError("Please add some content before publishing.");

        const url = id ? `${API_URL}/api/article/publish/${id}` : `${API_URL}/api/article/publish`

        const result = await callApi(url, "POST", inputData, token)

        if (result?.status) navigate('/');

        if (!result?.status) return setError(result?.message)
    }

    function handleTags() {
        const tagValue = tagInput.trim().toLowerCase();
        const tagId = Date.now();

        setInputData(prevData => ({
            ...prevData,
            tags: [...prevData.tags, { tagValue, tagId }]
        }))

        setTagInput("")
    }

    function handleTagRemove(tagId) {

        setInputData(prevData => ({
            ...prevData,
            tags: prevData.tags.filter((item) => item.tagId !== tagId)
        }))
    }


    useEffect(() => {

        if (!id) return

        async function getDraftData() {

            let result = await callApi(`${API_URL}/api/article/${id}`, "GET", null, token);

            if (result) {

                const cleanContent = DOMPurify.sanitize(result.data.content);
                result.data.content = cleanContent

                setInputData({
                    title: result.data.title || "",
                    description: result.data.description || "",
                    content: cleanContent || "",
                    tags: result.data.tags || "",
                    category: result.data.category || "",
                })

            }

            if (!result.status) return setError(result.message);

        }

        getDraftData()

    }, [id])

    if (isLoggedIn) return <Alert
        title="Login Required"
        message="Please login or create an account to create article"
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate('/')}
    />

    if (loading) return <Loader />
    if (error) return <ResponsePopup message={error} closePopup={() => setError(null)} />

    return (
        <main className="create-article-page">

            <div className="create-article-header">

                <div>
                    <div className="create-article-eyebrow">
                        <i className="fa-solid fa-pen-nib"></i>
                        Write & Share
                    </div>

                    <h1>Create Article</h1>

                    <p>
                        Share your knowledge, ideas, projects and experiences
                        with the developer community.
                    </p>
                </div>

            </div>


            {/* Article Layout */}
            <div className="create-article-layout">

                {/* Main Content */}
                <section className="article-writing-area">

                    {/* Article Information */}
                    <div className="article-info-card">

                        <div className="article-field">

                            <label htmlFor="article-title">
                                Article Title
                            </label>

                            <input
                                id="article-title"
                                type="text"
                                name="title"
                                placeholder="Give your article a clear and engaging title..."
                                value={inputData.title}
                                onChange={inputHandler}
                            />

                        </div>


                        <div className="article-field">

                            <label htmlFor="article-description">
                                Short Description
                                <span>Optional</span>
                            </label>

                            <textarea
                                id="article-description"
                                placeholder="Briefly explain what readers will learn from this article..."
                                name="description"
                                value={inputData.description}
                                onChange={inputHandler}
                                rows="3"
                            />

                        </div>

                    </div>


                    {/* Editor */}
                    <div className="article-content-card">

                        <div className="article-content-heading">

                            <div>
                                <h2>Article Content</h2>

                                <p>
                                    Write your article, add code examples,
                                    images, links and more.
                                </p>
                            </div>

                            <div className="editor-status">
                                <span className="status-dot"></span>
                                Editing
                            </div>

                        </div>

                        <ArticleEditor setInputData={setInputData} inputData={inputData} token={token} ApiUrl={API_URL} />

                    </div>

                </section>


                {/* Sidebar */}
                <aside className="article-sidebar">


                    {/* Publishing Card */}
                    <div className="article-sidebar-card">

                        <div className="sidebar-card-heading">
                            <div className="sidebar-heading-icon">
                                <i className="fa-solid fa-sliders"></i>
                            </div>

                            <div>
                                <h3>Publishing</h3>
                                <p>Configure your article</p>
                            </div>
                        </div>


                        {/* Category */}
                        <div className="sidebar-field">

                            <CategorySelect
                                selectedCategory={inputData.category}
                                onChange={inputHandler}
                                label="Select Category"
                                size="default"
                            />

                        </div>

                        {/* Tags */}
                        <div className="sidebar-field">

                            <label htmlFor="article-tags">
                                Tags
                            </label>

                            <div className="tags-input-wrapper">

                                <input
                                    id="article-tags"
                                    type="text"
                                    value={tagInput}
                                    placeholder="e.g. React"
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleTags()}
                                />

                                <button
                                    type="button"
                                    className="add-tag-button"
                                    onClick={handleTags}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Add
                                </button>

                            </div>


                            {/* Added Tags */}
                            <div className="article-tags-list">

                                {inputData?.tags.map((tag) => {

                                    return <span className="article-tag" key={tag.tagId}>

                                        {`#${tag.tagValue}`}

                                        <button
                                            type="button"
                                            aria-label={`Remove ${tag}`}
                                            onClick={() => handleTagRemove(tag.tagId)}

                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>

                                    </span>


                                })}



                            </div>


                            <small>
                                Add relevant technologies, topics or concepts.
                            </small>

                        </div>


                        {/* Actions */}
                        <div className="article-actions">

                            <button
                                type="button"
                                className="publish-button"
                                onClick={handlePublish}
                            >
                                Publish Article
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>


                            <button
                                type="button"
                                className="save-draft-button"
                                onClick={handleSaveDraft}
                            >
                                <i className="fa-regular fa-floppy-disk"></i>
                                Save Draft
                            </button>

                        </div>

                    </div>


                    {/* Writing Tips */}
                    <div className="article-sidebar-card writing-tips-card">

                        <div className="sidebar-card-heading">

                            <div className="sidebar-heading-icon tips-icon">
                                <i className="fa-solid fa-lightbulb"></i>
                            </div>

                            <div>
                                <h3>Writing Tips</h3>
                                <p>Make your article useful</p>
                            </div>

                        </div>


                        <ul className="writing-tips-list">

                            <li>
                                <i className="fa-solid fa-check"></i>
                                <span>
                                    Start with a clear problem or idea.
                                </span>
                            </li>

                            <li>
                                <i className="fa-solid fa-check"></i>
                                <span>
                                    Use headings to make content easier to scan.
                                </span>
                            </li>

                            <li>
                                <i className="fa-solid fa-check"></i>
                                <span>
                                    Add real code examples when useful.
                                </span>
                            </li>

                            <li>
                                <i className="fa-solid fa-check"></i>
                                <span>
                                    Keep paragraphs short and readable.
                                </span>
                            </li>

                        </ul>

                    </div>

                </aside>

            </div>

        </main>
    );
}

export default CreateArticle;