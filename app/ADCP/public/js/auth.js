/* ===========================================
   認証関連の処理
=========================================== */

const Auth = {
    currentUser: null,

    /**
   * ログイン画面のテンプレートを描画してイベントを設定する
   */
    renderLogin() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="auth-screen">
                <div class="auth-card">
                    <div class="auth-logo">
                        <span class="auth-logo-mark"><i class="ti ti-checkbox" style="font-size:16px;"></i></span>
                        <span class="auth-logo-text">Taskflow</span>
                    </div>
                    <h1 class=""auth-title>ログイン</h1>
                    <p class="auth-subtitle">アカウントにログインしてください</p>

                    <div class="auth-alert" id="login-alert"></div>

                    <form id="login-form" novalidate>
                        <div class="field">
                            <label class="field-label" for="login-email">メールアドレス</label>
                            <input class="input" type="email" id="login-email" name="email" placeholder="example@company.com" autocomplete="email" required />
                            <p class="field-error hidden" data-error-for="email"></p>
                        </div>
                        <div class="field">
                            <label class="field-label" for="login-password">パスワード</label>
                            <input class"input" type="password" id="login-password" name="password" placeholder="••••••••" autocomplete="current-password" required />
                            <p class="field-error hidden" data-error-for="password"></p>
                        </div>
                        <button class="btn btn-primary btn-block" type="submit" id="login-submit">
                            <span class="btn-label">ログイン</span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        アカウントをお持ちでない方は <a href="#" id="go-to-register">新規登録</a>
                    </p>
                </div>
            <div>
        `;

        document
            .getElementById("go-to-register")
            .addEventListener("click", (e) => {
                e.preventDefault();
                Auth.renderRegister();
            });
        
        document
            .getElementById("login-form")
            .addEventListener("submit", Auth.handleLogin);
    },

    /**
   * 新規登録画面のテンプレートを描画してイベントを設定する
   */
    renderRegister() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="auth-screen">
                <div class="auth-card">
                    <div class="auth-logo">
                        <span class="auth-logo-mark"><i class="ti ti-checkbox" style="font-size:16px"></i></span>
                        <span class="auth-logo-text">Taskflow</span>
                    </div>
                    <h1 class="auth-title">新規登録</h1>
                    <p class="auth-subtitle">新しいアカウントを作成します</p>

                    <div class="auth-alert" id="register-alert"></div>

                    <form id="register-form" novalidate>
                        <div class="field">
                            <label class="field-label" for="register-name">ユーザー名</label>
                            <input class="" type="text" id="register-name" name="name" placeholder="例：田中 太郎" autocomplete="name" required />
                            <p class="field-error hidden" data-error-for="name"></p>
                        </div>
                        <div class="field">
                            <label class="field-label" for="register-email">メールアドレス</label>
                            <input class="input" type="email" id="register-email" name="email" placeholder="example@company.com" autocomplete="email" required />
                            <p class="field-error hidden" data-error-for="email"></p>
                        </div>
                        <div class="field">
                            <label class="field-label" for="register-password">パスワード</label>
                            <input class="input" type="password" id="register-password" name="password" placeholder="8文字以上" autocomplete="new-password" required />
                            <p class="field-error-hidden" data-error-for="password"></p>
                        </div>
                        <div class="field">
                            <label class="field-label" for="register-password-confirmation">パスワード(確認用)</label>
                            <input class="input" type="password" id="register-password-confirmation" name="password_confirmation" placeholder="もう一度入力してください" autocomplete="new-password" required />
                        </div>
                        <button class="btn btn-primary btn-black" type="submit" id="register-submit">
                            <span class="btn-label">登録する</span>
                        </button>
                    <form>

                    <p class="auth-footer">
                        既にアカウントをお持ちの方は <a href="#" id="go-to-login">ログイン</a>
                    </p>
                </div>
            </div>
        `;

        document.getElementById("go-to-login").addEventListener("click", (e) => {
            e.preventDefault();
            Auth.renderLogin();
        });

        document.getElementById("register-form").addEventListener("submit", Auth.handleRegister);
    },

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = document.getElementById("login-submit");
        const alertEl = document.getElementById("login-alert");

        clearFieldErrors(form);
        alertEl.classList.remove("is-visible");

        const payload = {
            email: form.email.value.trim(),
            password: form.password.value,
        };

        setButtonLoading(submitBtn, true, "ログイン");

        try {
            const data = await Api.login(payload);
            TokenStore.set(data.token);
            Auth.currentUser = data.user;
            Toast.show("ログインしました");
            await App.startAuthenticated();
        } catch(err) {
            if(err.status === 422) {
                applyFieldErrors(err.errors, form);
            } else {
                alertEl.textContent = err.message;
                alertEl.classList.add("is-visible");
            }
        } finally {
            setButtonLoading(submitBtn, false, "ログイン");
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = document.getElementById("register-submit");
        const alertEl = document.getElementById("register-alert");

        clearFieldErrors(form);
        alertEl.classList.remove("is-visible");

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            password_confirmation: form.password_confirmation.value,
        };

        setButtonLoading(submitBtn, true, "登録する");

        try {
            const data = await Api.register(payload);
            TokenStore.set(data.token);
            Auth.currentUser = data.user;
            Toast.show("登録が完了しました");
            await App.startAuthenticated();
        } catch(err) {
            if(err.status === 422) {
                applyFieldErrors(err.errors, form);
            } else {
                alertEl.textContent = err.message;
                alertEl.classList.add("is-visible");
            }
        } finally {
            setButtonLoading(submitBtn, false, "登録する");
        }
    },

    async logout() {
        try {
            await Api.logout();
        } catch {
            //トークンがすでに無効でも気にせずログイン画面へ戻す
        } finally {
            TokenStore.clear();
            Auth.currentUser = null;
            Auth.renderLogin();
        }
    },
};

/**
 * ボタンをローディング状態にする（連打防止）
 */

function setButtonLoading(button, isLoading, originalLabel) {
    button.disabled = isLoading;
    button.innerHTML = isLoading
        ? `<span class="spinner"></span>`
        : `<span class="btn-label">${originalLabel}</span>`;
}

// 401(トークン失効)を受けたらログイン画面に戻す
window.addEventListener("auth:unauthorized", () => {
    Toast.error("セッションが切れました、再度ログインしてください");
    Auth.renderLogin();
});