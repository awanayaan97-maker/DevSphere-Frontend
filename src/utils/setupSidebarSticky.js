export function setupSidebarSticky() {
    const TOP_GAP = 85;
    const BOTTOM_GAP = 24;

    function update() {
        const sidebar = document.querySelector(".article-read-sidebar");
        if (!sidebar) return;

        if (window.innerWidth <= 850) {
            sidebar.style.removeProperty("--sidebar-top");
            return;
        }

        const top = Math.min(
            TOP_GAP,
            window.innerHeight - sidebar.offsetHeight - BOTTOM_GAP
        );
        sidebar.style.setProperty("--sidebar-top", top + "px");
    }

    update();
    window.addEventListener("resize", update);

    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup: page se nikalte waqt sab band kar do
    return () => {
        window.removeEventListener("resize", update);
        observer.disconnect();
    };
}