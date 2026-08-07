(function () {
    "use strict";

    const pageKey =
        "scroll-position:" +
        window.location.pathname +
        window.location.search;

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    function getSmoothScrollbar() {
        const container = document.querySelector("#dsn-scrollbar");

        if (
            container &&
            window.Scrollbar &&
            typeof window.Scrollbar.get === "function"
        ) {
            return window.Scrollbar.get(container);
        }

        return null;
    }

    function getScrollPosition() {
        const smoothScrollbar = getSmoothScrollbar();

        if (
            smoothScrollbar &&
            smoothScrollbar.offset &&
            typeof smoothScrollbar.offset.y === "number"
        ) {
            return smoothScrollbar.offset.y;
        }

        const container = document.querySelector("#dsn-scrollbar");

        if (container && container.scrollTop > 0) {
            return container.scrollTop;
        }

        return window.scrollY || window.pageYOffset || 0;
    }

    function saveScrollPosition() {
        const position = getScrollPosition();

        try {
            sessionStorage.setItem(pageKey, String(position));
        } catch (error) {
            // Storage may be unavailable in strict privacy modes.
        }
    }

    function setScrollPosition(position) {
        const smoothScrollbar = getSmoothScrollbar();
        const container = document.querySelector("#dsn-scrollbar");

        if (
            smoothScrollbar &&
            typeof smoothScrollbar.setPosition === "function"
        ) {
            smoothScrollbar.setPosition(0, position);
        }

        if (container) {
            container.scrollTop = position;
        }

        window.scrollTo(0, position);
    }

    function restoreScrollPosition() {
        let savedPosition = null;

        try {
            savedPosition = sessionStorage.getItem(pageKey);
        } catch (error) {
            return;
        }

        if (savedPosition === null) {
            return;
        }

        const position = Number(savedPosition);

        if (!Number.isFinite(position)) {
            return;
        }

        let attempts = 0;

        const restoreTimer = setInterval(function () {
            attempts++;

            setScrollPosition(position);

            const currentPosition = getScrollPosition();

            if (
                Math.abs(currentPosition - position) < 10 ||
                attempts >= 30
            ) {
                clearInterval(restoreTimer);
            }
        }, 150);
    }

    window.addEventListener("pagehide", saveScrollPosition);

    window.addEventListener("beforeunload", saveScrollPosition);

    document.addEventListener(
        "click",
        function (event) {
            const link = event.target.closest("a");

            if (!link) {
                return;
            }

            const href = link.getAttribute("href");

            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("javascript:") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                link.target === "_blank"
            ) {
                return;
            }

            saveScrollPosition();
        },
        true
    );

    window.addEventListener("pageshow", function (event) {
        const navigationEntry =
            performance.getEntriesByType("navigation")[0];

        const isBackForward =
            event.persisted ||
            (navigationEntry &&
                navigationEntry.type === "back_forward");

        if (!isBackForward) {
            return;
        }

        setTimeout(restoreScrollPosition, 200);
        setTimeout(restoreScrollPosition, 800);
        setTimeout(restoreScrollPosition, 1500);
    });

    window.addEventListener("popstate", function () {
        setTimeout(restoreScrollPosition, 300);
    });

    document.addEventListener("dsnAjaxComplete", function () {
        setTimeout(restoreScrollPosition, 500);
        setTimeout(restoreScrollPosition, 1200);
    });
})();
