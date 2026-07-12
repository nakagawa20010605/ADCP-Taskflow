/* ===========================================
   メンバー招待モーダル
=========================================== */
const InviteModal = {
    /**
     * メンバー招待モーダルを開く
     * @param {number|null} teamId - 招待するチームID（指定がある場合）
     */
    open(teamId = null) {
        const teams = Home.teams || [];

        Modal.open(
            InviteModal._buildHtml(teamId, teams),
            () => {
                InviteModal._bindEvents(teamId);
            }
        );
    },

    /**
     * モーダルのHTMLを生成する
     */
    _buildHtml(teamId, teams) {
        const teamOptions = teams.map((t) => `
            <option value="${t.id}" ${String(t.id) === String(teamId) ? "selected" : ""}>
                ${escapeHtml(t.name)}
            </option>
        `).join("");

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">メンバーを招待</h2>
                    <button class="modal-close" aria-label="閉じる">
                        <i class="ti ti-x" style="font-size:18px;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="auth-alert" id="invite-modal-alert"></div>

                    <form id="invite-form" novalidate>
                        <div class="field">
                            <label class="field-label" for="invite-email">メールアドレス</label>
                            <input
                                class="input"
                                type="email"
                                id="invite-email"
                                name="email"
                                placeholder="example@company.com"
                                autocomplete="email"
                                required
                            />
                            <p class="field-error hidden" data-error-for="email"></p>
                        </div>

                        <div class="field">
                            <label class="field-label" for="invite-team">招待するチーム</label>
                            <select class="select" id="invite-team" name="team_id">
                                <option value="">チームを選択してください</option>
                                ${teamOptions}
                            </select>
                            <p class="field-error hidden" data-error-for="team_id"></p>
                        </div>

                        <div class="invite-notice">
                            <i class="ti ti-info-circle" style="font-size:15px; flex-shrink:0;"></i>
                            <span>登録済みのメールアドレスを持つユーザーのみ招待できます</span>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="invite-modal-cancel">キャンセル</button>
                    <button class="btn btn-primary" id="invite-modal-submit">
                        <span class="btn-label">招待する</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * イベントをバインドする
     */
    _bindEvents(initialTeamId) {
        const form = document.getElementById("invite-form");
        const submitBtn = document.getElementById("invite-modal-submit");
        const cancelBtn = document.getElementById("invite-modal-cancel");

        //キャンセルボタン
        cancelBtn.addEventListener("click", Modal.close);

        //送信処理
        submitBtn.addEventListener("click", async () => {
            clearFieldErrors(form);
            const alertEl = document.getElementById("invite-modal-alert");
            alertEl.classList.remove("is-visible");

            const teamId = document.getElementById("invite-team").value;
            const email = form.email.value.trim();

            //フロント側のバリデーション
            if(!email) {
                const errorEl = form.querySelector('[data-error-for="email"]');
                errorEl.textContent = "メールアドレスを入力してください"
                errorEl.classList.remove("hidden");
                return;
            }
            if(!teamId) {
                const errorEl = form.querySelector('[data-error-for="team_id"]');
                errorEl.textContent = "招待するチームを選択してください"
                errorEl.classList.remove("hidden");
                return;
            }

            setButtonLoading(submitBtn, true, "招待する");
            Modal.lock();

            try {
                await Api.inviteMember(teamId, { email });
                Modal.unlock();
                Modal.close();
                Toast.show("メンバーを招待しました");
                await Home.fetchAll();
            } catch(err) {
                if(err.status === 422) {
                    applyFieldErrors(err.errors, form);
                } else {
                    alertEl.textContent = err.message;
                    alertEl.classList.add("is-visible");
                }
            } finally {
                setButtonLoading(submitBtn, false, "招待する");
                Modal.unlock();
            }
        });
    },
};