/* ===========================================
   モーダル共通処理
=========================================== */
const Modal = {
    /**
     * モーダルを開く
     * @param {string} html - モーダルの中身のHTML
     * @param {function} onMounted - DOM挿入後に呼ぶコールバック
     */
    //ロック状態の管理(モーダルが閉じられないようにするやつ)
    _isLocked: false, 

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
            if(e.target === overlay && !Modal._isLocked) Modal.close();
        });

        //Escキーで閉じる
        document.addEventListener("keydown", Modal._onKeydown);

        //閉じるボタンのイベント
        const closeBtn = overlay.querySelector(".modal-close");
        if(closeBtn) {
            closeBtn.addEventListener("click", () => {
                if(!Modal._isLocked) Modal.close();
            });
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
        if(Modal._isLocked) return;
        const overlay = document.getElementById("modal-overlay");
        if(overlay) overlay.remove();
        document.removeEventListener("keydown", Modal._onKeydown);
    },

    //ロック状態にする（追加・編集処理開始時に呼ぶ）
    lock() {
        Modal._isLocked = true;
        const closeBtn = document.querySelector(".modal-close");
        const cancelBtn =document.getElementById("task-modal-cancel");
        if(closeBtn) closeBtn.disabled = true;
        if(cancelBtn) cancelBtn.disabled = true;
    },

    //ロック解除（追加・編集処理完了or 失敗時に呼ぶ）
    unlock() {
        Modal._isLocked = false;
        const closeBtn = document.querySelector(".modal-close");
        const cancelBtn = document.getElementById("task-modal-cancel");
        if(closeBtn) closeBtn.disabled = false;
        if(cancelBtn) cancelBtn.disabled = false;
    },

    /**
     * Escキーのハンドラ
     */
    _onKeydown(e) {
        if(e.key === "Escape") Modal.close();
    },
};