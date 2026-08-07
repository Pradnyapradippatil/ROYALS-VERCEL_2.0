(function () {
    "use strict";

    /*
     * Custom chatbot frontend
     *
     * Request flow:
     * Custom chatbot UI
     *      ↓
     * Netlify Function
     *      ↓
     * Chatbase trained AI agent
     *
     * Chatbase API key kabhi bhi is frontend file me mat rakhna.
     */

    const API_ENDPOINT =
        typeof window.rwtApiUrl === "function"
            ? window.rwtApiUrl("chatbot")
            : new URL(
                "/api/royals-ai-chat",
                window.location.origin
            ).toString();

    const chatbot =
        document.getElementById("rwtAiChat");

    const launcher =
        document.getElementById("rwtAiLauncher");

    const panel =
        document.getElementById("rwtAiPanel");

    const closeButton =
        document.getElementById("rwtAiClose");

    const resetButton =
        document.getElementById("rwtAiReset");

    const messagesContainer =
        document.getElementById("rwtAiMessages");

    const suggestions =
        document.getElementById("rwtAiSuggestions");

    const form =
        document.getElementById("rwtAiForm");

    const input =
        document.getElementById("rwtAiInput");

    const sendButton =
        document.getElementById("rwtAiSend");

    const status =
        document.getElementById("rwtAiStatus");

    if (
        !chatbot ||
        !launcher ||
        !panel ||
        !messagesContainer ||
        !form ||
        !input ||
        !sendButton
    ) {
        console.error(
            "Royals AI chatbot elements were not found."
        );

        return;
    }

    let conversationId = null;
    let requestController = null;
    let isSending = false;

    /*
     * Only recent messages frontend me rakhe jayenge.
     * Chatbase v2 conversationId ke through context maintain karega.
     */
    const conversation = [];

    function getCurrentTime() {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(new Date());
    }

    function cleanMessageText(value) {
        return String(value || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]+\n/g, "\n")
            .trim();
    }

    function updatePanelPosition() {
        const header =
            document.querySelector(".site-header");

        const quickPanel =
            document.querySelector(
                ".right-quick-panel"
            );

        const portfolioButton =
            document.querySelector(
                ".portfolio-side-button"
            );

        let navbarBottom = 0;
        let sidebarWidth = 0;

        if (header) {
            const headerRect =
                header.getBoundingClientRect();

            navbarBottom = Math.max(
                0,
                headerRect.bottom
            );
        }

        if (
            window.innerWidth >= 768 &&
            quickPanel
        ) {
            sidebarWidth = Math.max(
                sidebarWidth,
                quickPanel.getBoundingClientRect()
                    .width
            );
        }

        if (
            window.innerWidth >= 768 &&
            portfolioButton
        ) {
            sidebarWidth = Math.max(
                sidebarWidth,
                portfolioButton.getBoundingClientRect()
                    .width
            );
        }

        const topGap =
            window.innerWidth <= 767
                ? 8
                : 12;

        const rightGap =
            window.innerWidth <= 767
                ? 8
                : sidebarWidth + 18;

        panel.style.setProperty(
            "--rwt-ai-panel-top",
            `${navbarBottom + topGap}px`
        );

        panel.style.setProperty(
            "--rwt-ai-panel-right",
            `${rightGap}px`
        );

        launcher.style.setProperty(
            "--rwt-ai-launcher-right",
            `${
                window.innerWidth <= 767
                    ? 12
                    : sidebarWidth + 18
            }px`
        );
    }

    function openPanel() {
        updatePanelPosition();

        panel.classList.add("is-open");

        panel.setAttribute(
            "aria-hidden",
            "false"
        );

        launcher.setAttribute(
            "aria-expanded",
            "true"
        );

        /*
         * Body overflow change nahi kiya gaya.
         * Isliye chatbot open hone par page scroll lock nahi hoga.
         */

        window.setTimeout(function () {
            input.focus();
            scrollMessagesToBottom();
        }, 150);
    }

    function closePanel() {
        panel.classList.remove("is-open");

        panel.setAttribute(
            "aria-hidden",
            "true"
        );

        launcher.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    function togglePanel() {
        if (
            panel.classList.contains("is-open")
        ) {
            closePanel();
        } else {
            openPanel();
        }
    }

    function scrollMessagesToBottom() {
        window.requestAnimationFrame(
            function () {
                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;
            }
        );
    }

    function autoResizeTextarea() {
        input.style.height = "auto";

        const newHeight = Math.min(
            input.scrollHeight,
            110
        );

        input.style.height =
            `${newHeight}px`;
    }

    function setStatus(
        message = "",
        isError = false
    ) {
        if (!status) {
            return;
        }

        status.textContent = message;

        status.classList.toggle(
            "is-error",
            Boolean(isError)
        );
    }

    function createMessageElement(
        role,
        rawMessage
    ) {
        const message =
            cleanMessageText(rawMessage);

        const article =
            document.createElement("article");

        article.className =
            role === "user"
                ? "rwt-ai-message rwt-ai-message-user"
                : "rwt-ai-message rwt-ai-message-bot";

        if (role === "assistant") {
            const avatar =
                document.createElement("div");

            avatar.className =
                "rwt-ai-message-avatar";

            avatar.textContent = "AI";

            article.appendChild(avatar);
        }

        const content =
            document.createElement("div");

        content.className =
            "rwt-ai-message-content";

        const bubble =
            document.createElement("div");

        bubble.className =
            "rwt-ai-message-bubble";

        /*
         * textContent use karne se HTML/script execute nahi hoga.
         * Normal paragraph wrapping browser khud karega.
         */
        bubble.textContent = message;

        const time =
            document.createElement("span");

        time.className =
            "rwt-ai-message-time";

        time.textContent =
            getCurrentTime();

        content.appendChild(bubble);
        content.appendChild(time);

        article.appendChild(content);

        return article;
    }

    function addMessage(role, message) {
        const cleanText =
            cleanMessageText(message);

        if (!cleanText) {
            return null;
        }

        const element =
            createMessageElement(
                role,
                cleanText
            );

        messagesContainer.appendChild(
            element
        );

        scrollMessagesToBottom();

        return element;
    }

    function addTypingIndicator() {
        removeTypingIndicator();

        const article =
            document.createElement("article");

        article.className =
            "rwt-ai-message rwt-ai-message-bot";

        article.id =
            "rwtAiTypingMessage";

        const avatar =
            document.createElement("div");

        avatar.className =
            "rwt-ai-message-avatar";

        avatar.textContent = "AI";

        const content =
            document.createElement("div");

        content.className =
            "rwt-ai-message-content";

        const bubble =
            document.createElement("div");

        bubble.className =
            "rwt-ai-message-bubble";

        const typing =
            document.createElement("span");

        typing.className =
            "rwt-ai-typing";

        for (
            let index = 0;
            index < 3;
            index += 1
        ) {
            typing.appendChild(
                document.createElement("span")
            );
        }

        bubble.appendChild(typing);
        content.appendChild(bubble);

        article.appendChild(avatar);
        article.appendChild(content);

        messagesContainer.appendChild(
            article
        );

        scrollMessagesToBottom();
    }

    function removeTypingIndicator() {
        document
            .getElementById(
                "rwtAiTypingMessage"
            )
            ?.remove();
    }

    function setSendingState(sending) {
        isSending = sending;

        input.disabled = sending;
        sendButton.disabled = sending;

        const sendText =
            sendButton.querySelector(
                "span:first-child"
            );

        if (sendText) {
            sendText.textContent =
                sending ? "Wait" : "Send";
        }
    }

    function getReplyFromResponse(data) {
        if (
            typeof data?.reply === "string"
        ) {
            return cleanMessageText(
                data.reply
            );
        }

        if (
            typeof data?.text === "string"
        ) {
            return cleanMessageText(
                data.text
            );
        }

        if (
            typeof data?.message === "string"
        ) {
            return cleanMessageText(
                data.message
            );
        }

        return "";
    }

    async function sendMessage(rawMessage) {
        const message =
            cleanMessageText(rawMessage);

        if (!message || isSending) {
            return;
        }

        openPanel();

        if (suggestions) {
            suggestions.hidden = true;
        }

        setStatus("");

        addMessage("user", message);

        conversation.push({
            role: "user",
            content: message,
        });

        input.value = "";
        autoResizeTextarea();

        setSendingState(true);
        addTypingIndicator();

        requestController =
            new AbortController();

        try {
            const response =
                await fetch(
                    API_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            message,
                            conversationId,
                        }),

                        signal:
                            requestController.signal,
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch (parseError) {
                console.error(
                    "Invalid server response:",
                    responseText
                );

                throw new Error(
                    "Server returned an invalid response."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Royals AI is currently unavailable."
                );
            }

            const reply =
                getReplyFromResponse(data);

            if (!reply) {
                throw new Error(
                    "AI returned an empty response."
                );
            }

            if (data.conversationId) {
                conversationId =
                    data.conversationId;
            }

            conversation.push({
                role: "assistant",
                content: reply,
            });

            removeTypingIndicator();

            addMessage(
                "assistant",
                reply
            );
        } catch (error) {
            removeTypingIndicator();

            if (
                error.name === "AbortError"
            ) {
                setStatus(
                    "Request cancelled."
                );
            } else {
                console.error(
                    "Royals AI error:",
                    error
                );

                setStatus(
                    error.message ||
                    "Unable to connect to Royals AI.",
                    true
                );

                addMessage(
                    "assistant",
                    "Sorry, I could not connect right now. Please try again."
                );
            }
        } finally {
            requestController = null;

            setSendingState(false);

            if (
                panel.classList.contains(
                    "is-open"
                )
            ) {
                input.focus();
            }
        }
    }

    function createWelcomeMessage() {
        return createMessageElement(
            "assistant",
            "Hello! I am the Royals Webtech AI assistant. How can I help you today?"
        );
    }

    function resetConversation() {
        if (requestController) {
            requestController.abort();
            requestController = null;
        }

        conversation.length = 0;
        conversationId = null;

        setSendingState(false);
        setStatus("");

        messagesContainer.innerHTML = "";

        messagesContainer.appendChild(
            createWelcomeMessage()
        );

        if (suggestions) {
            messagesContainer.appendChild(
                suggestions
            );

            suggestions.hidden = false;
        }

        input.value = "";

        autoResizeTextarea();
        scrollMessagesToBottom();
    }

    launcher.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            togglePanel();
        }
    );

    closeButton?.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            closePanel();
        }
    );

    resetButton?.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            resetConversation();
        }
    );

    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            sendMessage(input.value);
        }
    );

    input.addEventListener(
        "input",
        autoResizeTextarea
    );

    input.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage(input.value);
            }
        }
    );

    suggestions?.addEventListener(
        "click",
        function (event) {
            const button =
                event.target.closest(
                    "button[data-question]"
                );

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            sendMessage(
                button.dataset.question
            );
        }
    );

    /*
     * Chatbot ke bahar click karne par panel close hoga.
     * Koi full-screen overlay create nahi hota.
     */
    document.addEventListener(
        "click",
        function (event) {
            if (
                panel.classList.contains(
                    "is-open"
                ) &&
                !chatbot.contains(
                    event.target
                )
            ) {
                closePanel();
            }
        }
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Escape") {
                closePanel();
            }
        }
    );

    window.addEventListener(
        "resize",
        updatePanelPosition,
        {
            passive: true,
        }
    );

    window.addEventListener(
        "orientationchange",
        function () {
            window.setTimeout(
                updatePanelPosition,
                150
            );
        },
        {
            passive: true,
        }
    );

    window.addEventListener(
        "load",
        updatePanelPosition
    );

    /*
     * Smooth-scroll/AJAX page load ke baad
     * navbar/sidebar measurements dobara liye jayenge.
     */
    document.addEventListener(
        "dsnAjaxComplete",
        updatePanelPosition
    );

    /*
     * Browser back ke baad stale modal/body lock remove.
     */
    window.addEventListener(
        "pageshow",
        function () {
            updatePanelPosition();

            if (
                !document.querySelector(
                    ".rwt-enquiry-modal.rwt-modal-active, " +
                    ".rwt-clients-modal.show"
                )
            ) {
                document.body.classList.remove(
                    "rwt-modal-open"
                );
            }
        }
    );

    autoResizeTextarea();
    updatePanelPosition();
})();
