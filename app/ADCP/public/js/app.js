/* ===========================================
   アプリ全体の初期化処理
=========================================== */

const App = {
    /**
   * アプリ起動時の処理
   * トークンの有無を確認し、ログイン済みならホーム画面、
   * 未ログインならログイン画面を表示する
   */

    async init() {
        if(!TokenStore.has()) {
            Auth.renderLogin();
            return;
        }

        try {
            const user = await Api.me();
            Auth.currentUser = user;
            await App.startAuthenticated();
        } catch {
            //トークンが無効だった場合はログイン画面へ
            TokenStore.clear();
            Auth.renderLogin();
        }
    },

    /**
   * ログイン成功後の画面遷移　（※今は仮実装の段階）
   * ※ ホーム画面の実装はこの後のステップで追加予定
   */

    async startAuthenticated() {
        await Home.render();
    },
};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});