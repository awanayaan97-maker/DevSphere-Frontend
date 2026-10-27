
export function getInitials(userData) {

    const firstName = userData?.firstName || userData?.firstname || "";
    const lastName = userData?.lastName || userData?.lastname || "";

    const initials = `${firstName} ${lastName}`.trim()

    return initials || "U";
}