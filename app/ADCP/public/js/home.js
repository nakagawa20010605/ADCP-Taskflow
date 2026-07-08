/* ===========================================
   ホーム画面
=========================================== */

const Home = {
    teams: [],
    teamTasks: {},
    myTasks: [],
    assignedTasks: [],
    filterFrom: null,
    filterTo: null,

    /**
    * ホーム画面を描画してデータを取得する
    */
   async render() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="home-screen">

            <!-- ヘッダー -->
            <header class="home-header">
                <div class="home-header-left">
                    <button class="btn-icon" id="sidebar-toggle-btn" aria-label="メニュー">
                        <i class="ti ti-menu-2" style="font-size:20px;"></i>
                    </button>
                    <div class="header-filter">
                        <span class="header-filter-label">
                            <i class="ti ti-filter" style="font-size:14px;"></i>
                            期日で絞り込み
                        </span>
                        <input class="header-date-input" type="date" id="filter-from" />
                        <span>～</span>
                        <input class="header-date-input" type="date" id="filter-to" />
                    </div>
                </div>
                <div class="home-header-right">
                    <button class="notification-btn" aria-label="通知">
                        <i class="ti ti-bell" style="font-size:20px;"></i>
                        <span class="notification-dot"></span>
                    </button>
                    <button class="btn btn-secondary" id="logout-btn" style="font-size:13px; padding:6px 12px">
                        <i class="ti ti-logout" style="font-size:15px;"></i>
                        ログアウト
                    </button>
                </div>
            </header>

            <!-- メインコンテンツ -->
            <main class="home-main" id="home-main">
                <div style="display:flex; align-items:center; justify-content:center; padding:60px 0;">
                    <div class="spinner"></div>
                </div>
            </main>

        </div>
    `;

    //ログアウトボタン
    document.getElementById("logout-btn").addEventListener("click", () => {
        Auth.logout();
    });

    //日付フィルターのイベント
    document.getElementById("filter-from").addEventListener("change", (e) => {
        Home.filterFrom = e.target.value || null;
        Home.renderMain();
    });
    document.getElementById("filter-to").addEventListener("change", (e) => {
        Home.filterTo = e.target.value || null;
        Home.renderMain();
    });

    // データ取得
    await Home.fetchAll();
   },

   /**
   * 全データをAPIから取得する
   */
   async fetchAll() {
    try {
        //チーム一覧・個人タスク・担当タスクを並列取得
        const [teams, myTasks] = await Promise.all([
            Api.getTeams(),
            Api.getMyTasks(),
        ]);

        Home.teams = teams || [];
        Home.myTasks = myTasks || [];

        //各チームのタスクを並列取得
        const taskResults = await Promise.all(
            Home.teams.map((team) => 
                Api.getTasks(team.id).catch(() => [])
            )
        );

        //チームIDをキーにタスクを保持
        Home.teamTasks = {};
        Home.teams.forEach((team, i) => {
            Home.teamTasks[team.id] = taskResults[i] || [];
        });

        //全チームのタスクから自分が担当のものを抽出
        const userId = Auth.currentUser?.id;
        Home.assignedTasks = Object.values(Home.teamTasks)
            .flat()
            .filter((task) => task.assigned_to === userId);
        Home.renderMain();
    } catch(err) {
        Toast.error("データの取得に失敗しました");
    }
   },

   /**
   * メインコンテンツを描画する
   */
   renderMain() {
    const main = document.getElementById("home-main");
    if(!main) return;

    const allMyTasks = [...Home.myTasks, ...Home.assignedTasks];
    const filtered = Home.applyFilter(allMyTasks);
    const summary = Home.calcSummary(filtered, Home.teamTasks);

    main.innerHTML = `
        ${Home.renderSummaryCards(summary)}
        ${Home.renderMyTaskSection(filtered)}
        ${Home.teams.map((team) => Home.renderTeamSection(team)).join("")}
    `;

    //イベントを設定
    Home.bindEvents();
   },

   /**
   * 日付フィルターを適用する
   */
   applyFilter(tasks) {
    return tasks.filter((task) => {
        if(!task.due_date) return true;
        if(Home.filterFrom && task.due_date < Home.filterFrom) return false;
        if(Home.filterTo && task.due_date > Home.filterTo) return false;
        return true;
    });
   },

   /**
   * サマリー集計
   */
   calcSummary(myTasks, teamTasks) {
    const today = new Date().toISOString().split("T")[0];
    const userId = Auth.currentUser?.id;

    const allTasks = [
        ...myTasks,
        ...Object.values(teamTasks).flat(),
    ];

    //重複除去
    const uniqueTasks = [...new Map(allTasks.map((t) => [t.id, t])).values()];

    return {
        today: uniqueTasks.filter(
            (t) => t.due_date === today && t.status !== "完了"
        ).length,
        inProgress: uniqueTasks.filter((t) => t.status === "進行中").length,
        overdue: uniqueTasks.filter(
            (t) => t.due_date && t.due_date < today && t.status !== "完了"
        ).length,
    };
   },

   /**
   * サマリーカードのHTML
   */
   renderSummaryCards(summary) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-card-label">本日のタスク</div>
                <div class="summary-card-count is-normal">${summary.today}</div>
            </div>
            <div class="summary-card">
                <div class="summary-card-label">進行中</div>
                <div class="summary-card-count is-warning">${summary.inProgress}</div>
            </div>
            <div class="summary-card">
                <div class="summary-card-label">期限超過</div>
                <div class="summary-card-count is-danger">${summary.overdue}</div>
            </div>
        </div>
    `;
   },

   /**
   * マイタスクセクションのHTML
   */
   renderMyTaskSection(tasks) {
    const count = tasks.length;
    const tasksHtml = tasks.length > 0
        ? tasks.map((task) => Home.renderTaskCard(task)).join("")
        : `<p class="task-section-empty">タスクはありません</p>`;
    
    return `
        <div class="task-section" data-section="my-tasks">
            <div class="task-section-header" data-toggle="my-tasks">
                <div class="task-section-header-left">
                    <span class="task-section-toggle">
                        <i class="ti ti-chevron-down" style="font-size:16px;"></i>
                    </span>
                    <span class="task-section-title">マイタスク</span>
                    <span class="badge-count">${count}</span>
                </div>
                <button class="task-section-add" data-add-task="personal" data-team-id="">
                    <i class="ti ti-plus" style="font-size:14px;"></i> 追加
                </button>
            </div>
            <div class="task-section-body" data-body="my-tasks">
                ${tasksHtml}
            </div>
        </div>
    `;
   },

   /**
   * チームセクションのHTML
   */
   renderTeamSection(team) {
    const tasks = Home.applyFilter(Home.teamTasks[team.id] || []);
    const count = tasks.length;
    const memberCount = team.members?.length || 0;
    const color = team.color || "#4F46E5";
    const tasksHtml = tasks.length > 0
        ? tasks.map((task) => Home.renderTaskCard(task)).join("")
        : `<p class="task-section-empty">タスクはありません</p>`;

    return `
        <div class="task-section" data-section="team-${team.id}">
            <div class="task-section-header" data-toggle="team-${team.id}">
                <div class="task-section-header-left">
                    <span class="task-section-toggle">
                        <i class="ti ti-chevron-down" style="font-size:16px;"></i>
                    </span>
                    <span class="task-section-dot" style="background:${escapeHtml(color)};"></span>
                    <span class="task-section-title">${escapeHtml(team.name)}</span>
                    <span class="badge-count">${count}</span>
                    <span class="team-section-members">${memberCount}名</span>
                </div>
                <button class="task-section-add" data-add-task="team" data-team-id="${team.id}">
                    <i class="ti ti-plus" style="font-size:14px;"></i> 追加
                </button>
            </div>
            <div class="task-section-body" data-body="team-${team.id}">
                ${tasksHtml}
            </div>
        </div>
    `;
   },

   /**
   * タスクカードのHTML
   */
   renderTaskCard(task) {
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = task.due_date && task.due_date < today && task.status !== "完了";
    const isDone = task.status === "完了";
    const isProgress = task.status === "進行中";

    const checkClass = isDone
        ? "is-done"
        : isProgress
        ? "is-progress"
        : "";
    
    const nextStatus = 
        task.status === "未着手"
            ? "進行中にする"
            :task.status === "進行中"
            ? "完了にする"
            : "未着手に戻す";

    const dueDateHtml = task.due_date
        ? `<span class="task-card-meta ${isOverdue ? "is-overdue" : ""}">
                <i class="ti ti-calendar" style="font-size:13px;"></i>
                ${Home.formatDate(task.due_date)}${isOverdue ? "・期限超過" : ""}
            </span>`
        : "";

    const priorityClass = 
        task.priority === "高"
            ? "priority-high"
            : task.priority === "低"
            ? "priority-low"
            : "priority-mid";
    return `
        <div class="task-card" data-task-id="${task.id}">
            <button class="task-card-check ${checkClass}"
                data-status-btn="${task.id}"
                data-current-status="${escapeHtml(task.status)}"
                data-tooltip="${nextStatus}"
                aria-label="ステータス切替">
                ${isDone ? `<i class="ti ti-check" style="font-size:13px;"></i>` : ""}
            </button>
            <div class="task-card-body">
                <div class="task-card-title ${isDone ? "is-done" : ""}">
                    ${escapeHtml(task.title)}
                </div>
                <div class="task-card-tags">
                    <span class="badge ${priorityClass}">${escapeHtml(task.priority)}</span>
                </div>
                <div class="task-card-assignee">
                    ${escapeHtml(task.assignee?.name || "")}
                </div>
            </div>
            ${dueDateHtml}
        </div>
    `;
   },

   /**
   * 日付を M/D 形式にフォーマット
   */
   formatDate(dateStr) {
    if(!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
   },

   /**
 　* ローカルデータのステータスを更新する（楽観的UI更新用）
 　*/
   updateTaskStatusLocally(taskId, newStatus) {
    //マイタスクの更新
    Home.myTasks = Home.myTasks.map((t) => 
        t.id === taskId ? { ...t, status: newStatus} : t
    );

    //チームタスクの更新
    Object.keys(Home.teamTasks).forEach((teamId) => {
        Home.teamTasks[teamId] = Home.teamTasks[teamId].map((t) => 
            t.id === taskId ? { ...t, status: newStatus } : t
        );
    });

    //担当タスクの更新
    Home.assignedTasks = Home.assignedTasks.map((t) => 
        t.id === taskId ? { ...t, status: newStatus} : t
    );
   },

   /**
   * イベントのバインド
   */
   bindEvents() {
    //セクションの開閉
    document.querySelectorAll("[data-toggle]").forEach((header) => {
        header.addEventListener("click", (e) => {
            //追加ボタンのクリックは開閉しない
            if(e.target.closest("[data-add-task]")) return;

            const key = header.dataset.toggle;
            const body = document.querySelector(`[data-body="${key}"]`);
            const toggle = header.querySelector(".task-section-toggle");
            if(body) body.classList.toggle("is-collapsed");
            if(toggle) toggle.classList.toggle("is-collapsed");
        });
    });

    //ステータス切替ボタン
    document.querySelectorAll("[data-status-btn]").forEach((btn) => {
        btn.addEventListener("click", async(e) => {
            e.stopPropagation();
            const taskId = btn.dataset.statusBtn;
            const current = btn.dataset.currentStatus;
            const next = 
                current === "未着手"
                    ? "進行中"
                    : current === "進行中"
                    ? "完了"
                    : "未着手";
            
            //先にローカルデータを更新
            Home.updateTaskStatusLocally(Number(taskId), next);
            Home.renderMain();

            //バックグラウンドでAPIを呼ぶ
            try {
                await Api.updateTaskStatus(taskId, next);
            } catch(err) {
                //失敗したら元に戻す
                Home.updateTaskStatusLocally(Number(taskId), current);
                Home.renderMain();
                Toast.error("ステータスの更新に失敗しました");
            }
        });
    });

    //タスク追加ボタン
    document.querySelectorAll(".task-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if(e.target.closest("[data-status-btn]")) return;
            const taskId = card.dataset.taskId;
            Toast.show("タスク詳細画面（実装予定）");
        });
    });
   },
};
