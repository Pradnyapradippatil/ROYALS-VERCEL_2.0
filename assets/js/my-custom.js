/* =========================================================
   MOBILE NATIVE SCROLL FIX
========================================================= */

(function () {
    const mobileQuery = window.matchMedia(
    "(max-width: 991px)"
    );

    function enableNativeMobileScroll() {
        if (!mobileQuery.matches) return;

        const html = document.documentElement;
        const body = document.body;
        const scrollContainer = document.getElementById("dsn-scrollbar");

        body.classList.remove("dsn-effect-scroll", "dsn-scroll-active", "locked-scroll");
        body.classList.add("dsn-mobile", "rwt-native-mobile-scroll");

        try {
            if (window.Scrollbar && scrollContainer) {
                const instance = window.Scrollbar.get(scrollContainer);
                if (instance) instance.destroy();
            }
        } catch (error) {
            console.warn("Native mobile scroll fallback:", error);
        }

        html.style.overflowX = "hidden";
        html.style.overflowY = "auto";
        html.style.height = "auto";
        html.style.touchAction = "pan-y";

        body.style.overflowX = "hidden";
        body.style.overflowY = "auto";
        body.style.height = "auto";
        body.style.touchAction = "pan-y";

        if (scrollContainer) {
            scrollContainer.style.overflow = "visible";
            scrollContainer.style.height = "auto";
            scrollContainer.style.maxHeight = "none";
            scrollContainer.style.transform = "none";
            scrollContainer.style.touchAction = "pan-y";
        }

        document.querySelectorAll("#dsn-scrollbar .scroll-content").forEach(function (element) {
            element.style.transform = "none";
            element.style.overflow = "visible";
            element.style.height = "auto";
            element.style.touchAction = "pan-y";
        });

        document.querySelectorAll("#dsn-scrollbar .scrollbar-track").forEach(function (track) {
            track.style.display = "none";
        });
    }

    document.addEventListener("DOMContentLoaded", enableNativeMobileScroll);
    window.addEventListener("load", function () {
        enableNativeMobileScroll();
        setTimeout(enableNativeMobileScroll, 500);
        setTimeout(enableNativeMobileScroll, 2000);
    });

    /*
       DSN desktop scrolling is initialized only during page load.
       The mobile branch destroys that instance, so crossing the 991px
       breakpoint without a fresh initialization breaks the layout.
       Reload only when the responsive mode actually changes.
    */
    let lastResponsiveMode = mobileQuery.matches ? "mobile" : "desktop";
    let responsiveReloadTimer = null;

    function handleResponsiveModeChange() {
        const currentMode = mobileQuery.matches ? "mobile" : "desktop";

        if (currentMode === lastResponsiveMode) {
            if (currentMode === "mobile") enableNativeMobileScroll();
            return;
        }

        lastResponsiveMode = currentMode;
        clearTimeout(responsiveReloadTimer);
        responsiveReloadTimer = setTimeout(function () {
            window.location.reload();
        }, 180);
    }

    window.addEventListener("resize", handleResponsiveModeChange, { passive: true });
    window.addEventListener("orientationchange", handleResponsiveModeChange, { passive: true });
    document.addEventListener("dsnAjaxComplete", enableNativeMobileScroll);
})();


/* =========================================================
   HERO SLIDER
========================================================= */

window.addEventListener("load", function () {
    setTimeout(function () {
        const slider = document.querySelector(".main-slider .swiper-container");

        if (!slider || !slider.swiper) return;

        const swiper = slider.swiper;
        const isMobile = window.matchMedia(
            "(max-width: 991px)"
        ).matches;

        if (swiper.autoplay) {
            swiper.autoplay.stop();
        }

        if (isMobile) {
            swiper.allowTouchMove = false;

            if (swiper.params) {
                swiper.params.allowTouchMove = false;
                swiper.params.touchStartPreventDefault = false;
                swiper.params.touchMoveStopPropagation = false;
                swiper.params.simulateTouch = false;
            }

            slider.style.touchAction = "pan-y";
            slider.querySelectorAll(".swiper-wrapper, .swiper-slide").forEach(function (element) {
                element.style.touchAction = "pan-y";
            });
        }

        window.rwtStartHeroSliderTimer = function (sliderInstance) {
            if (window.rwtHeroSliderTimer) {
                clearInterval(window.rwtHeroSliderTimer);
            }

            window.rwtHeroSliderTimer = setInterval(function () {
                if (!sliderInstance || sliderInstance.destroyed) return;

                if (sliderInstance.isEnd || sliderInstance.activeIndex >= sliderInstance.slides.length - 1) {
                    sliderInstance.slideTo(0, 500);
                } else {
                    sliderInstance.slideNext(500);
                }
            }, 4000);
        };

        window.rwtStartHeroSliderTimer(swiper);
    }, 3000);
});


/* =========================================================
   STATS COUNTER
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const counters = document.querySelectorAll(".rwt-counter");
    const section = document.querySelector(".rwt-stats-section");

    if (!section || !counters.length) return;

    let started = false;

    function startCounter() {

        if (started) return;
        started = true;

        counters.forEach(counter => {

            const target = parseInt(counter.dataset.target);
            let current = 0;

            const step = Math.max(1, target / 50);

            function update() {

                current += step;

                if (current >= target) {
                    counter.textContent = target;
                    return;
                }

                counter.textContent = Math.floor(current);

                requestAnimationFrame(update);

            }

            update();

        });

    }

    const observer = new IntersectionObserver(function(entries){

        entries.forEach(function(entry){

            if(entry.isIntersecting){

                startCounter();
                observer.disconnect();

            }

        });

    },{

        threshold:0.3

    });

    observer.observe(section);

});


/* =========================================================
   CONTACT PANEL
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const item = document.querySelector(".rwt-contact-nav-item");
    const preview = document.querySelector(".rwt-contact-preview");
    const link = document.querySelector(".rwt-contact-nav-link");
    const close = document.querySelector(".rwt-contact-preview-close");

    let timer;

    function openPanel() {

        clearTimeout(timer);

        item?.classList.add("rwt-contact-active");

        preview?.setAttribute("aria-hidden","false");

    }

    function closePanel(delay=250){

        clearTimeout(timer);

        timer=setTimeout(function(){

            item?.classList.remove("rwt-contact-active");

            preview?.setAttribute("aria-hidden","true");

        },delay);

    }

    item?.addEventListener("mouseenter",openPanel);
    item?.addEventListener("mouseleave",()=>closePanel(300));

    preview?.addEventListener("mouseenter",openPanel);
    preview?.addEventListener("mouseleave",()=>closePanel(300));

   link?.addEventListener("click", function (e) {

    // Mobile & Tablet -> Contact page open
    if (window.innerWidth <= 991) {
        return;
    }

    // Desktop -> Prevent navigation and open preview
    e.preventDefault();

    if (item.classList.contains("rwt-contact-active")) {
        closePanel();
    } else {
        openPanel();
    }
});

    close?.addEventListener("click",function(e){

        e.preventDefault();
        closePanel(0);

    });

});


/* =========================================================
   QUICK ENQUIRY MODAL
========================================================= */

document.addEventListener("DOMContentLoaded",function(){

    const modal=document.getElementById("rwtEnquiryModal");

    if(!modal) return;

    const overlay=modal.querySelector(".rwt-enquiry-overlay");
    const close=modal.querySelector(".rwt-enquiry-close");

    function openModal(){

        modal.classList.add("rwt-modal-active");
        document.body.classList.add("rwt-modal-open");

    }

    function closeModal(){

        modal.classList.remove("rwt-modal-active");
        document.body.classList.remove("rwt-modal-open");

    }

    document.addEventListener("click",function(e){

        const btn=e.target.closest(".rwt-open-enquiry");

        if(btn){

            e.preventDefault();
            openModal();

        }

    });

    close?.addEventListener("click",closeModal);
    overlay?.addEventListener("click",closeModal);

    document.addEventListener("keydown",function(e){

        if(e.key==="Escape"){

            closeModal();

        }

    });

});



// TECHNOLOGY

function initTechnologyMarquee() {
    const tracks = document.querySelectorAll(".rwt-tech-track");

    tracks.forEach((track) => {
        const originalGroup = track.querySelector(".rwt-tech-group");

        if (!originalGroup) return;

        const clonedGroups = track.querySelectorAll(
            '.rwt-tech-group[aria-hidden="true"]'
        );

        clonedGroups.forEach((group) => group.remove());

        const duplicateGroup = originalGroup.cloneNode(true);

        duplicateGroup.setAttribute("aria-hidden", "true");

        track.appendChild(duplicateGroup);

        track.style.animation = "none";

        void track.offsetWidth;

        track.style.animation = "";
    });
}

document.addEventListener("DOMContentLoaded", initTechnologyMarquee);

window.addEventListener("load", initTechnologyMarquee);

document.addEventListener("dsnAjaxComplete", initTechnologyMarquee);



//  MANY MORE Service Card



document.addEventListener("DOMContentLoaded", function () {
    const openClients = document.getElementById("openClients");
    const clientsModal = document.getElementById("clientsModal");
    const closeClients = document.getElementById("closeClients");

    if (!openClients || !clientsModal || !closeClients) {
        return;
    }

    function openClientsModal() {
        clientsModal.classList.add("show");
        document.body.classList.add("rwt-modal-open");
    }

    function closeClientsModal() {
        clientsModal.classList.remove("show");
        document.body.classList.remove("rwt-modal-open");
    }

    openClients.addEventListener("click", openClientsModal);

    closeClients.addEventListener("click", closeClientsModal);

    clientsModal.addEventListener("click", function (event) {
        if (event.target === clientsModal) {
            closeClientsModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            clientsModal.classList.contains("show")
        ) {
            closeClientsModal();
        }
    });
});




/* =========================================================
   GLOBAL MODAL SCROLL SAFETY
========================================================= */

(function () {
    "use strict";

    function hasVisibleModal() {
        const enquiryModal =
            document.querySelector(
                ".rwt-enquiry-modal.rwt-modal-active"
            );

        const clientsModal =
            document.querySelector(
                ".rwt-clients-modal.show"
            );

        return Boolean(
            enquiryModal || clientsModal
        );
    }

    function restorePageScroll() {
        if (!hasVisibleModal()) {
            document.body.classList.remove(
                "rwt-modal-open"
            );

            document.documentElement.style.removeProperty(
                "overflow"
            );

            document.body.style.removeProperty(
                "overflow"
            );
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        restorePageScroll
    );

    window.addEventListener(
        "pageshow",
        restorePageScroll
    );

    window.addEventListener(
        "load",
        restorePageScroll
    );

    document.addEventListener(
        "dsnAjaxComplete",
        restorePageScroll
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Escape") {
                window.setTimeout(
                    restorePageScroll,
                    50
                );
            }
        }
    );

    document.addEventListener(
        "click",
        function () {
            window.setTimeout(
                restorePageScroll,
                350
            );
        }
    );
})();


// hide scroll
document.addEventListener("DOMContentLoaded", function () {
    document
        .querySelectorAll(
            "#dsn-scrollbar .scrollbar-track, " +
            "#dsn-scrollbar .scrollbar-thumb, " +
            ".scrollbar-track, .scrollbar-thumb"
        )
        .forEach(function (element) {
            element.style.setProperty(
                "display",
                "none",
                "important"
            );
        });
});






/* =========================================================
   ROYALS WEBTECH BACKEND FORM INTEGRATION
========================================================= */
(function () {
    "use strict";

    function apiUrl(endpointName, fallbackPath) {
        if (typeof window.rwtApiUrl === "function") {
            return window.rwtApiUrl(endpointName);
        }

        return new URL(fallbackPath, window.location.origin).toString();
    }

    async function submitContactPayload(payload) {
        const response = await fetch(apiUrl("contact", "/api/contact"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(function () { return {}; });
        if (!response.ok || result.success === false) {
            const unavailable = response.status === 404 || response.status === 501;
            throw new Error(
                result.message ||
                (unavailable
                    ? "Enquiry service is not configured yet. Please contact us by phone or email."
                    : "Enquiry submission failed.")
            );
        }
        return result;
    }

    function setButtonLoading(button, loading, loadingText) {
        if (!button) return;
        if (loading) {
            button.dataset.originalHtml = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span>' + loadingText + '</span><i class="fas fa-spinner fa-spin"></i>';
        } else {
            button.disabled = false;
            if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
        }
    }

    function initContactPageForm() {
        const form = document.getElementById("rwtContactPageForm");
        if (!form || form.dataset.backendReady === "1") return;
        form.dataset.backendReady = "1";

        const status = document.getElementById("rwtContactPageStatus");
        const button = form.querySelector('button[type="submit"]');

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (status) status.textContent = "Submitting your enquiry...";
            setButtonLoading(button, true, "Submitting...");

            try {
                const result = await submitContactPayload({
                    name: document.getElementById("contactName").value.trim(),
                    email: document.getElementById("contactEmail").value.trim(),
                    phone: document.getElementById("contactPhone").value.trim(),
                    company: document.getElementById("contactCompany").value.trim(),
                    service: document.getElementById("contactService").value,
                    message: document.getElementById("contactMessage").value.trim(),
                    sourcePage: window.location.href
                });
                if (status) status.textContent = result.message || "Enquiry submitted successfully.";
                form.reset();
            } catch (error) {
                console.error("Contact form submission error:", error);
                if (status) status.textContent = error.message || "Unable to submit enquiry. Please try again.";
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    function initQuickEnquiryForm() {
        const form = document.getElementById("rwtEnquiryForm");
        if (!form || form.dataset.backendReady === "1") return;
        form.dataset.backendReady = "1";

        const status = document.getElementById("rwtFormMessage");
        const button = form.querySelector('button[type="submit"]');

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (status) status.textContent = "Submitting your enquiry...";
            setButtonLoading(button, true, "Submitting...");

            try {
                const data = new FormData(form);
                const result = await submitContactPayload({
                    name: String(data.get("name") || "").trim(),
                    email: String(data.get("email") || "").trim(),
                    phone: String(data.get("phone") || "").trim(),
                    company: "",
                    service: String(data.get("service") || "").trim(),
                    message: String(data.get("message") || "").trim(),
                    sourcePage: window.location.href
                });
                if (status) status.textContent = result.message || "Enquiry submitted successfully.";
                form.reset();
            } catch (error) {
                console.error("Quick enquiry submission error:", error);
                if (status) status.textContent = error.message || "Unable to submit enquiry. Please try again.";
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    function initBackendForms() {
        initContactPageForm();
        initQuickEnquiryForm();
    }

    document.addEventListener("DOMContentLoaded", initBackendForms);
    document.addEventListener("dsnAjaxComplete", initBackendForms);
})();

/* =========================================================
   RWT UNIFIED NAVBAR SCROLL - ALL PAGES / ALL DEVICES
   Reliable with native scrolling and DSN Smooth Scrollbar.
========================================================= */
(function () {
    "use strict";

    var lastY = 0;
    var lastDirection = 0;
    var topZone = 70;
    var directionThreshold = 5;
    var timer = null;

    function smoothScrollY() {
        var container = document.getElementById("dsn-scrollbar");
        if (!container || !window.Scrollbar || typeof window.Scrollbar.get !== "function") {
            return null;
        }
        var instance = window.Scrollbar.get(container);
        if (!instance || !instance.offset) return null;
        return Math.max(0, Number(instance.offset.y) || 0);
    }

    function currentY() {
        var smoothY = smoothScrollY();
        if (smoothY !== null) return smoothY;
        return Math.max(
            window.scrollY || 0,
            window.pageYOffset || 0,
            document.documentElement ? document.documentElement.scrollTop || 0 : 0,
            document.body ? document.body.scrollTop || 0 : 0
        );
    }

    function menuOpen() {
        var icon = document.querySelector(".site-header .menu-icon");
        return !!(icon && icon.classList.contains("nav-active"));
    }

    function applyNavbarState(forceShow) {
        var body = document.body;
        if (!body || !body.classList.contains("classic-menu")) return;

        var y = currentY();
        var delta = y - lastY;

        body.classList.toggle("nav-bg", y > topZone);

        if (forceShow || y <= topZone || menuOpen()) {
            body.classList.remove("hide-nav");
            lastDirection = 0;
        } else if (Math.abs(delta) >= directionThreshold) {
            var direction = delta > 0 ? 1 : -1;
            if (direction !== lastDirection || direction === 1) {
                body.classList.toggle("hide-nav", direction === 1);
                lastDirection = direction;
            }
        }

        lastY = y;
    }

    function startNavbarWatcher() {
        if (timer) window.clearInterval(timer);
        lastY = currentY();
        applyNavbarState(true);

        /* Polling also catches transform-based DSN scrolling, where the
           browser window itself does not emit a normal scroll event. */
        timer = window.setInterval(function () {
            applyNavbarState(false);
        }, 50);
    }

    window.addEventListener("scroll", function () {
        applyNavbarState(false);
    }, { passive: true });

    window.addEventListener("resize", function () {
        applyNavbarState(true);
    }, { passive: true });

    window.addEventListener("load", function () {
        startNavbarWatcher();
        window.setTimeout(function () { applyNavbarState(true); }, 150);
        window.setTimeout(function () { applyNavbarState(false); }, 700);
    });

    document.addEventListener("DOMContentLoaded", startNavbarWatcher);
    document.addEventListener("dsnAjaxComplete", function () {
        window.setTimeout(startNavbarWatcher, 100);
    });
})();


/* Restore DSN hero content after the theme moves each slide into the
   dedicated animation layer. The observer also covers delayed/AJAX setup. */
(function () {
    "use strict";

    function restoreHeroContent() {
        document.querySelectorAll(".main-slider .dsn-slider-content .slide-content").forEach(function (content) {
            content.style.removeProperty("opacity");
            content.style.removeProperty("visibility");
            content.style.removeProperty("pointer-events");
            content.style.removeProperty("transform");

            if (content.classList.contains("dsn-active")) {
                content.querySelectorAll(".title, .metas, .description, .link-custom").forEach(function (item) {
                    item.style.removeProperty("opacity");
                    item.style.removeProperty("visibility");
                    item.style.removeProperty("pointer-events");
                });
            }
        });
    }

    function startHeroObserver() {
        restoreHeroContent();
        var slider = document.querySelector(".main-slider");
        if (!slider || slider.dataset.rwtHeroObserver === "1") return;
        slider.dataset.rwtHeroObserver = "1";

        var observer = new MutationObserver(restoreHeroContent);
        observer.observe(slider, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

        [100, 300, 700, 1400, 2500].forEach(function (delay) {
            setTimeout(restoreHeroContent, delay);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startHeroObserver, { once: true });
    } else {
        startHeroObserver();
    }
})();


/* RWT loader visibility guard: atomically reveal all UI after the preloader. */
(function () {
    "use strict";

    var released = false;

    function resetMobileViewport() {
        if (!window.matchMedia("(max-width: 991px)").matches || !document.body) return;
        document.body.classList.remove("dsn-effect-scroll", "dsn-scroll-active", "locked-scroll");
        document.body.classList.add("dsn-mobile", "rwt-native-mobile-scroll");
        document.documentElement.style.removeProperty("overflow");
        document.body.style.removeProperty("overflow");
        window.scrollTo(0, 0);
    }

    function releasePage() {
        if (released) return;
        released = true;
        resetMobileViewport();

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                document.documentElement.classList.remove("rwt-page-loading");
                if (document.body) document.body.classList.remove("rwt-page-loading");
                window.dispatchEvent(new Event("resize"));
            });
        });
    }

    function watchPreloader() {
        document.documentElement.classList.add("rwt-page-loading");
        if (document.body) document.body.classList.add("rwt-page-loading");

        var preloader = document.querySelector(".preloader");
        if (!preloader) {
            releasePage();
            return;
        }

        var observer = new MutationObserver(function () {
            if (!document.documentElement.contains(preloader)) {
                observer.disconnect();
                releasePage();
            }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });

        window.setTimeout(function () {
            observer.disconnect();
            if (document.documentElement.contains(preloader)) preloader.remove();
            releasePage();
        }, 3200);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", watchPreloader, { once: true });
    } else {
        watchPreloader();
    }

    window.addEventListener("pageshow", function () {
        if (!document.querySelector(".preloader")) releasePage();
    }, { once: true });
})();



/* RWT DEPLOY REPAIR: fresh mobile first paint + single active navigation */
(function () {
    "use strict";

    var mobileMedia = window.matchMedia("(max-width: 991px)");

    function copyDeferredSource(image) {
        if (!image) return;
        var source = image.getAttribute("data-dsn-src");
        if (source && image.getAttribute("src") !== source) image.setAttribute("src", source);
    }

    function prepareMobileFirstPaint() {
        if (!mobileMedia.matches || !document.body) return;

        var body = document.body;
        var html = document.documentElement;
        var scrollRoot = document.getElementById("dsn-scrollbar");

        body.classList.remove("dsn-effect-scroll", "dsn-scroll-active", "locked-scroll");
        body.classList.add("dsn-mobile", "rwt-native-mobile-scroll");

        try {
            if (scrollRoot && window.Scrollbar && typeof window.Scrollbar.get === "function") {
                var scrollInstance = window.Scrollbar.get(scrollRoot);
                if (scrollInstance && typeof scrollInstance.destroy === "function") scrollInstance.destroy();
            }
        } catch (error) {}

        [html, body, scrollRoot].filter(Boolean).forEach(function (element) {
            element.style.removeProperty("transform");
            element.style.setProperty("overflow-x", "hidden");
            element.style.setProperty("overflow-y", "auto");
            element.style.setProperty("height", "auto");
            element.style.setProperty("max-height", "none");
            element.style.setProperty("opacity", "1");
            element.style.setProperty("visibility", "visible");
        });

        document.querySelectorAll("#dsn-scrollbar > .inner-content, #dsn-scrollbar .scroll-content, .main-root, .wrapper, main").forEach(function (element) {
            element.style.setProperty("position", "relative");
            element.style.setProperty("transform", "none");
            element.style.setProperty("height", "auto");
            element.style.setProperty("min-height", "1px");
            element.style.setProperty("overflow", "visible");
            element.style.setProperty("opacity", "1");
            element.style.setProperty("visibility", "visible");
        });

        document.querySelectorAll(".site-header img[data-dsn-src], .main-slider .swiper-slide:first-child img[data-dsn-src], .main-slider .swiper-slide-active img[data-dsn-src], .header-page img[data-dsn-src], .header-project img[data-dsn-src], .intro-project img[data-dsn-src]").forEach(copyDeferredSource);

        var slider = document.querySelector(".main-slider");
        if (slider) {
            slider.style.setProperty("opacity", "1");
            slider.style.setProperty("visibility", "visible");

            var activeSlide = slider.querySelector(".swiper-slide.swiper-slide-active") || slider.querySelector(".swiper-slide:first-child");
            if (activeSlide) {
                activeSlide.classList.add("rwt-mobile-initial-slide");
                activeSlide.style.setProperty("opacity", "1");
                activeSlide.style.setProperty("visibility", "visible");
                activeSlide.querySelectorAll(".image-bg, .cover-bg-img, .slide-content, .content, .title, .metas, .description, .link-custom").forEach(function (element) {
                    element.style.setProperty("opacity", "1");
                    element.style.setProperty("visibility", "visible");
                    element.style.setProperty("transform", "none");
                });
            }

            var activeContent = slider.querySelector(".dsn-slider-content .slide-content.dsn-active") || slider.querySelector(".dsn-slider-content .slide-content:first-child");
            if (activeContent) {
                activeContent.classList.add("dsn-active");
                activeContent.style.setProperty("opacity", "1");
                activeContent.style.setProperty("visibility", "visible");
                activeContent.querySelectorAll(".title, .metas, .description, .link-custom").forEach(function (element) {
                    element.style.setProperty("opacity", "1");
                    element.style.setProperty("visibility", "visible");
                    element.style.setProperty("transform", "none");
                });
            }
        }
    }

    function currentNavigationKey() {
        var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (file === "" || file === "index.html" || file === "index2.html" || file === "index_original.html") return "home";
        if (file === "about.html") return "about";
        if (["mobileapps.html", "webdevelopment.html", "design.html", "devops.html", "iot.html", "digitalmarketing.html", "ai&mlservice.html", "qaservice.html"].indexOf(file) !== -1) return "services";
        if (["frontendtechnology.html", "backendtechnology.html", "mobiletechnology.html", "databasetechnology.html", "infraanddevopstechnology.html", "cmstechnology.html"].indexOf(file) !== -1) return "technology";
        if (file === "clients.html") return "clients";
        if (file === "careers.html") return "career";
        if (file === "contact.html") return "contact";
        return "";
    }

    function navigationItemKey(item) {
        var title = item && item.querySelector(":scope > a .dsn-title-menu");
        var text = title ? title.textContent.trim().toLowerCase() : "";
        if (text === "home") return "home";
        if (text === "about") return "about";
        if (text === "services") return "services";
        if (text === "technology") return "technology";
        if (text.indexOf("client") !== -1) return "clients";
        if (text.indexOf("career") !== -1) return "career";
        if (text.indexOf("contact") !== -1) return "contact";
        return "";
    }

    var syncingNavigation = false;
    function syncCurrentNavigation() {
        if (syncingNavigation) return;
        var list = document.querySelector(".site-header .main-navigation > ul.extend-container");
        if (!list) return;

        syncingNavigation = true;
        var current = currentNavigationKey();
        Array.prototype.forEach.call(list.children, function (item) {
            if (!(item instanceof HTMLElement)) return;
            if (item.classList.contains("dsn-active")) item.classList.remove("dsn-active");
            item.removeAttribute("data-rwt-current");
            if (current && navigationItemKey(item) === current) item.setAttribute("data-rwt-current", "true");
        });
        syncingNavigation = false;
    }

    function startNavigationLock() {
        syncCurrentNavigation();
        var navigation = document.querySelector(".site-header .main-navigation");
        if (!navigation || navigation.dataset.rwtActiveLock === "1") return;
        navigation.dataset.rwtActiveLock = "1";
        var observer = new MutationObserver(function () {
            window.requestAnimationFrame(syncCurrentNavigation);
        });
        observer.observe(navigation, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }

    function initialize() {
        prepareMobileFirstPaint();
        startNavigationLock();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
    else initialize();

    window.addEventListener("load", function () {
        prepareMobileFirstPaint();
        syncCurrentNavigation();
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                prepareMobileFirstPaint();
                syncCurrentNavigation();
            });
        });
        window.setTimeout(initialize, 180);
    }, { once: true });
    window.addEventListener("pageshow", initialize);
    document.addEventListener("dsnAjaxComplete", function () { window.setTimeout(initialize, 60); });
})();

/* =========================================================
   RWT SCROLL DRAWER
   Desktop behavior is retained. Every regular page reuses the
   same compact drawer from the existing hamburger on mobile.
========================================================= */
(function () {
    "use strict";

    if (window.__rwtScrollDrawerInstalled) return;
    window.__rwtScrollDrawerInstalled = true;

    var desktop = window.matchMedia("(min-width: 992px)");
    var servicePages = [
        "mobileapps.html",
        "webdevelopment.html",
        "design.html",
        "devops.html",
        "iot.html",
        "digitalmarketing.html",
        "ai&mlservice.html",
        "qaservice.html"
    ];
    var activeTrigger = null;
    var triggerClickHandler = null;
    var keydownHandler = null;
    var bodyObserver = null;
    var themeObserver = null;

    function currentFile() {
        return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    }

    function isServicePage() {
        return servicePages.indexOf(currentFile()) !== -1;
    }

    function drawerIsEnabled() {
        return true;
    }

    function destroyDrawer() {
        document.body.classList.remove("rwt-scroll-drawer-open", "rwt-mobile-drawer");

        if (activeTrigger && triggerClickHandler) {
            activeTrigger.removeEventListener("click", triggerClickHandler, true);
            activeTrigger.classList.remove("rwt-mobile-drawer-trigger");
            activeTrigger.setAttribute("aria-expanded", "false");
        }
        if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
        if (bodyObserver) bodyObserver.disconnect();
        if (themeObserver) themeObserver.disconnect();

        document.querySelectorAll(".rwt-scroll-menu-trigger,.rwt-scroll-drawer-overlay,.rwt-scroll-drawer").forEach(function (element) {
            element.remove();
        });

        activeTrigger = null;
        triggerClickHandler = null;
        keydownHandler = null;
        bodyObserver = null;
        themeObserver = null;
    }

    function buildDrawer() {
        if (!drawerIsEnabled() || document.querySelector(".rwt-scroll-drawer")) return;

        document.body.classList.toggle("rwt-service-page", isServicePage());

        var source = document.querySelector(".site-header .main-navigation > ul");
        if (!source) return;

        var originalMenuIcon = document.querySelector(".site-header .menu-icon");
        var trigger = originalMenuIcon;

        if (desktop.matches) {
            trigger = document.createElement("button");
            trigger.type = "button";
            trigger.className = "rwt-scroll-menu-trigger";

            /* Reuse the original website hamburger markup so the scroll trigger
               matches the theme instead of introducing a second icon design. */
            if (originalMenuIcon) {
                trigger.innerHTML = originalMenuIcon.innerHTML;
            } else {
                trigger.innerHTML = '<div class="icon-m"><span class="menu-icon-line icon-top"></span><span class="menu-icon-line icon-center"></span><span class="menu-icon-line icon-bottom"></span></div>';
            }
        } else if (trigger) {
            document.body.classList.add("rwt-mobile-drawer");
            trigger.classList.add("rwt-mobile-drawer-trigger");
        }

        if (!trigger) return;
        trigger.setAttribute("aria-label", "Open navigation drawer");
        trigger.setAttribute("aria-expanded", "false");
        activeTrigger = trigger;

        var overlay = document.createElement("div"); 
        overlay.className = "rwt-scroll-drawer-overlay";

        var drawer = document.createElement("aside");
        drawer.className = "rwt-scroll-drawer";
        drawer.setAttribute("aria-hidden", "true");
        drawer.innerHTML = `
        <div class="rwt-scroll-drawer-head">
            <a class="rwt-scroll-drawer-logo"
            href="index.html"
            aria-label="Royals Webtech home">
                <img src="assets/img/logo/rwtlogo.png"
                    alt="Royals Webtech Pvt. Ltd."
                    width="320"
                    height="42">
            </a>

            <div class="rwt-scroll-drawer-actions">
                <button type="button"
                        class="rwt-drawer-theme-toggle"
                        aria-label="Switch theme">
                    <span class="rwt-theme-sun"
                        aria-hidden="true"></span>

                    <span class="rwt-theme-moon"
                        aria-hidden="true"></span>
                </button>

                <button type="button"
                        class="rwt-scroll-drawer-close"
                        aria-label="Close menu">
                    ×
                </button>
            </div>
        </div>

        <nav class="rwt-scroll-drawer-nav"></nav>
    `;

    var themeToggle =
        drawer.querySelector(".rwt-drawer-theme-toggle");

    var desktopThemeToggle =
        document.querySelector("body > .day-night");

    /* Desktop ke exact SVG icons mobile button me copy honge */
    if (themeToggle && desktopThemeToggle) {
        var desktopSun =
            desktopThemeToggle.querySelector(".night svg");

        var desktopMoon =
            desktopThemeToggle.querySelector(".moon svg");

        var mobileSun =
            themeToggle.querySelector(".rwt-theme-sun");

        var mobileMoon =
            themeToggle.querySelector(".rwt-theme-moon");

        if (desktopSun && mobileSun) {
            mobileSun.appendChild(
                desktopSun.cloneNode(true)
            );
        }

        if (desktopMoon && mobileMoon) {
            mobileMoon.appendChild(
                desktopMoon.cloneNode(true)
            );
        }
    }

    function syncDrawerTheme() {
        if (!themeToggle || !document.body) return;

        var lightTheme =
            document.body.classList.contains("v-light");

        themeToggle.setAttribute(
            "aria-label",
            lightTheme
                ? "Switch to dark theme"
                : "Switch to light theme"
        );

        themeToggle.setAttribute(
            "title",
            lightTheme
                ? "Dark theme"
                : "Light theme"
        );
    }

    syncDrawerTheme();

    if (themeToggle) {
        themeToggle.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();

                var originalThemeToggle =
                    document.querySelector("body > .day-night");

                if (originalThemeToggle) {
                    originalThemeToggle.click();
                }

                window.setTimeout(
                    syncDrawerTheme,
                    20
                );
            }
        );

        if (window.MutationObserver) {
            themeObserver =
                new MutationObserver(syncDrawerTheme);

            themeObserver.observe(
                document.body,
                {
                    attributes: true,
                    attributeFilter: ["class"]
                }
            );
        }
    }

        var drawerNav = drawer.querySelector(".rwt-scroll-drawer-nav");
        Array.prototype.forEach.call(source.children, function (item) {
            var directLink = item.querySelector(":scope > a");
            if (!directLink) return;

            var submenu = item.querySelector(":scope > ul");
            if (!submenu) {
                var link = document.createElement("a");
                link.href = directLink.getAttribute("href") || "#";
                link.textContent = (directLink.querySelector(".dsn-title-menu") || directLink).textContent.trim();
                if (item.getAttribute("data-rwt-current") === "true") link.classList.add("rwt-current");
                drawerNav.appendChild(link);
                return;
            }

            var group = document.createElement("div");
            group.className = "rwt-scroll-drawer-group";
            if (item.getAttribute("data-rwt-current") === "true") group.classList.add("rwt-current");
            var toggle = document.createElement("button");
            toggle.type = "button";
            toggle.innerHTML = '<span>' + (directLink.querySelector(".dsn-title-menu") || directLink).textContent.trim() + '</span><span>+</span>';
            var sub = document.createElement("div");
            sub.className = "rwt-scroll-drawer-submenu";

            Array.prototype.forEach.call(submenu.children, function (subItem) {
                if (subItem.classList.contains("dsn-back-menu")) return;
                var a = subItem.querySelector("a");
                if (!a) return;
                var clone = document.createElement("a");
                clone.href = a.getAttribute("href") || "#";
                clone.textContent = (a.querySelector(".dsn-title-menu") || a).textContent.trim();
                if ((a.getAttribute("href") || "").toLowerCase() === currentFile()) clone.classList.add("rwt-current");
                sub.appendChild(clone);
            });

            toggle.addEventListener("click", function () {
                group.classList.toggle("open");
                var marker = toggle.lastElementChild;
                if (marker) marker.textContent = group.classList.contains("open") ? "−" : "+";
            });
            group.appendChild(toggle);
            group.appendChild(sub);
            drawerNav.appendChild(group);
        });

        if (desktop.matches) document.body.appendChild(trigger);
        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        function openDrawer() {
            if (!desktop.matches) {
                var originalNavigation = document.querySelector(".site-header .main-navigation");
                if (originalNavigation) {
                    originalNavigation.style.removeProperty("opacity");
                    originalNavigation.style.removeProperty("visibility");
                    originalNavigation.style.removeProperty("transform");
                }
                trigger.classList.remove("nav-active");
            }
            document.body.classList.add("rwt-scroll-drawer-open");
            trigger.setAttribute("aria-expanded", "true");
            drawer.setAttribute("aria-hidden", "false");
        }
        function closeDrawer() {
            document.body.classList.remove("rwt-scroll-drawer-open");
            trigger.setAttribute("aria-expanded", "false");
            drawer.setAttribute("aria-hidden", "true");
        }

        triggerClickHandler = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!desktop.matches) event.stopImmediatePropagation();
            if (document.body.classList.contains("rwt-scroll-drawer-open")) closeDrawer();
            else openDrawer();
        };
        trigger.addEventListener("click", triggerClickHandler, true);
        overlay.addEventListener("click", closeDrawer);
        drawer.querySelector(".rwt-scroll-drawer-close").addEventListener("click", closeDrawer);
        drawer.addEventListener("click", function (event) {
            if (event.target.closest("a")) closeDrawer();
        });
        keydownHandler = function (event) {
            if (event.key === "Escape") closeDrawer();
        };
        document.addEventListener("keydown", keydownHandler);

        /* When scrolling up restores the full navbar, hide/close the drawer. */
        if (desktop.matches) {
            bodyObserver = new MutationObserver(function () {
                if (
                    document.body.classList.contains("rwt-scroll-drawer-open") &&
                    !document.body.classList.contains("hide-nav")
                ) {
                    closeDrawer();
                }
            });
            bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        }
    }

    function rebuildDrawer() {
        destroyDrawer();
        buildDrawer();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildDrawer, { once: true });
    else buildDrawer();
    desktop.addEventListener ? desktop.addEventListener("change", rebuildDrawer) : desktop.addListener(rebuildDrawer);
    document.addEventListener("dsnAjaxComplete", function () { window.setTimeout(rebuildDrawer, 80); });
    window.addEventListener("pagehide", destroyDrawer);
    window.addEventListener("pageshow", buildDrawer);
    window.addEventListener("unload", destroyDrawer);
})();


/* RWT SAFE IMAGE LAZY LOADING */
(function () {
    "use strict";
    function optimizeImages() {
        document.querySelectorAll("img").forEach(function (img) {
            if (img.closest(".preloader, .site-header, .main-logo, .dsn-slider, .main-slider")) return;
            if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
            if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", optimizeImages, { once: true });
    } else {
        optimizeImages();
    }
})();


/* =========================================================
   HERO ARROWS - SINGLE CONTROLLED HANDLER
========================================================= */
(function () {
    "use strict";

    if (window.__rwtHeroArrowControllerBound) return;
    window.__rwtHeroArrowControllerBound = true;

    function getHeroSwiper() {
        const container = document.querySelector(".main-slider .swiper-container");
        return container && container.swiper ? container.swiper : null;
    }

    function restartHeroTimer(swiper) {
        if (typeof window.rwtStartHeroSliderTimer === "function") {
            window.rwtStartHeroSliderTimer(swiper);
        }
    }

    document.addEventListener("click", function (event) {
        const next = event.target.closest(".main-slider .control-nav .next-container");
        const prev = event.target.closest(".main-slider .control-nav .prev-container");

        if (!next && !prev) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const swiper = getHeroSwiper();
        if (!swiper || swiper.destroyed || swiper.animating) return;

        const lastIndex = Math.max(0, swiper.slides.length - 1);

        if (next) {
            if (swiper.activeIndex >= lastIndex) {
                swiper.slideTo(0, 500);
            } else {
                swiper.slideNext(500);
            }
        } else if (swiper.activeIndex <= 0) {
            swiper.slideTo(lastIndex, 500);
        } else {
            swiper.slidePrev(500);
        }

        restartHeroTimer(swiper);
    }, true);
})();
 

/* =========================================================
   RWT VERIFIED TESTIMONIAL CAROUSEL
   Stable Center + Autoplay + Hover Pause
========================================================= */

(function () {
    "use strict";

    function initializeRwtTestimonials() {
        var section =
            document.getElementById(
                "rwtTestimonials"
            );

        if (
            !section ||
            section.dataset.rwtCarouselReady ===
                "true"
        ) {
            return;
        }

        section.dataset.rwtCarouselReady =
            "true";

        var viewport =
            document.getElementById(
                "rwtTestimonialViewport"
            );

        var track =
            document.getElementById(
                "rwtTestimonialTrack"
            );

        var previousButton =
            document.getElementById(
                "rwtTestimonialPrev"
            );

        var nextButton =
            document.getElementById(
                "rwtTestimonialNext"
            );

        var dotsContainer =
            document.getElementById(
                "rwtTestimonialDots"
            );

        var sliderStatus =
            document.getElementById(
                "rwtTestimonialStatus"
            );

        if (
            !viewport ||
            !track ||
            !previousButton ||
            !nextButton ||
            !dotsContainer
        ) {
            return;
        }

        var slides =
            Array.from(
                track.querySelectorAll(
                    ".rwt-testimonial-slide"
                )
            );

        if (!slides.length) {
            return;
        }

        var hoverArea =
            section.querySelector(
                ".rwt-testimonial-stage"
            ) || viewport;

        var dots = [];

        var currentIndex =
            slides.length > 2
                ? 1
                : 0;

        var autoplayTimer = null;
        var autoplayDelay = 3500;

        var isPointerInside = false;
        var isTouching = false;

        var touchStartX = 0;
        var touchStartY = 0;


        function getTrackGap() {
            var trackStyle =
                window.getComputedStyle(track);

            return (
                parseFloat(
                    trackStyle.columnGap ||
                    trackStyle.gap
                ) || 0
            );
        }


        function updateSliderPosition() {
            if (!slides.length) {
                return;
            }

            currentIndex =
                Math.min(
                    Math.max(currentIndex, 0),
                    slides.length - 1
                );

            /*
             * offsetWidth transform/scale se
             * affect nahi hota.
             */
            var slideWidth =
                slides[0].offsetWidth;

            var viewportWidth =
                viewport.clientWidth;

            var gap =
                getTrackGap();

            if (
                !slideWidth ||
                !viewportWidth
            ) {
                return;
            }

            var offset =
                (viewportWidth - slideWidth) / 2 -
                currentIndex *
                    (slideWidth + gap);

            track.style.transform =
                "translate3d(" +
                Math.round(offset) +
                "px, 0, 0)";

            slides.forEach(
                function (slide, index) {
                    var isActive =
                        index === currentIndex;

                    slide.classList.toggle(
                        "is-active",
                        isActive
                    );

                    slide.setAttribute(
                        "aria-hidden",
                        String(!isActive)
                    );
                }
            );

            dots.forEach(
                function (dot, index) {
                    var isActive =
                        index === currentIndex;

                    dot.classList.toggle(
                        "is-active",
                        isActive
                    );

                    dot.setAttribute(
                        "aria-current",
                        isActive
                            ? "true"
                            : "false"
                    );
                }
            );

            if (sliderStatus) {
                sliderStatus.textContent =
                    "Showing review " +
                    (currentIndex + 1) +
                    " of " +
                    slides.length;
            }

            var hasMultipleReviews =
                slides.length > 1;

            previousButton.hidden =
                !hasMultipleReviews;

            nextButton.hidden =
                !hasMultipleReviews;

            dotsContainer.hidden =
                !hasMultipleReviews;
        }


        function goToReview(index) {
            currentIndex =
                (
                    index +
                    slides.length
                ) % slides.length;

            updateSliderPosition();
        }


        function stopAutoplay() {
            if (!autoplayTimer) {
                return;
            }

            window.clearTimeout(
                autoplayTimer
            );

            autoplayTimer = null;
        }


        function autoplayCanRun() {
            return (
                slides.length > 1 &&
                !document.hidden &&
                !isPointerInside &&
                !isTouching
            );
        }


        function startAutoplay() {
            stopAutoplay();

            if (!autoplayCanRun()) {
                return;
            }

            autoplayTimer =
                window.setTimeout(
                    function () {
                        goToReview(
                            currentIndex + 1
                        );

                        startAutoplay();
                    },
                    autoplayDelay
                );
        }


        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }


        function createDots() {
            dotsContainer.replaceChildren();

            dots =
                slides.map(
                    function (_, index) {
                        var dot =
                            document.createElement(
                                "button"
                            );

                        dot.type = "button";

                        dot.className =
                            "rwt-testimonial-dot";

                        dot.setAttribute(
                            "aria-label",
                            "Show review " +
                            (index + 1)
                        );

                        dot.addEventListener(
                            "click",
                            function () {
                                goToReview(index);
                                restartAutoplay();
                            }
                        );

                        dotsContainer.appendChild(
                            dot
                        );

                        return dot;
                    }
                );
        }


        previousButton.addEventListener(
            "click",
            function () {
                goToReview(
                    currentIndex - 1
                );

                restartAutoplay();
            }
        );


        nextButton.addEventListener(
            "click",
            function () {
                goToReview(
                    currentIndex + 1
                );

                restartAutoplay();
            }
        );


        /*
         * Desktop mouse hover pause
         */
        hoverArea.addEventListener(
            "pointerenter",
            function (event) {
                if (
                    event.pointerType &&
                    event.pointerType !== "mouse"
                ) {
                    return;
                }

                isPointerInside = true;
                stopAutoplay();
            }
        );


        hoverArea.addEventListener(
            "pointerleave",
            function (event) {
                if (
                    event.pointerType &&
                    event.pointerType !== "mouse"
                ) {
                    return;
                }

                isPointerInside = false;
                startAutoplay();
            }
        );


        /*
         * Keyboard arrows
         */
        viewport.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();

                    goToReview(
                        currentIndex - 1
                    );

                    restartAutoplay();
                }

                if (
                    event.key === "ArrowRight"
                ) {
                    event.preventDefault();

                    goToReview(
                        currentIndex + 1
                    );

                    restartAutoplay();
                }
            }
        );


        /*
         * Mobile swipe start
         */
        viewport.addEventListener(
            "touchstart",
            function (event) {
                if (!event.touches.length) {
                    return;
                }

                isTouching = true;
                stopAutoplay();

                touchStartX =
                    event.touches[0].clientX;

                touchStartY =
                    event.touches[0].clientY;
            },
            {
                passive: true
            }
        );


        /*
         * Mobile swipe end
         */
        viewport.addEventListener(
            "touchend",
            function (event) {
                if (
                    !event.changedTouches.length
                ) {
                    isTouching = false;
                    startAutoplay();
                    return;
                }

                var horizontalDistance =
                    event.changedTouches[0]
                        .clientX -
                    touchStartX;

                var verticalDistance =
                    event.changedTouches[0]
                        .clientY -
                    touchStartY;

                var horizontalSwipe =
                    Math.abs(
                        horizontalDistance
                    ) > 45 &&
                    Math.abs(
                        horizontalDistance
                    ) >
                    Math.abs(
                        verticalDistance
                    );

                if (horizontalSwipe) {
                    if (
                        horizontalDistance < 0
                    ) {
                        goToReview(
                            currentIndex + 1
                        );
                    } else {
                        goToReview(
                            currentIndex - 1
                        );
                    }
                }

                isTouching = false;
                restartAutoplay();
            },
            {
                passive: true
            }
        );


        viewport.addEventListener(
            "touchcancel",
            function () {
                isTouching = false;
                startAutoplay();
            },
            {
                passive: true
            }
        );


        /*
         * Background tab safety
         */
        document.addEventListener(
            "visibilitychange",
            function () {
                if (document.hidden) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            }
        );


        /*
         * Initial setup
         */
        createDots();

        window.requestAnimationFrame(
            function () {
                updateSliderPosition();
                startAutoplay();
            }
        );


        /*
         * Responsive alignment
         */
        if (
            "ResizeObserver" in window
        ) {
            var resizeObserver =
                new ResizeObserver(
                    updateSliderPosition
                );

            resizeObserver.observe(
                viewport
            );
        } else {
            window.addEventListener(
                "resize",
                updateSliderPosition
            );
        }


        window.addEventListener(
            "load",
            function () {
                updateSliderPosition();
                restartAutoplay();
            }
        );


        window.addEventListener(
            "pageshow",
            function () {
                updateSliderPosition();
                restartAutoplay();
            }
        );


        window.addEventListener(
            "pagehide",
            stopAutoplay
        );
    }


    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeRwtTestimonials
        );
    } else {
        initializeRwtTestimonials();
    }


    document.addEventListener(
        "dsnAjaxComplete",
        initializeRwtTestimonials
    );
})();