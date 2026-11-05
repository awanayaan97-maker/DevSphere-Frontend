
import { useState, useEffect, useContext } from "react";
import useCallApi from "./useCallApi";
import { AuthContext } from "../Context/AuthContext";

function useComments(id) {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(false)

    useEffect(() => {
        if (!commentsOpen || comments !== null) return;

        async function fetchComments() {
            setCommentsLoading(true)

            try {
                const result = await callApi(
                    `${API_URL}/api/article/comment/${id}`,
                    "GET",
                    [],
                    token
                );

                if (result?.status) {
                    setComments(result.data || []);
                }
            } 
            
            catch (error) {
                console.error("Failed to fetch comments:", error);
                setComments([]);
            } 

            finally{
                setCommentsLoading(false)
            }
        }

        fetchComments();
    }, [commentsOpen, id]);

    const handleAddComment = async () => {

        if (!commentText?.trim()) return;

        if (editingCommentId !== null) {
            const oldText = comments.find((c) => c._id === editingCommentId)?.text;
            setComments((prev) =>
                prev.map((c) => (c._id === editingCommentId ? { ...c, text: commentText } : c))
            );

            setCommentText("");
            setEditingCommentId(null);

            try {
                const result = await callApi(
                    `${API_URL}/api/article/comment/${editingCommentId}`,
                    "PATCH",
                    { text: commentText },
                    token
                );

                if (!result?.status) {
                    setComments((prev) =>
                        prev.map((c) => (c._id === editingCommentId ? { ...c, text: oldText } : c))
                    );
                }
            } 
            catch (error) {
                console.error("Failed to update comment:", error);
                setComments((prev) =>
                    prev.map((c) => (c._id === editingCommentId ? { ...c, text: oldText } : c))
                );
            }
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const newCommentData = {
            authorData: {
                _id: user?._id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                role: user?.role,
                profileImage: user?.profileImage,
            },
            _id: tempId,
            articleId: id,
            text: commentText,
            hasLikeComment: false,
            commentLikes: 0,
            replies: [],
        };

        setComments((prev) => (prev === null ? [newCommentData] : [...prev, newCommentData]));
        setCommentText("");

        try {
            const result = await callApi(
                `${API_URL}/api/article/comment/${id}`,
                "POST",
                { text: commentText },
                token
            );

            if (result?.status && result?.data) {
                setComments((prev) => prev.map((c) => (c._id === tempId ? result.data : c)));
            } else {
                setComments((prev) => prev.filter((c) => c._id !== tempId));
            }
        } 
        catch (error) {
            console.error("Failed to add comment:", error);
            setComments((prev) => prev.filter((c) => c._id !== tempId));
        }
    };

    const handleDeleteComment = async (commentId) => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        const result = await callApi(`${API_URL}/api/article/comment/${commentId}`, "DELETE", null, token);
    }

    const toggleComments = () => {
        setCommentsOpen((prev) => !prev);
    };

    return {
        commentsOpen,
        setCommentsOpen,
        toggleComments,
        comments,
        setComments,
        commentsLoading,
        commentText,
        setCommentText,
        editingCommentId,
        setEditingCommentId,
        handleAddComment,
        handleDeleteComment
    };
}

export default useComments