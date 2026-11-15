
export function updateItemBookmark(item, itemId) {

    if (item._id === itemId) {
        const nextIsBookmarked = !item.isBookmark
        return {
            ...item,
            isBookmark: nextIsBookmarked,
            bookmarksCount: nextIsBookmarked
                ? item.bookmarksCount + 1
                : Math.max(0, item.bookmarksCount - 1)
        }
    }

    return item
}