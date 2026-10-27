
import { formatDistanceToNowStrict } from "date-fns";

export function shortTimeAgo(date) {

    if (date) {

        const result = formatDistanceToNowStrict(new Date(date), { addSuffix: false });

        return result
            .replace(" seconds", "s")
            .replace(" second", "s")
            .replace(" minutes", "m")
            .replace(" minute", "m")
            .replace(" hours", "h")
            .replace(" hour", "h")
            .replace(" days", "d")
            .replace(" day", "d")
            .replace(" months", "mo")
            .replace(" month", "mo")
            .replace(" years", "y")
            .replace(" year", "y");

    }
}































 