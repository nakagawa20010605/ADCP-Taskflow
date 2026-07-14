/* ===========================================
   チーム作成モーダル
=========================================== */
const TeamModal = {
    //選択可能なチームカラー
    COLORS: [
        "#4F46E5", // インディゴ
        "#DC2626", // レッド
        "#16A34A", // グリーン
        "#D97706", // アンバー
        "#9333EA", // パープル
        "#EA580C", // オレンジ
        "#0284C7", // スカイブルー
    ],

    /**
     * チーム作成モーダルを開く
     */
    open() {
        Modal.open(
            TeamModal._buildHtml(),
            () => {
                TeamModal._buildEvents();
            }
        );
    },

    /**
     * モーダルのHTMLを生成する
     */
    _buildHtml() {
        const colorSwatches = TeamModal.COLORS.map((color, i) => `
            <button
                type="button"
                class="team-color-swatch ${i === 0 ? "is-selected" : ""}"
                data-color="${color}"
                style="background:${color};"
                aria-label="${color}"
            ></button>
        `).join("");

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">チームを作成</h2>
                    <button class="modal-close" aria-label="閉じる">
                        <i class="ti ti-x" style="font-size:18px;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="auth-alert" id="team-modal-alert"></div>

                    <form id="team-form" novalidate>
                        <div class="field">
                            <label class="field-label" for="team-name">チーム名</label>
                            <input
                                class="input"
                                type="text"
                                id="team-name"
                                name="name"
                                placeholder="例：マーケティングチーム"
                                required
                            />
                            <p class="field-error hidden" data-error-for="name"></p>
                        </div>

                        <div class="field">
                            <label class="field-label">チームカラー</label>
                            <div class="team-color-swatches">
                                ${colorSwatches}
                            </div>
                            <input type="hidden" id="team-color" name="color" value="${TeamModal.COLORS[0]}" />
                        </div>

                        <!-- プレビュー -->
                        <div class="team-preview">
                            <div class="team-preview-icon" id="team-preview-icon" style="background:${TeamModal.COLORS[0]};">
                                <span id="team-preview-letter">T</span>
                            </div>
                            <span class="team-preview-name" id="team-preview-name">チーム名</span>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="team-modal-cancel">キャンセル</button>
                    <button class="btn btn-primary" id="team-modal-submit">
                        <span class="btn-label">作成する</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * イベントをバインドする
     */
    _buildEvents() {
        const form = document.getElementById("team-form");
        const submitBtn = document.getElementById("team-modal-submit");
        const cancelBtn = document.getElementById("team-modal-cancel");
        const nameInput = document.getElementById("team-name");
        const colorInput = document.getElementById("team-color");
        const previewIcon = document.getElementById("team-preview-icon");
        const previewLetter = document.getElementById("team-preview-letter");
        const previewName = document.getElementById("team-preview-name");

        //キャンセルボタン
        cancelBtn.addEventListener("click", Modal.close);

        //チーム名入力でプレビューを更新
        nameInput.addEventListener("input", () => {
            const name = nameInput.value.trim();
            previewName.textContent = name || "チーム名";
            previewLetter.textContent = name ? name.charAt(0).toUpperCase() : "T";
        });

        //カラー選択
        document.querySelectorAll(".team-color-swatch").forEach((swatch) => {
            swatch.addEventListener("click", () => {
                //選択状態を更新
                document.querySelectorAll(".team-color-swatch").forEach((s) => {
                    s.classList.remove("is-selected");
                });
                swatch.classList.add("is-selected");

                //カラー値を更新
                const color = swatch.dataset.color;
                colorInput.value = color;
                previewIcon.style.background = color;
            });
        });

        //送信処理
        submitBtn.addEventListener("click", async () => {
            clearFieldErrors(form);
            const alertEl = document.getElementById("team-modal-alert");
            alertEl.classList.remove("is-visible");

            const payload = {
                name: form.name.value.trim(),
                color: colorInput.value,
            };

            setButtonLoading(submitBtn, true, "作成する");
            Modal.lock();

            try {
                await Api.createTeam(payload);
                Modal.unlock();
                Modal.close();
                Toast.show("チームを作成しました");
                await Home.fetchAll();
            } catch(err) {
                if(err.status === 422) {
                    applyFieldErrors(err.errors, form);
                } else {
                    alertEl.textContent = err.message;
                    alertEl.classList.add("is-visible");
                }
            } finally {
                setButtonLoading(submitBtn, false, "作成する");
                Modal.unlock();
            }
        });
    },
};