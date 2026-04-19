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
    NOTE: "ご予約が集中した場合、ご希望の日時を変更いただくようお願いすることがございます。あらかじめご了承ください。"
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
