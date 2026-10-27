

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import ImageAttachment from "./ImageAttachment";
import VideoAttachment from "./VideoAttachment";
import CodeSnippetEditor from "./CodeSnippetEditor";

import "./CommunityComposer.css";
import useCallApi from "../../hooks/useCallApi";
import ButtonLoader from "../ButtonLoader/ButtonLoader";
import ResponsePopup from "../ResponsePopup/ResponsePopup";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

// const ALLOWED_VIDEO_TYPES = [
//   "video/mp4",
//   "video/webm",
//   "video/quicktime",
// ];

function CommunityComposer({ onClose, postToEdit = null, setPost }) {
    const imageInputRef = useRef(null);
    const previewUrlsRef = useRef(new Set());

    const [postText, setPostText] = useState("");
    const [postType, setPostType] = useState("Discussion");
    const [attachments, setAttachments] = useState([]);

    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [code, setCode] = useState("");
    const [codeLanguage, setCodeLanguage] = useState("javascript");

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const [attachmentErrors, setAttachmentErrors] = useState({});
    const [fileError, setFileError] = useState("");

    const { user } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [isPublishing, setIsPublishing] = useState(false);
    const { loading, callApi, error, setError } = useCallApi()

    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            previewUrlsRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!postToEdit) return;

        setPostText(postToEdit.text || "");
        setPostType(postToEdit.type || "Discussion");
        setCode(postToEdit.code || "");
        setCodeLanguage(postToEdit.codeLanguage || "javascript");
        setShowCodeEditor(Boolean(postToEdit.code));
        setTags(postToEdit.tags || []);

        const existingImages = (postToEdit.images || []).map((image) => ({
            id: image._id,
            type: "image",
            file: {
                name: image.filename,
                size: 0,
                type: "image/jpeg",
            },
            previewUrl: image.url,
            isExisting: true,
        }));

        setAttachments(existingImages);

    }, [postToEdit]);

    const addFiles = (event, type) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";

        if (!files.length) return;

        setFileError("");

        const currentCount = attachments.filter(
            (attachment) => attachment.type === type
        ).length;

        const acceptedFiles = [];
        const errors = [];

        if (type === "image") {
            let remainingSlots = MAX_IMAGES - currentCount;

            for (const file of files) {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    errors.push(`${file.name}: Only JPG, PNG, and WebP images are supported.`);
                    continue;
                }

                if (file.size > MAX_IMAGE_SIZE) {
                    errors.push(`${file.name}: Image size must not exceed 5 MB.`);
                    continue;
                }

                if (remainingSlots <= 0) {
                    errors.push("You can add a maximum of 5 images per post.");
                    continue;
                }

                acceptedFiles.push(file);
                remainingSlots -= 1;
            }
        }

        const newAttachments = acceptedFiles.map((file) => {
            const previewUrl = URL.createObjectURL(file);

            previewUrlsRef.current.add(previewUrl);

            return {
                id: crypto.randomUUID(),
                file,
                type,
                previewUrl,
            };
        });

        if (newAttachments.length > 0) {
            setAttachments((previous) => [
                ...previous,
                ...newAttachments,
            ]);
        }

        if (errors.length > 0) {
            setFileError(errors.join(" "));
        }
    };

    const removeAttachment = (id) => {

        setAttachments((previous) => {
            const attachment = previous.find(
                (item) => item.id === id
            );

            if (attachment.previewUrl && !attachment.isExisting) {
                URL.revokeObjectURL(attachment.previewUrl);
                previewUrlsRef.current.delete(attachment.previewUrl);
            }

            return previous.filter((item) => item.id !== id);
        });

        setAttachmentErrors((previous) => {
            const updatedErrors = { ...previous };
            delete updatedErrors[id];
            return updatedErrors;
        });

        setFileError("");
    };

    const handleAttachmentError = (id, message) => {
        setAttachmentErrors((previous) => ({
            ...previous,
            [id]: message,
        }));
    };

    const addTag = () => {
        const newTagValue = tagInput.trim().toLowerCase().replace(/^#/, "");

        if (
            newTagValue &&
            !tags.some(
                (tag) => tag.tagValue.toLowerCase() === newTagValue.toLowerCase()
            )
        ) {
            setTags((previous) => [
                ...previous,
                {
                    tagValue: newTagValue,
                    tagId: Date.now(),
                },
            ]);
        }

        setTagInput("");
    };

    const removeTag = (tagIdToRemove) => {
        setTags((previous) =>
            previous.filter((tag) => tag.tagId !== tagIdToRemove)
        );
    };

    const handlePublish = async (event) => {
        event.preventDefault();

        if (Object.keys(attachmentErrors).length > 0) {
            return;
        }

        const formData = new FormData();

        if (postToEdit?._id) {
            formData.append("postId", postToEdit._id);
        }

        formData.append("text", postText.trim());
        formData.append("type", postType);
        formData.append("tags", JSON.stringify(tags));

        formData.append(
            "code",
            showCodeEditor ? code : ""
        );

        formData.append(
            "codeLanguage",
            showCodeEditor ? codeLanguage : ""
        );

        const existingImages = attachments
            .filter(
                (attachment) =>
                    attachment.type === "image" &&
                    attachment.isExisting
            )
            .map((attachment) => ({
                _id: attachment.id,
                url: attachment.previewUrl,
                filename: attachment.file.name,
            }));

        formData.append(
            "existingImages",
            JSON.stringify(existingImages)
        );

        attachments
            .filter(
                (attachment) =>
                    attachment.type === "image" &&
                    !attachment.isExisting
            )
            .forEach((attachment) => {
                formData.append("postImages", attachment.file);
            });

        setIsPublishing(true);

        try {

            const postResult = await callApi(`${API_URL}/api/post/`, "POST", formData, token);

            if (postResult?.status) {
                const updatedPost = postResult.data;
                console.log(updatedPost);
                
                if (postToEdit?._id) {
                    setPost((previousPosts) =>
                        previousPosts.map((post) =>
                            post._id === postToEdit._id
                                ? { ...post, ...updatedPost }
                                : post
                        )
                    );
                } else {
                    setPost((previousPosts) => [
                        updatedPost,
                        ...previousPosts,
                    ]);
                }

                onClose();
            }
        }

        catch (error) {
            setError(error || "something went wrong")
        }

        finally {
            setIsPublishing(false);
        }

    };

    const canPublish =
        Boolean(postText.trim()) ||
        attachments.length > 0 ||
        Boolean(showCodeEditor && code.trim());

    if (error) return <ResponsePopup message={error} closePopup={() => setError(error)} />

    console.log(tags, "tags");

    return (
        <section className="community-composer">
            <form onSubmit={handlePublish}>
                {/* Composer header */}
                <div className="composer-header">
                    <div className="composer-user">
                        <div className="composer-user-container">
                            <div className="composer-user-avatar">
                                {user?.data?.profileImage ? (
                                    <img
                                        src={user.data.profileImage}
                                        alt={`${user?.data?.firstName || ""} ${user?.data?.lastName || ""
                                            }`}
                                        className="composer-avatar-img"
                                    />
                                ) : (
                                    <span className="composer-avatar-initials">
                                        {user?.data?.firstName?.[0] || ""}
                                        {user?.data?.lastName?.[0] || ""}
                                    </span>
                                )}
                            </div>

                            <div className="composer-user-info">
                                <h2>
                                    {user?.data?.firstName} {user?.data?.lastName}
                                </h2>
                                <p>Share with the DevSphere community</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="composer-close-btn"
                        aria-label="Close composer"
                        onClick={onClose}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Post type */}

                {/* Post type */}
                <div className="composer-post-type">
                    <label className="composer-post-type-label" style={{ paddingTop: "10px" }}>
                        What are you posting?
                    </label>

                    <div className="composer-post-type-options">
                        <button
                            type="button"
                            className={`composer-post-type-card ${postType === "Discussion" ? "active" : ""
                                }`}
                            aria-pressed={postType === "Discussion"}
                            onClick={() => setPostType("Discussion")}
                        >
                            <i className="fa-regular fa-comments" />
                            <span>Discussion</span>
                        </button>

                        <button
                            type="button"
                            className={`composer-post-type-card ${postType === "Projects" ? "active" : ""
                                }`}
                            aria-pressed={postType === "Projects"}
                            onClick={() => setPostType("Projects")}
                        >
                            <i className="fa-regular fa-images" />
                            <span>Project Showcase</span>
                        </button>

                        <button
                            type="button"
                            className={`composer-post-type-card ${postType === "Learning" ? "active" : ""
                                }`}
                            aria-pressed={postType === "Learning"}
                            onClick={() => setPostType("Learning")}
                        >
                            <i className="fa-solid fa-graduation-cap" />
                            <span>Learning Update</span>
                        </button>
                    </div>
                </div>

                {/* File selection errors */}
                {fileError && (
                    <div className="composer-file-error" role="alert">
                        <i className="fa-solid fa-triangle-exclamation" />
                        <span>{fileError}</span>
                    </div>
                )}

                {/* Image and video attachments */}
                {attachments.length > 0 && (
                    <div className="composer-attachments">
                        {attachments.map((attachment) => (
                            <div
                                className="composer-attachment-frame"
                                key={attachment.id}
                            >
                                {attachment.type === "image" ? (
                                    <ImageAttachment
                                        attachment={attachment}
                                        onRemove={removeAttachment}
                                        onError={handleAttachmentError}
                                    />
                                ) : (
                                    null
                                    //   <VideoAttachment
                                    //     attachment={attachment}
                                    //     onRemove={removeAttachment}
                                    //     onError={handleAttachmentError}
                                    //   />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Code attachment */}
                {showCodeEditor && (
                    <div className="composer-code-frame">
                        <div className="composer-code-header">
                            <span>
                                <i className="fa-solid fa-code" />
                                Code snippet
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCodeEditor(false);
                                    setCode("");
                                    setCodeLanguage("javascript");
                                }}
                                aria-label="Remove code block"
                                title="Remove code block"
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <CodeSnippetEditor
                            code={code}
                            language={codeLanguage}
                            onCodeChange={setCode}
                            onLanguageChange={setCodeLanguage}
                        />
                    </div>
                )}

                {/* Main text area */}
                <div className="composer-text-area">
                    <textarea
                        value={postText}
                        onChange={(event) => setPostText(event.target.value)}
                        placeholder="Write a post..."
                        aria-label="Write a community post"
                        rows={5}
                    />
                </div>

                {/* Technology tags */}
                <div className="composer-tags-area">
                    {tags.length > 0 && (
                        <div className="composer-selected-tags">
                            {tags.map((tag) => (
                                <span className="composer-tag" key={tag.tagId}>
                                    #{tag.tagValue}

                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag.tagId)}
                                        aria-label={`Remove ${tag.tagValue} tag`}
                                    >
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="composer-tag-form">
                        <i className="fa-solid fa-hashtag" />

                        <input
                            value={tagInput}
                            onChange={(event) => setTagInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    addTag();
                                }
                            }}
                            placeholder="Add a technology tag..."
                            aria-label="Technology tag"
                        />

                        <button type="button" onClick={addTag}>
                            Add
                        </button>
                    </div>
                </div>

                {/* Attachment toolbar */}
                <div className="composer-toolbar">
                    <span className="composer-toolbar-label">
                        Add to your post
                    </span>

                    <div className="composer-toolbar-actions">
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <i className="fa-regular fa-image composer-icon-image" />
                            <span>Photo</span>
                        </button>

                        {/* <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
            >
              <i className="fa-solid fa-video composer-icon-video" />
              <span>Video</span>
            </button> */}

                        <button
                            type="button"
                            onClick={() => setShowCodeEditor((previous) => !previous)}
                        >
                            <i className="fa-solid fa-code composer-icon-code" />
                            <span>Code</span>
                        </button>

                        {/* <button
              type="button"
              onClick={() =>
                setPostType((previous) =>
                  previous === "Question" ? "Discussion" : "Question"
                )
              }
            >
              <i className="fa-solid fa-circle-question composer-icon-question" />
              <span>Question</span>
            </button> */}
                    </div>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    hidden
                    onChange={(event) => addFiles(event, "image")}
                />

                {/* <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(event) => addFiles(event, "video")}
        /> */}

                {/* Footer */}
                <div className="composer-footer">
                    <p>
                        <i className="fa-solid fa-lightbulb" />
                        Share knowledge. Help other developers grow.
                    </p>

                    <ButtonLoader
                        type="submit"
                        loading={isPublishing}
                        loadingText="Publishing..."
                        disabled={!canPublish || Object.keys(attachmentErrors).length > 0}
                        className="community-publish-button"
                    >
                        Publish Post
                    </ButtonLoader>
                </div>
            </form>
        </section>
    );
}

export default CommunityComposer;