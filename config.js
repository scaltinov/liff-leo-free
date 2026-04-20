const CONFIG = {
  // LINE LIFF ID
  LIFF_ID: "2008341587-cb5hHT3r",

  // イベント情報
  EVENT: {
    TITLE: "Leo 初回予約希望フォーム",
    DATE_DISPLAY: "", // フォームの「日付」欄に表示される値
    YEAR: "",        // n8n等での処理用
    DEADLINE: "", // 予約受付終了時刻
    PHONE: "03-5155-0799",
    MAX_PARTY_SIZE: 3,
    ID_TYPES: ["マイナンバーカード", "運転免許証"],
    // HTMLタグ可（app.js 側で innerHTML として展開）
    NOTE: `姫パス等他社サービスを併用したご予約希望は受け付けておりません。<br>当日のご来店希望で、お急ぎの場合はお手数ですが店舗直通電話📞( <a href="tel:03-5155-0799">03-5155-0799</a> )までお電話をお願いいたします。`
  },

  // 予約時刻の設定
  TIME_SETTINGS: {
    START_HOUR: 20,
    START_MINUTE: 0,
    END_HOUR: 22,
    END_MINUTE: 0,
    INTERVAL: 15, // 分単位
  }
};
