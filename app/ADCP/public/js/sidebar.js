/* ===========================================
   サイドバー
=========================================== */
const Sidebar = {
    _isOpen: true,

    /**
     * サイドバーのHTMLを生成して描画する
     */
    render() {
        const user = Auth.currentUser;
        const teams = Home.teams || [];
        const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

        const teamItems = teams.map((team) => `
            <button class="sidebar-team-item" data-team-id="${team.id}">
                <span class="sidebar-team-dot" style="background:${escapeHtml(team.color || "#4F46E5")};"></span>
                <span>${escapeHtml(team.name)}</span>
            </button>
        `).join("");

        const sidebarHtml = `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-main">

                    <!-- ロゴ -->
                    <div class="sidebar-logo">
                        <span class="sidebar-logo-mark">
                            <i class="ti ticheckbox" style="font-size:15px;"></i>
                        </span>
                        <span class="sidebar-logo-text">Taskflow</span>
                    </div>

                    <!-- ナビ -->
                    <button class="sidebar-nav-item is-active" id="sidebar-home-btn">
                        <i class="ti ti-home"></i>
                        ホーム
                    </button>
                    <button class="sidebar-nav-item" id="sidebar-mytask-btn">
                        <i class="ti ti-checkbox"></i>
                        マイタスク
                    </button>

                    <!-- チーム -->
                    <div class="sidebar-section-label">
                        チーム
                        <button class="sidebar-section-add" id="sidebar-create-team-btn" aria-label="チームを作成">
                            <i class="ti ti-plus"></i>
                        </button>
                    </div>
                    ${teamItems}

                    <!-- メニュー -->
                    <div class="sidebar-section-label" style="margin-top:8px;">メニュー</div>
                    <button class="sidebar-nav-item" id="sidebar-invite-btn">
                        <i class="ti ti-user-plus"></i>
                        メンバーを招待
                    </button>
                    <button class="sidebar-nav-item" id="sidebar-setting-btn">
                        <i class="ti ti-settings"></i>
                        設定
                    </button>

                </div>

                <!-- フッター：ユーザー情報 -->
                <div class="sidebar-footer">
                    <div class="sidebar-user-avatar">${escapeHtml(initial)}</div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">${escapeHtml(user?.name || "")}</div>
                        <div class="sidebar-user-role">メンバー</div>
                    </div>
                    <button class="sidebar-logout-btn" id="sidebar-logout-btn" aria-label="ログアウト">
                        <i class="ti ti-logout" style="font-size:17px;"></i>
                    </button>
                </div>
            </div>

            <!-- サイドバーオーバーレイ（背景クリックで閉じる） -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
        `;

        // layout-main の前に挿入
        const layoutMain = document.getElementById("layout-main");
        if(layoutMain) {
            layoutMain.insertAdjacentHTML("beforebegin", sidebarHtml);
        }

        Sidebar._bindEvents();
    },

    /**
     * サイドバーのイベントをバインドする
     */
    _bindEvents() {
        //ログアウト
        document.getElementById("sidebar-logout-btn")
            ?.addEventListener("click", () => TeamModal.open());

        //チーム作成
        document.getElementById("sidebar-create-team-btn")
            ?.addEventListener("click", () => TeamModal.open());

        //メンバー招待
        document.getElementById("sidebar-invite-btn")
            ?.addEventListener("click", () => InviteModal.open());

        //ホームボタン
        document.getElementById("sidebar-home-btn")
            ?.addEventListener("click", () => {
                Sidebar._setActive("sidebar-home-btn");
                Home.renderMain();
            });

        //マイタスクボタン（ホーム画面内のマイタスクセクションにスクロール）
        document.getElementById("sidebar-mytask-btn")
            ?.addEventListener("click", () => {
                Sidebar._setActive("sidebar-mytask-btn");
                const myTaskSection = document.querySelector('[data-section="my-tasks"]');
                if(myTaskSection) {
                    myTaskSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        //チームアイテムクリック（該当セクションにスクロール）
        document.querySelectorAll(".sidebar-team-item").forEach((btn) => {
            btn.addEventListener("click", () => {
                const teamId = btn.dataset.teamId;
                const teamSection = document.querySelector(`[data-section="team-${teamId}"]`);
                if(teamSection) {
                    teamSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        //オーバーレイクリックでサイドバーを閉じる
        document.getElementById("sidebar-overlay")
            ?.addEventListener("click", () => Sidebar.close());
    },

    /**
     * サイドバーのアクティブ状態を更新する
     */
    _setActive(activeId) {
        document.querySelectorAll(".sidebar-nav-item").forEach((btn) => {
            btn.classList.remove("is-active");
        });
        document.getElementById(activeId)?.classList.add("is-active");
    },

    /**
     * サイドバーを開く
     */
    open() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        const layoutMain = document.getElementById("layout-main");
        sidebar?.classList.remove("is-hidden");
        overlay?.classList.add("is-visible");
        layoutMain?.classList.remove("is-expanded");
        Sidebar._isOpen = true;
    },

    /**
     * サイドバーを閉じる
     */
    close() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        const layoutMain = document.getElementById("layout-main");
        sidebar?.classList.add("is-hidden");
        overlay?.classList.remove("is-visible");
        layoutMain?.classList.add("is-expanded");
        Sidebar._isOpen = false;
    },

    /**
     * サイドバーの開閉をトグルする
     */
    toggle() {
        Sidebar._isOpen ? Sidebar.close() : Sidebar.open();
    },

    /**
     * チーム一覧を再描画する（チーム追加・削除後に呼ぶ）
     */
    refreshTeams() {
        const teams = Home.teams || [];
        const container = document.querySelector(".sidebar-main");
        if(!container) return;

        const teamItemsHtml = team.map((team) => `
            <button class="sidebar-team-item" data-team-id="${team.id}">
                <span class="sidebar-team-dot" style="background:${escapeHtml(team.color || "#4F46E5")};"></span>
                <span>${escapeHtml(team.name)}</span>
            </button>
        `).join("");

        //チームセクションの中身だけ更新
        const teamSection = container.querySelector(".sidebar-section-label");
        if(teamSection) {
            //既存のチームアイテムを削除して再挿入
            const existingItems = container.querySelectorAll(".sidebar-team-item");
            existingItems.forEach((item) => item.remove());

            teamSection,insertAdjacentHTML("afterend", teamItemsHtml);

            //チームアイテムのイベントを再バインド
            container.querySelectorAll(".sidebar-team-item").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const teamId = btn.dataset.teamId;
                    const teamSection = document.querySelector(`[data-section="team-${teamId}"]`);
                    if(teamSection) {
                        teamSection.scrollIntoView({ behavior: "smooth", block: "start"});
                    }
                });
            });
        }
    },
};