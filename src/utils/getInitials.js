
export function getInitials(userData) {

    const firstName = userData?.firstName || "";
    const lastName = userData?.lastName || "";
    const initials = `${firstName} ${lastName}`.trim()
    return initials || "U";
}