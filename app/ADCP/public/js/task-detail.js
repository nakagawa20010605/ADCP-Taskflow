/* ===========================================
   タスク詳細画面
=========================================== */
const TaskDetail = {
    _currentTask: null,
    _comments: [],

    /**
     * タスク詳細画面を描画する
     * @param {object} task - タスクオブジェクト
     */
    async render(task) {
        TaskDetail._currentTask = task;

        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="task-detail-screen">

                <!-- ヘッダー -->
                <header class="task-detail-header">
                    <div class="task-detail-header-left">
                        <button class="back-btn" id="back-btn">
                            <i class="ti ti-arrow-left" style="font-size:16px;"></i>
                            戻る
                        </button>
                        <span class="task-detail-title">${escapeHtml(task.title)}</span>
                    </div>
                    <div class="task-detail-header-right">
                        <button class="btn btn-secondary" id="task-edit-btn">
                            <i class="ti ti-pencil" style="font-size:15px;"></i>
                            編集
                        </button>
                    </div>
                </header>

                <!-- メインコンテンツ -->
                <main class="task-detail-main" id="task-detail-main">

                    <!-- タスク情報カード -->
                    <div class="task-info-card">
                        <div class="task-info-title">${escapeHtml(task.title)}</div>
                        <div class="task-info-description ${!task.description ? "is-empty" : ""}">
                            ${task.description ? escapeHtml(task.description) : "説明はありません"}
                        </div>
                    </div>

                    <!-- メタ情報カード -->
                    <div class="task-meta-card">
                        ${TaskDetail._renderMetaItem("ステータス", TaskDetail._renderStatusBadge(task.status))}
                        ${TaskDetail._renderMetaItem("優先度", TaskDetail._renderPriorityBadge(task.priority))}
                        ${TaskDetail._renderMetaItem("期日", TaskDetail._renderDueDate(task.due_date))}
                        ${TaskDetail._renderMetaItem("担当者", escapeHtml(task.assignee?.name || "未設定"))}
                    </div>

                    <!-- コメントセクション -->
                    <div class="comment-section">
                        <div class="comment-section-title">コメント</div>

                        <!-- コメント投稿フォーム -->
                        <div class="comment-form">
                            <div class="comment-form-avatar">
                                ${escapeHtml(Auth.currentUser?.name?.charAt(0).toUpperCase() || "U")}
                            </div>
                            <div class="comment-form-body">
                                <textarea
                                    class="comment-input"
                                    id="comment-input"
                                    placeholder="コメントを入力..."
                                    rouws="3"
                                ></textarea>
                                <div class="comment-form-footer">
                                    <button class="btn btn-primary" id="comment-submit-btn">
                                        <span class="btn-label">投稿する</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- コメント一覧 -->
                        <div class="comment-list" id="comment-list">
                            <div style="display:flex; justify-content:center; padding:20px 0;">
                                <div class="spinner"></div>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        `;

        //イベントのバインド
        TaskDetail._bindEvents(task);

        //コメント取得
        await TaskDetail.fetchComments(task.id);
    },

    /**
     * メタ情報アイテムのHTMLを生成する
     */
    _renderMetaItem(label, valueHtml) {
        return `
            <div class="task-meta-item">
                <span class="task-meta-label">${label}</span>
                <span class="task-meta-value">${valueHtml}</span>
            </div>
        `;
    },

    /**
     * ステータスバッジのHTMLを生成する
     */
    _renderStatusBadge(status) {
        const map = {
            "未着手": { cls: "is-todo", icon: "ti-circle" },
            "進行中": { cls: "is-progress", icon: "ti-progress" },
            "完了": { cls: "is-done", icon: "ti-circle-check" },
        };
        const { cls, icon } = map[status] || map["未着手"];
        return `
            <span class="status-badge ${cls}">
                <i class="ti ${icon}" style="font-size:13px;"></i>
                ${escapeHtml(status)}
            </span>
        `;
    },

    /**
     * 優先度バッジのHTMLを生成する
     */
    _renderPriorityBadge(priority) {
        const map = {
            "高": "priority-high",
            "中": "priority-mid",
            "低": "priority-low",
        };
        const cls = map[priority] || "priority-mid";
        return `<span class="badge ${cls}">${escapeHtml(priority)}</span>`;
    },

    /**
     * 期日のHTMLを生成する
     */
    _renderDueDate(due_date) {
        if(!due_date) return "未設定";
        const today = new Date().toISOString().split("T")[0];
        const isOverdue = dueDate < today;
        const d = new Date(dueDate);
        const formatted = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        return `
            <span class="${isOverdue ? "is-overdue" : ""}">
                <i class="ti ti-calendar" style="font-size:13px;"></i>
                ${formatted}${isOverdue ? "・期限超過" : ""}
            </span>
        `;
    },

    /**
     * コメント一覧を取得して描画する
     */
    async fetchComments(taskId) {
        try {
            const comments = await Api.getComments(taskId);
            TaskDetail._comments = comments || [];
            TaskDetail._renderComments();
        } catch(err) {
            Toast.error("コメントの取得に失敗しました");
        }
    },

    /**
     * コメント一覧を描画する
     */
    _renderComments() {
        const list = document.getElementById("comment-list");
        if(!list) return;

        if(TaskDetail._comments.length === 0) {
            list.innerHTML = `<p class="comment-empty">まだコメントはありません</p>`;
            return;
        }

        list.innerHTML = TaskDetail._comments.map((comment) => {
            const initial = comment.user?.name?.charAt(0).toUpperCase() || "U";
            const isOwn = comment.user_id === Auth.currentUser?.id;
            const date = new Date(comment.created_at);
            const formatted = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

            return `
                <div class="comment-item" data-comment-id="${comment.id}">
                    <div class="comment-avatar">${escapeHtml(initial)}</div>
                    <div class="comment-body">
                        <div class="comment-header">
                            <span class="comment-author">${escapeHtml(comment.user?.name || "")}</span>
                            <span class="comment-date">${formatted}</span>
                            ${isOwn ? `
                                <button class="comment-delete-btn" data-delete-comment="${comment.id}">
                                    <i class="ti ti-trash" style="font-size:13px;"></i>
                                </button>
                            ` : ""}
                        </div>
                        <div class="comment-content">${escapeHtml(comment.content)}</div>
                    </div>
                </div>
            `;
        }).join("");

        //コメント削除ボタンのイベント
        list.querySelectorAll("[data-delete-comment]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                if(!confirm("このコメントを削除しますか？")) return;
                const commentId = btn.CDATA_SECTION_NODE.deleteComment;
                try {
                    await Api.deleteComment(commentId);
                    TaskDetail._comments = TaskDetail._comments.filter(
                        (c) => c.id !== Number(commentId) 
                    );
                    TaskDetail._renderComments();
                    Toast.show("コメントを削除しました");
                } catch(err) {
                    Toast.error("コメントの削除に失敗しました");
                }
            });
        });
    },

    /**
     * イベントをバインドする
     */
    _bindEvents(task) {
        //戻るボタン
        document.getElementById("back-btn")?.addEventListener("click", async () => {
            await Home.render();
        });

        //編集ボタン
        document.getElementById("task-edit-btn")?.addEventListener("click", () => {
            TaskModal.openEdit(task);
        });

        //コメント投稿ボタン
        document.getElementById("comment-submit-btn")?.addEventListener("click", async () => {
            const input = document.getElementById("comment-input");
            const content = input.value.trim();
            const submitBtn = document.getElementById("comment-submit-btn");

            if(!content) {
                Toast.error("コメントを入力してください");
                return;
            }

            setButtonLoading(submitBtn, true, "投稿する");

            try {
                const comment = await Api.createComment(task.id, { content });
                TaskDetail._comments.push(comment);
                TaskDetail._renderComments();
                input.value = "";
                Toast.show("コメントを投稿しました");
            } catch(err) {
                Toast.error("コメントの投稿に失敗しました");
            } finally {
                setButtonLoading(submitBtn, false, "投稿する");
            }
        });
    },
};