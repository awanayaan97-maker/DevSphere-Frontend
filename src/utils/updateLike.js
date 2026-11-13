

export function updateItemLike(item, itemId) {
    if (item._id === itemId) {
        const nextIsLiked = !item.isLiked;
        return {
            ...item,
            isLiked: nextIsLiked,
            likesCount: nextIsLiked
                ? item.likesCount + 1
                : Math.max(0, item.likesCount - 1),
        };
    }
    return item;
}