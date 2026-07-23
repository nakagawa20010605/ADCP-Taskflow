/* ===========================================
   チームメンバー一覧モーダル
=========================================== */
const MemberModal = {
    /**
     * メンバー一覧モーダルを開く
     * @oaram {object} team - チームオブジェクト
     */
    open(team) {
        Modal.open(
            MemberModal._buildHtml(team),
            () => {
                MemberModal._bindEvents();
            }
        );
    },

    /**
     * モーダルのHTMLを生成する
     */
    _buildHtml(team) {
        const members = team.members || [];

        const memberItems = members.map((member) => {
            const initial = member.name?.charAt(0).toUpperCase() || "U";
            const role = member.pivot?.role === "owner" ? "オーナー" : "メンバー";
            const isOwner = member.pivot?.role === "owner";

            return `
                <div class="member-item">
                    <div class="member-avatar" style="background:${isOwner ? "var(--color-accent)" : "var(--color-border-strong)"}; color:${isOwner ? "#fff" : "var(--color-text-secondary)"};">
                        ${escapeHtml(initial)}
                    </div>
                    <div class="member-info">
                        <div class="member-name">${escapeHtml(member.name)}</div>
                        <div class="member-email">${escapeHtml(member.email)}</div>
                    </div>
                    <span class="member-role ${isOwner ? "is-owner" : "is-member"}">${role}</span>
                </div>
            `;
        }).join("");

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${escapeHtml(team.name)}のメンバー</h2>
                    <button class="modal-close" aria-label="閉じる">
                        <i class="ti ti-x" style="font-size:18px;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="member-count">${members.length}名のメンバー</div>
                    <div class="member-list">
                        ${memberItems.length > 0 ? memberItems : `<p class="member-empty">メンバーがいません</p>`}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="member-modal-close">閉じる</button>
                    <button class="btn btn-primary" id="member-modal-invite">
                        <i class="ti ti-user-plus" style="font-size:15px;"></i>
                        メンバーを招待
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * イベントをバインドする
     */
    _bindEvents() {
        document.getElementById("member-modal-close")
            ?.addEventListener("click", Modal.close);
        
        document.getElementById("member-modal-invite")
            ?.addEventListener("click", () => {
                Modal.close();
                InviteModal.open();
            });
    },
};