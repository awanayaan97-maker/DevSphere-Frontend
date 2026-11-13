

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useCallApi from "./useCallApi";
import useLoginChecker from "./useLoginChecker";
import { updateItemLike } from "../utils/updateLike";

export function useLikeToggle() {

    const queryClient = useQueryClient();
    const { callApi } = useCallApi();
    const { isLoggedIn } = useLoginChecker();
    const token = localStorage.getItem("token");
    const [showLikeAlert, setShowLikeAlert] = useState(false);

    const mutation = useMutation({

        mutationFn: async ({ url }) => {
            const result = await callApi(url, "PATCH", {}, token);
            if (!result?.status) throw new Error(result?.message || "Like failed");
            return result.data;
        },

        onMutate: async ({ queryKey, itemId }) => {
            if (!isLoggedIn) {
                setShowLikeAlert(true);
                throw new Error("UNAUTHENTICATED");
            }

            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (oldData) => {

                if (!oldData) return oldData;
                if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) =>
                            page.map((item) => updateItemLike(item, itemId))
                        ),
                    };
                }

                if (Array.isArray(oldData)) {
                    return oldData.map((item) => updateItemLike(item, itemId));
                }

                if (typeof oldData === "object") {

                    if (oldData._id === itemId) {
                        return updateItemLike(oldData, itemId);
                    }

                    if (oldData.data && oldData.data._id === itemId) {
                        return {
                            ...oldData,
                            data: updateItemLike(oldData.data, itemId),
                        };
                    }
                }

                return oldData;
            });

            return { previousData, queryKey };
        },

        onError: (err, context) => {
            if (err.message === "UNAUTHENTICATED") return;

            if (context?.previousData && context?.queryKey) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },

        onSettled: (context) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({ queryKey: context.queryKey });
            }
        },
    });

    return {
        toggleLikeMutation: mutation,
        showLikeAlert,
        setShowLikeAlert,
    };
}

