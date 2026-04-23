// LINEメッセージのパース（来店フォーム対応版）
const messageText = $('Check if Template').item.json.messageText;
const userId = $('Extract Basic Info').item.json.userId;
const timestamp = $('Extract Basic Info').item.json.timestamp;

// 来店フォームのテンプレートをパース
const parseReservation = (text) => {
  const data = {
    userId: userId,
    timestamp: timestamp,
    rawMessage: text,
    parsed: {}
  };

  // 全ての項目を初期化
  const allFields = [
    '来店希望日時', '名前', '人数', '希望プラン', '身分証', '撮影同意', '初来店'
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
    来店希望日時: /^.*来店希望日時[：:：]?\s*(.*?)$/,
    名前: /^.*名前[：:：]?\s*(.*?)$/,
    人数: /^.*人数[：:：]?\s*(.*?)$/,
    希望プラン: /^.*希望プラン[：:：]?\s*(.*?)$/,
    身分証: /^.*身分証[：:：]?\s*(.*?)$/,
    撮影同意: /^.*撮影同意[：:：]?\s*(.*?)$/,
    初来店: /^.*初来店[：:：]?\s*(.*?)$/
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
          // 人数の場合は数字に変換
          if (key === '人数') {
            const numberValue = parseInt(trimmedValue, 10);
            if (!isNaN(numberValue)) {
              data.parsed[key] = numberValue;
              console.log("    → Updated with numeric value:", numberValue);
            }
          } else {
            data.parsed[key] = trimmedValue;
            console.log("    → Updated with value");
          }
        }
        break; // マッチしたら次の行へ
      }
    }
  }

  // 来店希望日時をNotionの日付形式に変換
  const yoyakuDateTime = data.parsed['来店希望日時'];
  data.notionDateTime = null;

  if (yoyakuDateTime && yoyakuDateTime.length > 0) {
    // パターン：「2026/4/22 20:00」を解析
    const dateTimeMatch = yoyakuDateTime.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);

    if (dateTimeMatch) {
      const year = dateTimeMatch[1];
      const month = dateTimeMatch[2];
      const day = dateTimeMatch[3];
      const hour = dateTimeMatch[4];
      const minute = dateTimeMatch[5];

      // ISO 8601形式の日時で統合
      const isoDateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:00`;

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
      '職場名刺等': { name: '職場名刺等' },
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

  // 希望プランをマルチセレクト配列に変換（「SPECIAL,BUSINESS」等をカンマ分割）
  const plans = data.parsed['希望プラン'];
  data.plansArray = [];

  if (plans && plans.length > 0) {
    const planArray = plans.split(/[,、]/).map(p => p.trim()).filter(p => p.length > 0);
    const validPlans = ['通常', 'SPECIAL', 'BUSINESS'];

    for (const p of planArray) {
      if (validPlans.includes(p) && !data.plansArray.includes(p)) {
        data.plansArray.push(p);
      }
    }

    console.log("Converted plans to array:", data.plansArray);
  }

  // タイトル生成ロジック
  const yoyakuName = data.parsed['名前'] || '';
  const yoyakuTime = data.parsed['来店希望日時'] || '';

  let title = '';

  if (yoyakuName && yoyakuTime) {
    title = `${yoyakuName}様 ${yoyakuTime}`;
  } else if (yoyakuName) {
    title = `${yoyakuName}様`;
  } else if (yoyakuTime) {
    title = yoyakuTime;
  } else {
    title = `来店_${new Date().toLocaleDateString('ja-JP')}`;
  }

  data.title = title;

  console.log("=== 最終パース結果 ===");
  console.log("Parsed data:", JSON.stringify(data.parsed, null, 2));
  console.log("ID Types Array:", JSON.stringify(data.idTypesArray, null, 2));
  console.log("Plans Array:", JSON.stringify(data.plansArray, null, 2));
  console.log("Generated title:", title);

  return data;
};

return parseReservation(messageText);
