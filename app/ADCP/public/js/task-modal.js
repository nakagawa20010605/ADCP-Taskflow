/* ===========================================
   タスク作成・編集モーダル
=========================================== */
const TaskModal = {
    /**
     * タスク作成モーダルを開く
     * @param {string|null} teamId - チームID（個人タスクの場合はnull）
     */
    openCreate(teamId = null) {
        const teams = Home.teams || [];
        const members = teamId
            ? (Home.teams.find((t) => t.id === Number(teamId))?.members || [])
            : [];

        Modal.open(
            TaskModal._buildHtml("create", null, teamId, teams, members),
            () => {
                TaskModal._bindCreateEvents(teamId);
            }
        );
    },

    /**
     * タスク編集モーダルを開く
     * @param {object} task - 編集対象のタスクオブジェクト
     */
    openEdit(task) {
        const teams = Home.teams || [];
        const members = task.teamId
            ? (Home.teams.find((t) => t.id === task.team_id)?.members || [])
            : [];
        
        Modal.open(
            TaskModal._buildHtml("edit", task, task.team_id, teams, members),
            () => {
                TaskModal._bindEditEvents(task);
            }
        );
    },

    /**
     * モーダルのHTMLを生成する
     */
    _buildHtml(mode, task, teamId, teams, members) {
        const isEdit = mode === "edit";
        const title = isEdit ? "タスクを編集" : "タスクを作成";

        //担当者セレクトの選択肢
        const memberOptions = members.map((m) => `
            <option value="${m.id}" ${isEdit && task.assigned_to === m.id ? "selected" : ""}>
                ${escapeHtml(m.name)}
            </option>
        `).join("");

        //ステータスの選択肢
        const statusOptions = ["未着手", "進行中", "完了"].map((s) => `
            <option value="${s}" ${isEdit && task.status === s ? "selected" : s === "未着手" && !isEdit ? "selected" : ""}>
                ${s}
            </option>
        `).join("");

        //優先度の選択肢
        const priorityOptions = ["低", "中", "高"].map((p) => `
            <option value="${p}" ${isEdit && task.priority === p ? "selected" : p === "中" && !isEdit ? "selected" : ""}>
                ${p}
            </option>
        `).join("");

        //チームセレクト（作成時のみ表示）
        const teamSelectHtml = !isEdit ? `
            <div class="field">
                <label class="field-label" for="task-team">チーム</label>
                <select class="select" id="task-team">
                    <option value="">個人タスク（チームなし）</option>
                    ${teams.map((t) => `
                        <option value="${t.id}" ${String(t.id) === String(teamId) ? "selected" : ""}>
                            ${escapeHtml(t.name)}
                        </option>
                    `).join("")}
                </select>
            </div>
        ` : "";

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" aria-label="閉じる">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="auth-alert" id="task-modal-alert"></div>

                    <form id="task-form" novalidate>
                        <div class="field">
                            <label class="field-label" for="task-title">タイトル</label>
                            <input
                                class="input"
                                type="text"
                                id="task-title"
                                name="title"
                                placeholder="タスク名を入力"
                                value="${isEdit ? escapeHtml(task.title) : ""}"
                                required
                            />
                            <p class="field-error hidden" data-error-for="title"></p>
                        </div>

                        <div class="field">
                            <label class="field-label" for="task-description">説明</label>
                            <textarea
                                class="textarea"
                                id="task-description"
                                name="description"
                                placeholder="詳細を入力（任意）"
                                rows="3"
                            >${isEdit ? escapeHtml(task.description || "") : ""}</textarea>
                        </div>

                        <div class="field-row">
                            <div class="field">
                                <label class="field-label" for="task-priority">優先度</label>
                                <select class="select" id="task-priority" name="priority">
                                    ${priorityOptions}
                                </select>
                            </div>
                        </div>

                        <div class="field-row">
                            <div class="field">
                                <label class="field-label" for="task-due-date">期日</label>
                                <input
                                    class="input"
                                    type="date"
                                    id="task-due-date"
                                    name="due-date"
                                    value="${isEdit && task.due_date ? task.due_date : ""}"
                                />
                            </div>
                            <div class="field" id="task-assignee-field">
                                <label class="field-label" for="task-assignee">担当者</label>
                                <select class="select" id="task-assignee" name="assigned_to">
                                    <option value="">未設定</option>
                                    ${memberOptions}
                                </select>
                            </div>
                        </div>

                        ${teamSelectHtml}
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="task-modal-cancel">キャンセル</button>
                    <button class="btn btn-primary" id="task-modal-submit">
                        <span class="btn-label">${isEdit ? "保存する" : "作成する"}</span>
                    </button>
                </div>
            </div>                        
        `;
    },

    /**
     * 作成モーダルのイベントをバインドする
     */
    _bindCreateEvents(initialTeamId) {
        const form = document.getElementById("task-form");
        const submitBtn = document.getElementById("task-modal-submit");
        const cancelBtn = document.getElementById("task-modal-cancel");
        const teamSelect = document.getElementById("task-team");
        const assigneeField = document.getElementById("task-assignee-field");
        const assigneeSelect = document.getElementById("task-assignee");

        //キャンセルボタン
        cancelBtn.addEventListener("click", Modal.close);

        //チーム変更時に担当者セレクトを更新
        if(teamSelect) {
            teamSelect.addEventListener("change", () => {
                const selectedTeamId = teamSelect.ariaValueMax;
                const members = selectedTeamId
                    ? (Home.teams.find((t) => t.id === Number(selectedTeamId))?.members || [])
                    : [];
                if(members.length > 0) {
                    assigneeField.style.display = "";
                    assigneeSelect.innerHTML = `
                        <option value="">未設定</option>
                        ${members.map((m) => `
                            <option value="${m.id}">${escapeHtml(m.name)}</option>    
                        `).join("")}
                    `;
                } else {
                    assigneeField.style.display = "none";
                    assigneeSelect.innerHTML = `<option value="">未設定</option>`;
                }
            });

            //初期表示時に担当者フィールドの表示制御
            if(!initialTeamId) {
                assigneeField.style.display = "none";
            }
        }

        //送信処理
        submitBtn.addEventListener("click", async () => {
            clearFieldErrors(form);
            const alertEl = document.getElementById("task-modal-alert");
            alertEl.classList.remove("is-visible");

            const teamId = teamSelect ? teamSelect.value || null : initialTeamId;
            const payload = {
                title: form.title.value.trim(),
                description: form.description.value.trim() || null,
                status: form.status.value,
                priority: form.priority.value,
                due_date: form.due_date.value || null,
                assigned_to: form.assigned_to.value || null,
            };

            setButtonLoading(submitBtn, true, "作成する");

            try {
                if(teamId) {
                    await Api.createTask(teamId, payload);
                } else {
                    await Api.storeMyTask(payload);
                }
                Modal.close();
                Toast.show("タスクを作成しました");
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
            }
        });
    },

    /**
     * 編集モーダルのイベントをバインドする
     */
    _bindEditEvents(task) {
        const form = document.getElementById("task-form");
        const submitBtn = document.getElementById("task-modal-submit");
        const cancelBtn = document.getElementById("task-modal-cancel");

        //キャンセルボタン
        cancelBtn.addEventListener("click", Modal.close);

        //送信処理
        cancelBtn.addEventListener("click", async () => {
            clearFieldErrors(form);
            const alertEl = document.getElementById("task-modal-alert");
            alertEl.classList.remove("is-visible");

            const payload = {
                title: form.title.value.trim(),
                description: form.description.value.trim() || null,
                status: form.status.value,
                priority: form.priority.value,
                due_date: form.due_date.value || null,
                assigned_to: form.assigned_to.value || null,
            };

            setButtonLoading(submitBtn, true, "保存する");

            try {
                await Api.updateTask(task.id, payload);
                Modal.close();
                Toast.show("タスクを更新しました");
                await Home.fetchAll();
            } catch(err) {
                if(err.status === 422) {
                    applyFieldErrors(err.errors, form);
                } else {
                    alertEl.textContent = err.message;
                    alertEl.classList.add("is-visible");
                }
            } finally {
                setButtonLoading(submitBtn, false, "保存する");
            }
        });
    },
};