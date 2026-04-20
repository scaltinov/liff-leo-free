const CONFIG = {
  // LINE LIFF ID
  LIFF_ID: "2008341587-cb5hHT3r",

  // イベント情報
  EVENT: {
    TITLE: "Leo 初回来店希望フォーム",
    DATE_DISPLAY: "", // フォームの「日付」欄に表示される値
    YEAR: "",        // n8n等での処理用
    DEADLINE: "", // 来店受付終了時刻
    PHONE: "03-5155-0799",
    MAX_PARTY_SIZE: 6,
    ID_TYPES: ["マイナンバーカード", "運転免許証"],
    // HTMLタグ可（app.js 側で innerHTML として展開）
    NOTE: `姫パス等他社サービスを併用したご来店希望は受け付けておりません。`
  },

  // 来店時刻の設定
  TIME_SETTINGS: {
    START_HOUR: 20,
    START_MINUTE: 0,
    END_HOUR: 22,
    END_MINUTE: 0,
    INTERVAL: 15, // 分単位
  }
};
