const LIFF_ID = "2008341587-r6XPlxxZ";
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

// 20:00〜23:30の時刻オプションを生成（15分単位）
function generateTimeOptions() {
  const timeSelect = $("#time");
  const startHour = 20;
  const startMinute = 0;
  const endHour = 23;
  const endMinute = 30;

  for (let hour = startHour; hour <= endHour; hour++) {
    const maxMinute = (hour === endHour) ? endMinute : 45;
    for (let minute = (hour === startHour ? startMinute : 0); minute <= maxMinute; minute += 15) {
      const timeValue = `${hour}:${minute.toString().padStart(2, '0')}`;
      const option = document.createElement('option');
      option.value = timeValue;
      option.textContent = timeValue;
      timeSelect.appendChild(option);
    }
  }
}

function buildMsg(){
  const v = Object.fromEntries(new FormData(form).entries());

  return `予約日時：${v.date} ${v.time}
予約名：${v.name}
人数：${v.party_size}名`;
}

// デモ用：サンプルデータを自動入力
function fillDemoData() {
  console.log("🎬 デモモード: サンプルデータを自動入力中...");

  const demoData = {
    time: '20:00',
    name: '山田太郎',
    party_size: '4'
  };

  Object.entries(demoData).forEach(([name, value]) => {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) {
      element.value = value;
      console.log(`✓ フィールド設定: ${name} = ${value}`);
    }
  });

  console.log("✅ デモデータの自動入力が完了しました");
}

(async () => {
  try {
    // 時刻オプションを生成
    generateTimeOptions();

    // URL パラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.has('debug');
    const isDemoMode = urlParams.has('demo');

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
        if(element && !element.value.trim()) {
          showFieldError(field);
          hasError = true;
          if (!firstErrorField) firstErrorField = element;
        }
      }

      if (hasError) {
        err.textContent="必須項目を入力してください";
        err.classList.remove('d-none');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
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
