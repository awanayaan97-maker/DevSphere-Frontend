

import useCallApi from "./useCallApi";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useLoginChecker from "./useLoginChecker";
import { useState } from "react";
import { updateItemBookmark } from "../utils/updateBookmark";

export function useBookmarkToggle() {

    const token = localStorage.getItem("token");
    const { callApi } = useCallApi();
    const queryClient = useQueryClient();
    const { isLoggedIn } = useLoginChecker();
    const [bookmarkAlert, setBookmarkAlert] = useState(false);

    const mutation = useMutation({

        mutationFn: async ({ url }) => {
            const result = await callApi(url, "POST", [], token);
            if (!result.status) throw new Error(result?.message || "bookmark failed");
            return result.data;
        },

        onMutate: async ({ queryKey, itemId }) => {
            if (!isLoggedIn) {
                setBookmarkAlert(true);
                throw new Error("UNAUTHENTICATED");
            }

            await queryClient.cancelQueries({ queryKey });
            const previousQueries = queryClient.getQueriesData({ queryKey });

            queryClient.setQueriesData({ queryKey }, (oldData) => {

                if (!oldData) return oldData;
                if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) =>
                            page.map((item) => updateItemBookmark(item, itemId))
                        )
                    };
                }

                if (Array.isArray(oldData)) {
                    return oldData.map((item) => updateItemBookmark(item, itemId));
                }

                if (typeof oldData === "object") {
                    if (oldData._id === itemId) {
                        return updateItemBookmark(oldData, itemId);
                    }

                    if (oldData.data && oldData.data._id === itemId) {
                        return {
                            ...oldData,
                            data: updateItemBookmark(oldData.data, itemId),
                        };
                    }
                }

                return oldData;
            });

            return { previousQueries, queryKey };
        },

        onError: (err, _variables, context) => {
            if (err.message === "UNAUTHENTICATED") return;
            if (context?.previousQueries) {
                context.previousQueries.forEach(([exactKey, oldData]) => {
                    queryClient.setQueryData(exactKey, oldData);
                });
            }
        },

        onSettled: (_data, _err, variables, context) => {
            const keyToInvalidate = context?.queryKey || variables?.queryKey;
            if (keyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: keyToInvalidate });
            }
        }

    });

    return {
        toggleBookmarkMutation: mutation,
        bookmarkAlert,
        setBookmarkAlert
    };
}