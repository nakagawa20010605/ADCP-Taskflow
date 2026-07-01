/* ===========================================
   共通UIユーティリティ
=========================================== */

const Toast = {
    show(message, type = "default") {
        const container = document.getElementById("toast-container");
        if(!container) return;

        const el = document.createElement("div");
        el.className = "toast" + (type === "error" ? "toast-error" : "");
        el.textContent = message;
        container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 3200);
    },

    error(message) {
        this.show(message, "error");
    },
};


/**
 * バリデーションエラー(422)をフォームの各フィールドに表示する
 * @param {object} errors - { email: ["..."], password: ["..."] }
 * @param {HTMLFormElement} form
 */

function applyFieldErrors(errors, form) {
    if(!errors) return;
    Object.keys(errors).forEach((field) => {
        const errorEl = form.querySelector(`[data-error-for="${field}"]`);
        if(errorEl) {
            errorEl.textContent = errors[field][0];
            errorEl.classList.remove("hidden");
        }
    });
}

function clearFieldErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach((el) => {
        el.textContent = "";
        el.classList.add("hidden");
    });
}

function escapeHtml(str) {
    if(str === null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}