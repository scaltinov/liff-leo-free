// LINEメッセージのパース（予約フォーム対応版）
const messageText = $('Check if Template').item.json.messageText;
const userId = $('Extract Basic Info').item.json.userId;
const timestamp = $('Extract Basic Info').item.json.timestamp;

// 予約フォームのテンプレートをパース
const parseReservation = (text) => {
  const data = {
    userId: userId,
    timestamp: timestamp,
    rawMessage: text,
    parsed: {}
  };

  // 全ての項目を初期化
  const allFields = [
    '予約日時', '予約名', '人数', '身分証', '年齢確認'
  ];

  // 全項目を空文字で初期化
  for (const field of allFields) {
    data.parsed[field] = "";
  }

  // 行ごとに分割してからパース
  const lines = text.split(/\r?\n/);

  console.log("=== 行ごと分析 ===");
  console.log("Total lines:", lines.length);
  console.log("Initialized fields:", allFields.length);

  // 各行をチェックして項目を抽出
  const patterns = {
    予約日時: /^.*予約日時[：:：]?\s*(.*?)$/,
    予約名: /^.*予約名[：:：]?\s*(.*?)$/,
    人数: /^.*人数[：:：]?\s*(.*?)$/,
    身分証: /^.*身分証[：:：]?\s*(.*?)$/,
    年齢確認: /^.*年齢確認[：:：]?\s*(.*?)$/
  };

  // 各行をチェック
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Line ${i}:`, JSON.stringify(line));

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = line.match(pattern);
      if (match) {
        const rawValue = match[1];
        const trimmedValue = rawValue.trim();

        console.log(`  Found ${key}:`);
        console.log("    Raw:", JSON.stringify(rawValue));
        console.log("    Trimmed:", JSON.stringify(trimmedValue));
        console.log("    Length:", trimmedValue.length);

        // 値がある場合のみ設定
        if (trimmedValue.length > 0) {
          data.parsed[key] = trimmedValue;
          console.log("    → Updated with value");
        }
        break; // マッチしたら次の行へ
      }
    }
  }

  // 予約日時をNotionの日付形式に変換
  const yoyakuDateTime = data.parsed['予約日時'];
  data.notionDateTime = null;

  if (yoyakuDateTime && yoyakuDateTime.length > 0) {
    // パターン：「11/8 20:00」を解析
    const dateTimeMatch = yoyakuDateTime.match(/(\d{1,2})\/(\d{1,2})\s+(\d{2}):(\d{2})/);

    if (dateTimeMatch) {
      const month = dateTimeMatch[1];
      const day = dateTimeMatch[2];
      const hour = dateTimeMatch[3];
      const minute = dateTimeMatch[4];

      // 2025年を想定（イベント日付から）、ISO 8601形式の日時で統合
      const isoDateTime = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:00`;

      data.notionDateTime = isoDateTime;

      console.log("Converted to Notion format:");
      console.log("  DateTime (ISO 8601):", isoDateTime);
    }
  }

  // 身分証をマルチセレクト配列に変換
  const idTypes = data.parsed['身分証'];
  data.idTypesArray = [];

  if (idTypes && idTypes.length > 0) {
    // カンマまたは「、」で分割
    const idArray = idTypes.split(/[,、]/).map(id => id.trim()).filter(id => id.length > 0);

    // 有効な身分証タイプのマッピング
    const validIdTypes = {
      'マイナンバーカード': { name: 'マイナンバーカード' },
      '運転免許証': { name: '運転免許証' },
      '住基カード': { name: '住基カード' }
    };

    // 各身分証をマッピング
    for (const id of idArray) {
      for (const [key, value] of Object.entries(validIdTypes)) {
        if (id.includes(key) || key.includes(id)) {
          if (!data.idTypesArray.includes(value.name)) {
            data.idTypesArray.push(value.name);
          }
          break;
        }
      }
    }

    console.log("Converted ID types to array:", data.idTypesArray);
  }

  // タイトル生成ロジック
  const yoyakuName = data.parsed['予約名'] || '';
  const yoyakuTime = data.parsed['予約日時'] || '';

  let title = '';

  if (yoyakuName && yoyakuTime) {
    title = `${yoyakuName}様 ${yoyakuTime}`;
  } else if (yoyakuName) {
    title = `${yoyakuName}様`;
  } else if (yoyakuTime) {
    title = yoyakuTime;
  } else {
    title = `予約_${new Date().toLocaleDateString('ja-JP')}`;
  }

  data.title = title;

  console.log("=== 最終パース結果 ===");
  console.log("Parsed data:", JSON.stringify(data.parsed, null, 2));
  console.log("ID Types Array:", JSON.stringify(data.idTypesArray, null, 2));
  console.log("Generated title:", title);

  return data;
};

return parseReservation(messageText);
