/* ===========================================
   API通信 共通処理
=========================================== */
const API_BASE_URL = "/api";

const TokenStore = {
    KEY: "adcp_auth_token",

    get() {
        return localStorage.getItem(this.KEY);
    },

    set(token) {
        localStorage.setItem(this.KEY, token);
    },

    clear() {
        localStorage.removeItem(this.KEY);
    },

    has() {
        return !!this.get();
    },
};

class ApiError extends Error {
    constructor(message, status, errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

/**
 * APIにリクエストを送る共通関数
 * @param {string} path - 例: "/login", "/teams/1/tasks"
 * @param {object} options - { method, body }
 */

async function apiRequest(path, options = {}) {
    const { method = "GET", body = null, skipAuthRedirect = false } = options;

    const headers = {
        Accept: "application/json",
    };

    if(body) {
        headers["Content-Type"] = "application/json";
    }

    const token = TokenStore.get();
    if(token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,  
        });
    } catch (networkError) {
        throw new ApiError("サーバーに接続できませんでした", 0);
    }

    //ログアウト相当の401はトークンをクリアしてログイン画面へ
    if(response.status === 401) {
        TokenStore.clear();
        const data = await safeJson(response);
        const error = new ApiError(
            data?.message || "認証が必要です",
            401,
            data?.errors
        );
        if(!skipAuthRedirect) {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
        throw error;
    }

    if(!response.ok) {
        const data = await safeJson(response);
        throw new ApiError(
            data?.message || "リクエストに失敗しました",
            response.status,
            data?.errors
        );
    }

    //204 No Content などボディが無い場合に対応
    if(response.status === 204) {
        return null;
    }

    return safeJson(response);
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

const Api = {
    //認証系
    register(payload) {
        return apiRequest("/register", { method: "POST", body: payload });
    },
    login(payload) {
        return apiRequest("/login", { method: "POST", body: payload, skipAuthRedirect: true,});
    },
    logout() {
        return apiRequest("/logout", { method: "POST" });
    },
    me() {
        return apiRequest("/user");
    },

    //個人タスク系
    getMyTasks() {
        return apiRequest("/my-tasks");
    },
    storeMyTask(payload) {
        return apiRequest("/my-tasks", { method: "POST", body: payload});
    },

    //チーム系
    getTeams() {
        return apiRequest("/teams");
    },
    createTeam(payload) {
        return apiRequest("/teams", { method: "POST", body: payload });
    },
    getTeam(teamId) {
        return apiRequest(`/teams/${teamId}`);
    },
    deleteTeam(teamId) {
        return apiRequest(`/teams/${teamId}`, { method: "DELETE" });
    },
    inviteMember(teamId, payload) {
        return apiRequest(`/teams/${teamId}/invite`, {
            method: "POST",
            body: payload,
        });
    },
    removeMember(teamId, userId) {
        return apiRequest(`/teams/${teamId}/members/${userId}`, {
            method: "DELETE",
        });
    },

    //タスク系
    getTasks(teamId) {
        return apiRequest(`/teams/${teamId}/tasks`);
    },
    createTask(teamId, payload) {
        return apiRequest(`/teams/${teamId}/tasks`, {
            method: "POST",
            body: payload,
        });
    },
    getTask(taskId) {
        return apiRequest(`/tasks/${taskId}`);
    },
    updateTask(taskId, payload) {
        return apiRequest(`/tasks/${taskId}`, {
            method: "PUT",
            body: payload,
        });
    },
    deleteTask(taskId) {
        return apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
    },
    updateTaskStatus(taskId, status) {
        return apiRequest(`/tasks/${taskId}/status`, {
            method: "PATCH",
            body: { status },
        });
    },

    //コメント系
    getComments(taskId) {
        return apiRequest(`/tasks/${taskId}/comments`);
    },
    createComment(taskId, payload) {
        return apiRequest(`/tasks/${taskId}/comments`, {
            method: "POST",
            body: payload,
        });
    },
    deleteComment(commentId) {
        return apiRequest(`/comments/${commentId}`, { method: "DELETE" });
    },
};