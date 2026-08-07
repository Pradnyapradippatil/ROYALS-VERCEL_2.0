/**
 * Restores navigation UI state after browser back/forward and DSN AJAX moves.
 * It intentionally preserves sessionStorage and the browser back/forward cache.
 */
(function (window, document) {
    "use strict";

    let closeTimer = null;

    function finishCleanup() {
        const body = document.body;
        const icon = document.querySelector(".site-header .menu-icon");

        body?.classList.remove("locked-scroll", "dsn-show-contact");
        icon?.setAttribute("aria-expanded", "false");

        if (!icon?.classList.contains("nav-active")) {
            document
                .querySelectorAll(".site-header .icon-top, .site-header .icon-center, .site-header .icon-bottom")
                .forEach(function (line) {
                    line.style.removeProperty("display");
                });
        }
    }

    function restoreNavigationState() {
        const icon = document.querySelector(".site-header .menu-icon");

        window.clearTimeout(closeTimer);

        if (icon?.classList.contains("nav-active")) {
            icon.dispatchEvent(
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                })
            );
            closeTimer = window.setTimeout(finishCleanup, 650);
            return;
        }

        finishCleanup();
    }

    window.addEventListener("pageshow", restoreNavigationState);
    window.addEventListener("popstate", restoreNavigationState);
    document.addEventListener("dsnAjaxComplete", function () {
        window.setTimeout(restoreNavigationState, 50);
    });
})(window, document);
