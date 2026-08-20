(function (window) {
    "use strict";

    const existingConfig = window.RWT_CONFIG || {};
    const existingEndpoints = existingConfig.endpoints || {};

    const config = {
        apiBaseUrl: String(existingConfig.apiBaseUrl || "https://royals-backend.onrender.com").trim(),
        endpoints: {
            contact: existingEndpoints.contact || "/api/contact",
            career: existingEndpoints.career || "/api/career/apply",
            chatbot: existingEndpoints.chatbot || "/api/royals-ai-chat",
        },
    };

    function endpointUrl(endpointName) {
        const endpoint = config.endpoints[endpointName];

        if (!endpoint) {
            throw new Error(`Unknown API endpoint: ${endpointName}`);
        }

        const baseUrl = config.apiBaseUrl || window.location.origin;
        return new URL(endpoint, `${baseUrl.replace(/\/$/, "")}/`).toString();
    }

    window.RWT_CONFIG = Object.freeze({
        ...config,
        endpoints: Object.freeze(config.endpoints),
    });
    window.rwtApiUrl = endpointUrl;
})(window);
