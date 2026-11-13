
import { useState, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCallApi from "./useCallApi";
import useApiQuery from "./useApiQuery";
import { AuthContext } from "../Context/AuthContext";

function useComments(id, type) {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const { user } = useContext(AuthContext);
    const { callApi } = useCallApi();
    const queryClient = useQueryClient();
    const url = `${API_URL}/api/${type}/comment/${id}`

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const commentsQueryKey = [url, token ? token.slice(-10) : "guest"];

    const { data: comments = [], isLoading: commentsLoading } = useApiQuery({
        url,
        type: "GET",
        enabled: Boolean(commentsOpen && url)
    });

    const handleAddComment = async () => {

        if (!commentText?.trim()) return;

        // --- EDIT MODE ---
        if (editingCommentId !== null) {
            const currentEditingId = editingCommentId;
            const currentText = commentText;
            const previousComments = queryClient.getQueryData(commentsQueryKey);

            queryClient.setQueryData(commentsQueryKey, (old = []) =>
                old.map((c) => (c._id === currentEditingId ? { ...c, text: currentText } : c))
            );

            setCommentText("");
            setEditingCommentId(null);

            try {

                const result = await callApi(
                    `${API_URL}/api/${type}/comment/${editingCommentId}`,
                    "PATCH",
                    { text: currentText },
                    token
                );

                if (!result?.status) {
                    queryClient.setQueryData(commentsQueryKey, previousComments);
                }
            } catch (error) {
                console.error("Failed to update comment:", error);
                queryClient.setQueryData(commentsQueryKey, previousComments);
            }
            return;
        }

        // --- ADD NEW COMMENT MODE ---
        const tempId = `temp-${Date.now()}`;
        const textToSubmit = commentText;
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
            text: textToSubmit,
            hasLikeComment: false,
            commentLikes: 0,
            replies: [],
        };

        queryClient.setQueryData(commentsQueryKey, (old = []) => [...old, newCommentData]);
        setCommentText("");

        try {

            const result = await callApi(url, "POST", { text: textToSubmit }, token);

            if (result?.status && result?.data) {
                queryClient.setQueryData(commentsQueryKey, (old = []) =>
                    old.map((c) => (c._id === tempId ? result.data : c))
                );
            }

            else {
                queryClient.setQueryData(commentsQueryKey, (old = []) =>
                    old.filter((c) => c._id !== tempId)
                );
            }
        }

        catch (error) {
            console.error("Failed to add comment:", error);
            queryClient.setQueryData(commentsQueryKey, (old = []) =>
                old.filter((c) => c._id !== tempId)
            );
        }
    };

    const handleDeleteComment = async (commentId) => {

        const previousComments = queryClient.getQueryData(commentsQueryKey);

        queryClient.setQueryData(commentsQueryKey, (old = []) =>
            old.filter((c) => c._id !== commentId)
        );

        try {
            const result = await callApi(
                `${API_URL}/api/${type}/comment/${commentId}`,
                "DELETE",
                null,
                token
            );
            if (!result?.status) {
                queryClient.setQueryData(commentsQueryKey, previousComments);
            }
        } catch (error) {
            queryClient.setQueryData(commentsQueryKey, previousComments);
        }
    };

    const toggleComments = () => setCommentsOpen((prev) => !prev);

    return {
        commentsOpen,
        setCommentsOpen,
        toggleComments,
        comments,
        commentsQueryKey,
        commentsLoading,
        commentText,
        setCommentText,
        editingCommentId,
        setEditingCommentId,
        handleAddComment,
        handleDeleteComment,
        commentsLoading
    };
}

export default useComments;
