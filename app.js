const LIFF_ID = CONFIG.LIFF_ID;
const $ = (s)=>document.querySelector(s);
const form = $("#form"), btn=$("#submit"), ok=$("#ok"), err=$("#error"), diag=$("#diag");

function logd(obj){
  // デバッグモードの時のみ表示
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.has('debug');

  if (isDebugMode) {
    diag.classList.remove('d-none');
    diag.textContent = typeof obj==='string'?obj:JSON.stringify(obj,null,2);
  }
}

// UIの初期化
function initUI() {
  document.title = CONFIG.EVENT.TITLE;
  const h1 = $("h1");
  if (h1) h1.textContent = CONFIG.EVENT.TITLE;

  const dateInput = $("#date");
  if (dateInput) dateInput.value = CONFIG.EVENT.DATE_DISPLAY;

  const partySizeInput = $("#party_size");
  if (partySizeInput) {
    partySizeInput.max = CONFIG.EVENT.MAX_PARTY_SIZE;
    
    // 値が変更された際の制約追加
    partySizeInput.addEventListener('input', function() {
      if (this.value > CONFIG.EVENT.MAX_PARTY_SIZE) {
        this.value = CONFIG.EVENT.MAX_PARTY_SIZE;
      }
    });

    if (parseInt(partySizeInput.value) > CONFIG.EVENT.MAX_PARTY_SIZE) {
      partySizeInput.value = CONFIG.EVENT.MAX_PARTY_SIZE;
    }
  }

  const ageLabel = $('label[for="age_confirm"]');
  if (ageLabel) {
    ageLabel.textContent = `${CONFIG.EVENT.YEAR}年${CONFIG.EVENT.DATE_DISPLAY}日時点で満20歳以上であることに同意`;
  }

  // 身分証の選択肢を生成
  const idContainer = $("#id-types-container");
  if (idContainer) {
    idContainer.innerHTML = '';
    CONFIG.EVENT.ID_TYPES.forEach((type, index) => {
      const div = document.createElement('div');
      div.className = 'form-check';
      const id = `id_type_${index}`;
      div.innerHTML = `
        <input class="form-check-input" type="checkbox" name="id_type" id="${id}" value="${type}" />
        <label class="form-check-label" for="${id}">${type}</label>
      `;
      idContainer.appendChild(div);
    });
  }

  // 注意書きの表示
  const noteArea = $("#event-note");
  if (noteArea && CONFIG.EVENT.NOTE) {
    noteArea.textContent = CONFIG.EVENT.NOTE;
    noteArea.classList.remove('d-none');
  }

  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.href = `tel:${CONFIG.EVENT.PHONE.replace(/-/g, '')}`;
    if (link.textContent.includes('03-')) {
      link.textContent = CONFIG.EVENT.PHONE;
    }
  });
  
  const phoneText = $("#closed-message p:nth-child(3)");
  if (phoneText && phoneText.textContent.includes('03-')) {
     const phoneLink = phoneText.querySelector('a');
     if (phoneLink) {
       phoneLink.href = `tel:${CONFIG.EVENT.PHONE.replace(/-/g, '')}`;
       phoneLink.textContent = CONFIG.EVENT.PHONE;
     }
  }
}

// バリデーションエラー表示用のヘルパー関数
function showFieldError(fieldName) {
  const element = $(`[name="${fieldName}"]`);
  if (!element) return;

  element.classList.add('is-invalid');
  const parent = element.closest('.mb-3');
  if (parent) {
    parent.classList.add('has-error');
  }
}

function clearFieldError(fieldName) {
  const element = $(`[name="${fieldName}"]`);
  if (!element) return;

  element.classList.remove('is-invalid');
  const parent = element.closest('.mb-3');
  if (parent) {
    parent.classList.remove('has-error');
  }
}

function clearAllErrors() {
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

// 時刻オプションを生成
function generateTimeOptions() {
  const timeSelect = $("#time");
  const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE, INTERVAL } = CONFIG.TIME_SETTINGS;

  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const maxMinute = (hour === END_HOUR) ? END_MINUTE : 59;
    for (let minute = (hour === START_HOUR ? START_MINUTE : 0); minute <= maxMinute; minute += INTERVAL) {
      const timeValue = `${hour}:${minute.toString().padStart(2, '0')}`;
      const option = document.createElement('option');
      option.value = timeValue;
      option.textContent = timeValue;
      timeSelect.appendChild(option);
    }
  }
}

function buildMsg(){
  const formData = new FormData(form);
  const v = Object.fromEntries(formData.entries());

  // チェックボックスの複数値を取得
  const idTypes = formData.getAll('id_type');
  const idTypeText = idTypes.length > 0 ? idTypes.join('、') : '';

  return `予約日時：${v.date} ${v.time}
予約名：${v.name}
人数：${v.party_size}名
顔つき身分証：${idTypeText}
撮影同意：${v.photo_consent || '未同意'}`;
}

// デモ用：サンプルデータを自動入力
function fillDemoData() {
  console.log("🎬 デモモード: サンプルデータを自動入力中...");

  const demoData = {
    time: `${CONFIG.TIME_SETTINGS.START_HOUR}:${CONFIG.TIME_SETTINGS.START_MINUTE.toString().padStart(2, '0')}`,
    name: '山田太郎',
    party_size: CONFIG.EVENT.MAX_PARTY_SIZE.toString(),
    age_confirm: true,
    photo_consent: true
  };

  Object.entries(demoData).forEach(([name, value]) => {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        element.value = value;
      }
      console.log(`✓ フィールド設定: ${name} = ${value}`);
    }
  });

  console.log("✅ デモデータの自動入力が完了しました");
}

// 予約受付期限をチェック
function checkReservationDeadline() {
  const deadlineDate = new Date(CONFIG.EVENT.DEADLINE);
  const currentDate = new Date();

  console.log("Deadline:", deadlineDate.toLocaleString('ja-JP'));
  console.log("Current:", currentDate.toLocaleString('ja-JP'));
  console.log("Is expired:", currentDate > deadlineDate);

  return currentDate > deadlineDate;
}

(async () => {
  try {
    // UIの初期化
    initUI();

    // URL パラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.has('debug');
    const isDemoMode = urlParams.has('demo');
    const showClosedMode = urlParams.has('closed'); // テスト用: クローズメッセージ強制表示

    // 予約受付期限チェック
    const isExpired = checkReservationDeadline();

    // デバッグモード以外で期限切れ、または showClosedMode が有効な場合
    if ((isExpired && !isDebugMode) || showClosedMode) {
      // フォームを非表示、クローズメッセージを表示
      form.classList.add('d-none');
      if (btn.closest('.fixed-bottom-button')) {
        btn.closest('.fixed-bottom-button').classList.add('d-none');
      }
      $("#closed-message").classList.remove('d-none');

      if (showClosedMode) {
        console.log("🧪 テストモード - クローズメッセージを強制表示");
      } else {
        console.log("⏰ 予約受付期限切れ - クローズメッセージを表示");
      }
      return;
    }

    // 時刻オプションを生成
    generateTimeOptions();

    // デバッグモード時はLIFF初期化を無効化
    if (!isDebugMode) {
      await liff.init({ liffId: LIFF_ID });
      logd({ inClient:liff.isInClient(), loggedIn:liff.isLoggedIn() });
      if(!liff.isLoggedIn()) liff.login();
    } else {
      console.log("🔧 デバッグモード: LIFF初期化をスキップしています");
    }

    // デモモード時にサンプルデータを自動入力
    if (isDemoMode) {
      console.log("🎬 デモモードが有効です。サンプルデータを入力します...");
      setTimeout(() => {
        fillDemoData();
      }, 100);
    }

    // エラークリア処理
    document.addEventListener('input', function(e) {
      if (e.target.matches('input, textarea, select') && e.target.classList.contains('is-invalid')) {
        clearFieldError(e.target.name);
      }
    });

    document.addEventListener('change', function(e) {
      if (e.target.matches('input, textarea, select') && e.target.classList.contains('is-invalid')) {
        clearFieldError(e.target.name);
      }
    });

    btn.addEventListener("click", async ()=>{
      err.classList.add('d-none');
      ok.classList.add('d-none');
      clearAllErrors();

      let hasError = false;
      let firstErrorField = null;

      // 必須項目チェック
      const requiredFields = ['time', 'name', 'party_size'];
      for(let field of requiredFields) {
        const element = $(`[name="${field}"]`);
        if(element) {
          if (!element.value.trim()) {
            showFieldError(field);
            hasError = true;
            if (!firstErrorField) firstErrorField = element;
          } else if (field === 'party_size') {
            const size = parseInt(element.value);
            if (isNaN(size) || size < 1 || size > CONFIG.EVENT.MAX_PARTY_SIZE) {
              showFieldError(field);
              hasError = true;
              if (!firstErrorField) firstErrorField = element;
            }
          }
        }
      }

      // 身分証チェック（複数選択必須）
      const idCheckboxes = document.querySelectorAll('[name="id_type"]');
      const isIdChecked = Array.from(idCheckboxes).some(cb => cb.checked);
      if (!isIdChecked) {
        // 最初のチェックボックスの親要素にエラーを表示
        const firstIdCheckbox = idCheckboxes[0];
        if (firstIdCheckbox) {
          const parent = firstIdCheckbox.closest('.mb-3');
          if (parent) {
            parent.classList.add('has-error');
            if (!firstErrorField) {
              firstErrorField = parent;
            }
          }
        }
        hasError = true;
      }

      // 年齢確認チェック
      const ageConfirmCheckbox = $('[name="age_confirm"]');
      if (!ageConfirmCheckbox || !ageConfirmCheckbox.checked) {
        const parent = ageConfirmCheckbox ? ageConfirmCheckbox.closest('.mb-3') : null;
        if (parent) {
          parent.classList.add('has-error');
          if (!firstErrorField) {
            firstErrorField = parent;
          }
        }
        hasError = true;
      }

      // 撮影同意チェック
      const photoConsentCheckbox = $('[name="photo_consent"]');
      if (!photoConsentCheckbox || !photoConsentCheckbox.checked) {
        const parent = photoConsentCheckbox ? photoConsentCheckbox.closest('.mb-3') : null;
        if (parent) {
          parent.classList.add('has-error');
          if (!firstErrorField) {
            firstErrorField = parent;
          }
        }
        hasError = true;
      }

      if (hasError) {
        err.textContent="必須項目を入力してください";
        err.classList.remove('d-none');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof firstErrorField.focus === 'function') firstErrorField.focus();
        }
        return;
      }

      const text=buildMsg();
      btn.disabled=true; btn.textContent="送信中…";
      try{
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentIsDebugMode = currentUrlParams.has('debug');
        const currentIsDemoMode = currentUrlParams.has('demo');

        if (currentIsDebugMode || currentIsDemoMode) {
          console.group("📝 フォーム送信内容");
          console.log("📄 送信予定のメッセージ:");
          console.log("%c" + text, "background: #e3f2fd; padding: 8px; border-radius: 4px; font-family: monospace; white-space: pre-line;");
          console.log("📊 フォームデータ:");
          const formData = new FormData(form);
          const formValues = Object.fromEntries(formData.entries());
          console.table(formValues);
          console.groupEnd();

          if (currentIsDemoMode) {
            const diagElement = document.getElementById('diag');
            if (diagElement) {
              diagElement.classList.remove('d-none');
              diagElement.innerHTML = `
                <strong>🎬 デモモード送信結果:</strong><br>
                <strong>パラメータ:</strong> ${window.location.search}<br>
                <strong>デバッグモード:</strong> ${currentIsDebugMode ? 'ON' : 'OFF'}<br>
                <strong>LIFF初期化:</strong> ${currentIsDebugMode ? 'スキップ' : '実行済み'}<br>
                <strong>送信方法:</strong> ${currentIsDebugMode ? 'コンソールのみ' : 'LIFF送信'}<br>
                <hr>
                <strong>送信メッセージ:</strong><br>
                <pre style="background:#f8f9fa; padding:8px; border-radius:4px; font-size:12px;">${text}</pre>
              `;
            }
          }

          ok.classList.remove('d-none');

          if (currentIsDebugMode) {
            return;
          }
        }

        // 通常モード または デモモード：実際にLIFFで送信
        if (!currentIsDebugMode) {
          if(liff.isInClient()){
            await liff.sendMessages([
              {type:"text",text},
              {type:"text",text:"[予約フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
            setTimeout(()=>{ try{liff.closeWindow();}catch(_){} },600);
          }else if(liff.isApiAvailable('shareTargetPicker')){
            await liff.shareTargetPicker([
              {type:"text",text},
              {type:"text",text:"[予約フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
          }else{
            err.textContent="LINEアプリ内で開いてください";
            err.classList.remove('d-none');
          }
        }
      }catch(e){ err.textContent="送信失敗: "+e.message; err.classList.remove('d-none'); }
      btn.disabled=false; btn.textContent="予約内容を送信";
    });
  }catch(e){ logd("init_error: "+e.message); err.textContent="LIFF初期化失敗: "+e.message; err.classList.remove('d-none'); }
})();
