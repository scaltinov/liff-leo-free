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
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.min = minDate;
    dateInput.setAttribute('min', minDate);

    // iOS LINE等、min属性が効かないWebView向けのフォールバック
    const dateErrorEl = $('#date-error');
    const validateDate = () => {
      if (dateInput.value && dateInput.value < minDate) {
        showFieldError('date');
        if (dateErrorEl) dateErrorEl.classList.remove('d-none');
      } else {
        clearFieldError('date');
        if (dateErrorEl) dateErrorEl.classList.add('d-none');
      }
    };
    dateInput.addEventListener('input', validateDate);
    dateInput.addEventListener('change', validateDate);
    dateInput.addEventListener('blur', validateDate);
  }

  const partySizeInput = $("#party_size");
  if (partySizeInput) {
    for (let i = 1; i <= CONFIG.EVENT.MAX_PARTY_SIZE; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i}名`;
      if (i === 1) opt.selected = true;
      partySizeInput.appendChild(opt);
    }

    partySizeInput.addEventListener('change', updateAdditionalNames);
    updateAdditionalNames();
  }

  const ageLabel = $('label[for="age_confirm"]');
  if (ageLabel) {
    ageLabel.textContent = `来店日時点で満20歳以上であることに同意`;
  }

  // 1人目の身分証チェックを生成
  const primaryIdChecks = document.querySelector('.id-checks[data-person="1"]');
  if (primaryIdChecks) {
    renderIdChecks(primaryIdChecks, 1);
    updateMeishiForPerson(1, $('#gender')?.value || '女');
  }

  // 注意書きの表示（CONFIG.EVENT.NOTE は HTML 可）
  const noteArea = $("#event-note");
  if (noteArea && CONFIG.EVENT.NOTE) {
    noteArea.innerHTML = CONFIG.EVENT.NOTE;
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

// 身分証チェック群を生成（personIndex=1,2,...）
function renderIdChecks(containerEl, personIndex) {
  const listEl = containerEl.querySelector('.id-type-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  CONFIG.EVENT.ID_TYPES.forEach((type, idx) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    const id = `id_type_${personIndex}_${idx}`;
    div.innerHTML = `
      <input class="form-check-input" type="checkbox" name="id_type_${personIndex}" id="${id}" value="${type}" />
      <label class="form-check-label" for="${id}">${type}</label>
    `;
    listEl.appendChild(div);
  });
}

// 性別に応じて「職場の名刺等」欄の表示と必須状態を切り替え
function updateMeishiForPerson(personIndex, genderValue) {
  const idChecks = document.querySelector(`.id-checks[data-person="${personIndex}"]`);
  if (!idChecks) return;
  const meishiWrap = idChecks.querySelector('.meishi-wrap');
  const meishiInput = idChecks.querySelector(`input[name="meishi_${personIndex}"]`);
  if (!meishiWrap || !meishiInput) return;
  const isMale = genderValue === '男';
  meishiWrap.classList.toggle('d-none', !isMale);
  meishiInput.required = isMale;
  if (!isMale) meishiInput.checked = false;
}

// 性別構成を集計
function computeGenderComposition() {
  const primary = $("#gender");
  const genders = primary ? [primary.value] : [];
  const size = parseInt($("#party_size").value) || 1;
  for (let i = 2; i <= size; i++) {
    const el = $(`#gender_${i}`);
    if (el) genders.push(el.value);
  }
  return {
    hasFemale: genders.includes('女'),
    hasMale: genders.includes('男'),
  };
}

// プラン選択欄の表示・非表示（全員男性なら隠して BUSINESS 固定）
function updatePlanVisibility() {
  const wrap = $("#plan-wrap");
  const planSelect = $("#plan");
  if (!wrap || !planSelect) return;
  const { hasFemale, hasMale } = computeGenderComposition();
  if (hasMale && !hasFemale) {
    wrap.classList.add('d-none');
    planSelect.required = false;
  } else {
    wrap.classList.remove('d-none');
    planSelect.required = true;
  }
  const maleNote = $("#plan-male-note");
  if (maleNote) maleNote.classList.toggle('d-none', !hasMale);
  const specialNote = $("#plan-special-note");
  if (specialNote) {
    const planVisible = !wrap.classList.contains('d-none');
    specialNote.classList.toggle('d-none', !(planVisible && planSelect.value === 'SPECIAL'));
  }
}

// 人数に応じて名前入力欄を動的に生成
function updateAdditionalNames() {
  const container = $("#additional-names-container");
  if (!container) return;

  const size = parseInt($("#party_size").value) || 1;
  container.innerHTML = '';

  // 3名以上の注意書き
  const partySizeNote = $("#party-size-note");
  if (partySizeNote) partySizeNote.classList.toggle('d-none', size < 3);

  // 1人目は「ご予約者様氏名」として入力済み。2人目以降の入力欄を作成
  for (let i = 2; i <= size; i++) {
    const div = document.createElement('div');
    div.className = 'mb-3';
    div.innerHTML = `
      <label class="form-label">同行者 ${i-1} の氏名（本名フルネーム） <span class="text-danger">*</span></label>
      <div class="row g-2">
        <div class="col-auto">
          <select id="gender_${i}" name="gender_${i}" class="form-select" required>
            <option value="女" selected>女</option>
            <option value="男">男</option>
          </select>
        </div>
        <div class="col">
          <input id="name_${i}" name="name_${i}" class="form-control" placeholder="例：佐藤花子" required maxlength="50" />
        </div>
      </div>
      <div class="id-checks mt-2" data-person="${i}">
        <div class="small text-muted mb-1">当日提示可能なご身分証 <span class="text-danger">*</span></div>
        <div class="id-type-list"></div>
        <div class="meishi-wrap d-none">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="meishi_${i}" id="meishi_${i}" value="確認" />
            <label class="form-check-label" for="meishi_${i}">職場の名刺等（職場がわかるもの） <span class="text-danger">*</span></label>
          </div>
        </div>
        <div class="form-text">※有効期限内の原本に限ります</div>
      </div>
    `;
    container.appendChild(div);
    const idChecks = div.querySelector('.id-checks');
    if (idChecks) {
      renderIdChecks(idChecks, i);
      updateMeishiForPerson(i, '女');
    }
  }
  updatePlanVisibility();
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

  const size = parseInt(v.party_size) || 1;

  // 全員の身分証をユニオン（男性がいれば「職場名刺等」も追加、名刺は常に末尾）
  const idSet = new Set();
  for (let i = 1; i <= size; i++) {
    formData.getAll(`id_type_${i}`).forEach(t => idSet.add(t));
    const gender = i === 1 ? v.gender : v[`gender_${i}`];
    if (gender === '男' && formData.get(`meishi_${i}`)) {
      idSet.add('職場名刺等');
    }
  }
  const idTypeText = Array.from(idSet).sort((a, b) => {
    if (a === '職場名刺等') return 1;
    if (b === '職場名刺等') return -1;
    return 0;
  }).join('、');

  // 同行者の名前と性別を取得
  const members = [{ gender: v.gender, name: v.name }];
  for (let i = 2; i <= size; i++) {
    const nextName = v[`name_${i}`];
    const nextGender = v[`gender_${i}`] || '女';
    if (nextName) members.push({ gender: nextGender, name: nextName });
  }

  // 男女混合の場合は 女→男 の順にソート（安定ソート）
  members.sort((a, b) => {
    if (a.gender === b.gender) return 0;
    return a.gender === '女' ? -1 : 1;
  });

  // 男性のみ "(男)" を付与、女性は付けない
  const formatName = (gender, name) => gender === '男' ? `(男)${name}` : name;
  const names = members.map(m => formatName(m.gender, m.name));

  let dateText = v.date || '';
  if (v.date) {
    const d = new Date(v.date);
    if (!isNaN(d)) dateText = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  const { hasFemale, hasMale } = computeGenderComposition();
  let planText;
  if (hasMale && !hasFemale) {
    planText = 'BUSINESS';
  } else if (hasFemale && hasMale) {
    planText = `${v.plan || '通常'},BUSINESS`;
  } else {
    planText = v.plan || '通常';
  }

  return `来店希望日時：${dateText} ${v.time}
名前：${names.join(',')}
人数：${v.party_size}名
希望プラン：${planText}
顔つき身分証：${idTypeText}
撮影同意：${v.photo_consent || '未同意'}
初来店：${v.first_visit || '未確認'}`;
}

// デモ用：サンプルデータを自動入力
function fillDemoData() {
  console.log("🎬 デモモード: サンプルデータを自動入力中...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const demoDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const baseData = {
    date: demoDate,
    time: `${CONFIG.TIME_SETTINGS.START_HOUR}:${CONFIG.TIME_SETTINGS.START_MINUTE.toString().padStart(2, '0')}`,
    gender: '女',
    name: '山田花子',
    party_size: CONFIG.EVENT.MAX_PARTY_SIZE.toString(),
    age_confirm: true,
    photo_consent: true,
    first_visit: true
  };

  Object.entries(baseData).forEach(([name, value]) => {
    const element = document.querySelector(`[name="${name}"]`);
    if (!element) return;
    if (element.type === 'checkbox') element.checked = value;
    else element.value = value;
  });

  // 人数に応じて同行者欄を生成してからダミーデータを流し込む
  updateAdditionalNames();

  for (let i = 2; i <= CONFIG.EVENT.MAX_PARTY_SIZE; i++) {
    const genderEl = $(`#gender_${i}`);
    if (genderEl) genderEl.value = '男';
    const nameEl = $(`#name_${i}`);
    if (nameEl) nameEl.value = `同行者${i-1}太郎`;
  }

  // 各メンバーの身分証を1つチェック、男性は名刺もチェック
  for (let i = 1; i <= CONFIG.EVENT.MAX_PARTY_SIZE; i++) {
    const firstIdType = document.querySelector(`[name="id_type_${i}"]`);
    if (firstIdType) firstIdType.checked = true;
    const gender = i === 1 ? '女' : '男';
    updateMeishiForPerson(i, gender);
    if (gender === '男') {
      const meishi = document.querySelector(`[name="meishi_${i}"]`);
      if (meishi) meishi.checked = true;
    }
  }

  updatePlanVisibility();
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
        console.log("⏰ 期限切れ - クローズメッセージを表示");
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

    // エラークリア処理（日付欄は validateDate で管理するため除外）
    document.addEventListener('input', function(e) {
      if (e.target.matches('input, textarea, select') && e.target.classList.contains('is-invalid') && e.target.name !== 'date') {
        clearFieldError(e.target.name);
      }
    });

    document.addEventListener('change', function(e) {
      if (e.target.matches('input, textarea, select') && e.target.classList.contains('is-invalid') && e.target.name !== 'date') {
        clearFieldError(e.target.name);
      }
    });

    // 氏名欄のスペースを自動除去（半角・全角）
    form.addEventListener('focusout', function(e) {
      if (e.target.matches && e.target.matches('input[name^="name"]')) {
        e.target.value = e.target.value.replace(/[\s\u3000]/g, '');
      }
    });

    // 性別・プラン変更時にプラン欄と名刺欄の表示を更新
    form.addEventListener('change', function(e) {
      if (!e.target.matches) return;
      if (e.target.matches('select[name="gender"], select[name^="gender_"]')) {
        const name = e.target.name;
        const personIndex = name === 'gender' ? 1 : parseInt(name.split('_')[1], 10);
        updateMeishiForPerson(personIndex, e.target.value);
        updatePlanVisibility();
      } else if (e.target.matches('select[name="plan"]')) {
        updatePlanVisibility();
      }
    });

    btn.addEventListener("click", async ()=>{
      err.classList.add('d-none');
      ok.classList.add('d-none');
      clearAllErrors();

      let hasError = false;
      let firstErrorField = null;

      // 必須項目チェック
      const requiredFields = ['date', 'time', 'name', 'party_size'];
      
      // 同行者の名前も必須項目に追加
      const size = parseInt($('[name="party_size"]').value) || 1;
      for (let i = 2; i <= size; i++) {
        requiredFields.push(`name_${i}`);
      }

      for(let field of requiredFields) {
        const element = $(`[name="${field}"]`);
        if(element) {
          if (!element.value.trim()) {
            showFieldError(field);
            hasError = true;
            if (!firstErrorField) firstErrorField = element;
          } else if (field === 'date' && element.min && element.value < element.min) {
            showFieldError(field);
            const dateErrorEl = $('#date-error');
            if (dateErrorEl) dateErrorEl.classList.remove('d-none');
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

      // 身分証チェック（メンバーごと、男性は名刺も必須）
      for (let i = 1; i <= size; i++) {
        const container = document.querySelector(`.id-checks[data-person="${i}"]`);
        const parent = container ? container.closest('.mb-3') : null;
        const ids = document.querySelectorAll(`[name="id_type_${i}"]`);
        const hasId = Array.from(ids).some(cb => cb.checked);
        if (!hasId) {
          if (parent) {
            parent.classList.add('has-error');
            if (!firstErrorField) firstErrorField = parent;
          }
          hasError = true;
        }
        const genderEl = i === 1 ? $('#gender') : $(`#gender_${i}`);
        if (genderEl && genderEl.value === '男') {
          const meishi = $(`[name="meishi_${i}"]`);
          if (!meishi || !meishi.checked) {
            if (parent) {
              parent.classList.add('has-error');
              if (!firstErrorField) firstErrorField = parent;
            }
            hasError = true;
          }
        }
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

      // 初来店確認チェック
      const firstVisitCheckbox = $('[name="first_visit"]');
      if (!firstVisitCheckbox || !firstVisitCheckbox.checked) {
        const parent = firstVisitCheckbox ? firstVisitCheckbox.closest('.mb-3') : null;
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
              {type:"text",text:"[来店希望フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
            setTimeout(()=>{ try{liff.closeWindow();}catch(_){} },600);
          }else if(liff.isApiAvailable('shareTargetPicker')){
            await liff.shareTargetPicker([
              {type:"text",text},
              {type:"text",text:"[来店希望フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
          }else{
            err.textContent="LINEアプリ内で開いてください";
            err.classList.remove('d-none');
          }
        }
      }catch(e){ err.textContent="送信失敗: "+e.message; err.classList.remove('d-none'); }
      btn.disabled=false; btn.textContent="内容を送信";
    });
  }catch(e){ logd("init_error: "+e.message); err.textContent="LIFF初期化失敗: "+e.message; err.classList.remove('d-none'); }
})();
