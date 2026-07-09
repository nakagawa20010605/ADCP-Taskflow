/* ===========================================
   モーダル共通処理
=========================================== */
const Modal = {
    /**
     * モーダルを開く
     * @param {string} html - モーダルの中身のHTML
     * @param {function} onMounted - DOM挿入後に呼ぶコールバック
     */
    open(html, onMounted) {
        //既存のモーダルがあれば閉じる
        Modal.close();

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-overlay";
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        //オーバーレイ背景クリックで閉じる
        overlay.addEventListener("click", (e) => {
            if(e.target === overlay) Modal.close();
        });

        //Escキーで閉じる
        document.addEventListener("keydown", Modal._onKeydown);

        //閉じるボタンのイベント
        const closeBtn = overlay.querySelector(".modal-close");
        if(closeBtn) {
            closeBtn.addEventListener("click", Modal.close);
        }

        //DOM挿入後のコールバック
        if(typeof onMounted === "function") {
            onMounted();
        }
    },

    /**
     * モーダルを閉じる
     */
    close() {
        const overlay = document.getElementById("modal-overlay");
        if(overlay) overlay.remove();
        document.removeEventListener("keydown", Modal._onKeydown);
    },

    /**
     * Escキーのハンドラ
     */
    _onKeydown(e) {
        if(e.key === "Escape") Modal.close();
    },
};