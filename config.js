const CONFIG = {
  // LINE LIFF ID
  LIFF_ID: "2008341587-r6XPlxxZ",

  // イベント情報
  EVENT: {
    TITLE: "Leo/Lillion/SiVAH 3店舗合同初回限定営業 予約フォーム",
    DATE_DISPLAY: "2/16", // フォームの「日付」欄に表示される値
    YEAR: "2026",        // n8n等での処理用
    DEADLINE: "2026-02-16T20:00:00+09:00", // 予約受付終了時刻
    PHONE: "03-5155-0799",
    MAX_PARTY_SIZE: 2,
    ID_TYPES: ["マイナンバーカード", "運転免許証"],
    NOTE: "【重要】当日のご予約は40組様限定となります。\n混雑状況により、ご予約時間にご来店いただいた場合でもお待ちいただく可能性がございます。\nなお、限定数（40組）を超過した場合は、弊店より改めてご連絡させていただきます。何卒ご了承ください。"
  },

  // 予約時刻の設定
  TIME_SETTINGS: {
    START_HOUR: 20,
    START_MINUTE: 0,
    END_HOUR: 23,
    END_MINUTE: 0,
    INTERVAL: 15, // 分単位
  }
};
