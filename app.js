const LIFF_ID = "2008169967-p3vmNKQg";
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
  console.log(`showFieldError呼び出し: ${fieldName}`); // デバッグログ
  const element = $(`[name="${fieldName}"]`);
  if (!element) {
    console.log(`要素が見つかりません: ${fieldName}`);
    return;
  }

  console.log(`エラー表示設定中: ${fieldName}`, element); // デバッグログ

  // フィールドにエラースタイルを追加
  element.classList.add('is-invalid');

  // 親のmb-3要素にエラースタイルを追加
  const parent = element.closest('.mb-3');
  if (parent) {
    parent.classList.add('has-error');
    console.log(`親要素にhas-errorクラス追加: ${fieldName}`, parent);
    console.log(`親要素のクラス一覧:`, parent.className);

    // 経験詳細フィールド内の場合、特別なクラスも追加
    const experienceContainer = element.closest('#experience_fields');
    if (experienceContainer) {
      parent.classList.add('experience-field-error');
      experienceContainer.classList.add('has-errors');
      console.log(`経験詳細フィールド内のエラー強調: ${fieldName}`);
      console.log(`experience_fieldsにhas-errorsクラス追加`);
    }
  } else {
    console.log(`親要素(.mb-3)が見つかりません: ${fieldName}`);
  }

  // ラジオボタンの場合は特別処理
  if (element.type === 'radio') {
    const radioGroup = document.querySelectorAll(`[name="${fieldName}"]`);
    radioGroup.forEach(radio => {
      const checkDiv = radio.closest('.form-check');
      if (checkDiv) {
        checkDiv.classList.add('is-invalid');
      }
    });
  }
}

function clearFieldError(fieldName) {
  const element = $(`[name="${fieldName}"]`);
  if (!element) return;

  // フィールドからエラースタイルを削除
  element.classList.remove('is-invalid');

  // 親のmb-3要素からエラースタイルを削除
  const parent = element.closest('.mb-3');
  if (parent) {
    parent.classList.remove('has-error');
    parent.classList.remove('experience-field-error');

    // 経験詳細フィールド内の場合、コンテナからもクラスを削除
    const experienceContainer = element.closest('#experience_fields');
    if (experienceContainer) {
      // 他にエラーがないかチェックして、なければhas-errorsクラスを削除
      const hasOtherErrors = experienceContainer.querySelectorAll('.has-error').length > 1;
      if (!hasOtherErrors) {
        experienceContainer.classList.remove('has-errors');
      }
    }
  }

  // ラジオボタンの場合は特別処理
  if (element.type === 'radio') {
    const radioGroup = document.querySelectorAll(`[name="${fieldName}"]`);
    radioGroup.forEach(radio => {
      const checkDiv = radio.closest('.form-check');
      if (checkDiv) {
        checkDiv.classList.remove('is-invalid');
      }
    });
  }
}

function clearAllErrors() {
  // すべてのエラースタイルをクリア
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.experience-field-error').forEach(el => el.classList.remove('experience-field-error'));
  document.querySelectorAll('.has-errors').forEach(el => el.classList.remove('has-errors'));
}

// デバッグ用：経験詳細フィールドのエラー表示をテスト
function testExperienceFieldError() {
  console.log("=== 経験詳細フィールドエラーテスト開始 ===");
  const testFields = ['store_name', 'experience_years', 'employment_status'];

  testFields.forEach(fieldName => {
    console.log(`テスト対象: ${fieldName}`);
    const element = document.querySelector(`[name="${fieldName}"]`);
    console.log(`要素存在: ${!!element}`, element);

    if (element) {
      const parent = element.closest('.mb-3');
      console.log(`親要素(.mb-3): ${!!parent}`, parent);

      // テスト用にエラースタイルを強制適用
      element.classList.add('is-invalid');
      if (parent) parent.classList.add('has-error');

      console.log(`クラス適用後 - is-invalid: ${element.classList.contains('is-invalid')}`);
      console.log(`クラス適用後 - has-error: ${parent ? parent.classList.contains('has-error') : 'N/A'}`);
    }
  });

  console.log("=== テスト終了 ===");
}

// ページ読み込み後にテスト関数を利用可能にする
window.testExperienceFieldError = testExperienceFieldError;

// より簡単なテスト：経験詳細フィールドを強制的に表示してエラー状態にする
window.forceShowExperienceError = function() {
  console.log("=== 経験詳細フィールドを強制表示＆エラー状態にするテスト（新実装） ===");

  // 1. 経験詳細フィールドを表示
  const expFields = document.getElementById('experience_fields');
  if (expFields) {
    expFields.classList.remove('d-none');
    console.log("経験詳細フィールドを表示しました");
  }

  // 2. 各必須フィールドにエラー表示を適用（新実装版）
  const requiredFields = ['store_name', 'experience_years', 'employment_status'];
  requiredFields.forEach(fieldName => {
    console.log(`\n=== ${fieldName}のエラー表示処理（新実装） ===`);
    showFieldError(fieldName);

    // 適用されたクラスを確認
    const element = document.querySelector(`[name="${fieldName}"]`);
    if (element) {
      const parent = element.closest('.mb-3');
      console.log("要素のクラス:", element.className);
      if (parent) {
        console.log("親要素のクラス:", parent.className);
      }
    }
  });

  // 3. experience_fieldsコンテナの状態も確認
  console.log("experience_fieldsコンテナのクラス:", expFields ? expFields.className : "見つからない");

  console.log("=== テスト完了 - 赤い枠と背景色が表示されているか確認してください ===");
};

function buildMsg(){
  const v = Object.fromEntries(new FormData(form).entries());

  // 媒体を取得（一時的に単一選択、将来的に複数選択に戻す可能性あり）
  const selectedMedia = v.media_source ? [v.media_source] : [];
  const mediaText = buildMediaText(selectedMedia, v);

  // 希望職種テキストを構築
  const jobTypeText = v.job_type === 'その他' && v.job_other
    ? `${v.job_type}(${v.job_other})`
    : v.job_type || '';

  // 寮希望の処理
  const dormitoryText = v.job_type === 'レギュラー' ? (v.dormitory || '') : '';

  // 経験詳細部分を構築
  const experienceSection = v.experience === '有り' ?
    buildExperienceSection(v) : '';

  return `希望源氏名：${v.stage_name || ''}
本名：${v.real_name || ''}
よみがな：${v.kana || ''}
電話番号：${v.phone || ''}
年齢：${v.age || ''}
現所在地：${v.location || ''}
現職：${v.current_job || ''}
経験有無：${v.experience || ''}
${experienceSection} 

Leoを知った媒体：${mediaText}
希望職種：${jobTypeText}
寮希望：${dormitoryText}
勤務開始希望日：${v.start_date || ''}
志望動機：${v.motivation || ''}

親の承諾：${v.parent_consent || ''}
身分証：${v.id_document || ''}
住民票準備：${v.resident_card || ''}
面接希望日時：${v.interview_date || ''}`;
}

// 媒体情報を構築するヘルパー関数
function buildMediaText(selectedMedia, formValues) {
  if (selectedMedia.length === 0) return '';

  let mediaText = selectedMedia.join('/');

  if (selectedMedia.includes('その他') && formValues.media_other) {
    mediaText += `(その他: ${formValues.media_other})`;
  }

  if (selectedMedia.includes('紹介') && formValues.media_referral) {
    mediaText += `(紹介者: ${formValues.media_referral})`;
  }

  return mediaText;
}

// 経験詳細セクションを構築するヘルパー関数
function buildExperienceSection(formValues) {
  return `~~~~~~~~~~~~~~~
店舗名：${formValues.store_name || ''}
経験年数：${formValues.experience_years || ''}
在籍状況：${formValues.employment_status || ''}
現在のAVG月間総売：${formValues.avg_sales || ''}
MAX月間総売：${formValues.max_sales || ''}
~~~~~~~~~~~~~~~`;
}

// デモ用：サンプルデータを自動入力
function fillDemoData() {
  console.log("🎬 デモモード: サンプルデータを自動入力中...");

  const demoData = {
    stage_name: 'レオ',
    real_name: '山田太郎',
    kana: 'やまだたろう',
    phone: '090-1234-5678',
    age: '25',
    location: '東京都渋谷区',
    current_job: '学生',
    experience: '有り',
    store_name: 'テストクラブ',
    experience_years: '2年',
    employment_status: '退職済み',
    avg_sales: '150万円',
    max_sales: '250万円',
    job_type: 'レギュラー',
    dormitory: '希望する',
    start_date: '即日',
    motivation: 'お客様に最高のサービスを提供したいと思い応募いたします。',
    parent_consent: '有り',
    id_document: '可',
    resident_card: '可',
    interview_date: '12月25日 20:00〜\n12月26日 19:00〜'
  };

  // 通常の入力フィールドを埋める
  Object.entries(demoData).forEach(([name, value]) => {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) {
      if (element.type === 'radio') {
        // ラジオボタンの場合
        const radio = document.querySelector(`[name="${name}"][value="${value}"]`);
        if (radio) {
          radio.checked = true;
          console.log(`✓ ラジオボタン設定: ${name} = ${value}`);
        } else {
          console.log(`⚠️ ラジオボタンが見つからない: ${name}[value="${value}"]`);
        }
      } else {
        // 通常の入力フィールドの場合
        element.value = value;
        console.log(`✓ フィールド設定: ${name} = ${value}`);
      }
    } else {
      console.log(`⚠️ 要素が見つからない: ${name}`);
    }
  });

  // メディアソースのチェックボックス（複数選択）
  const mediaValues = ['ホスホス', 'Youtube', '紹介'];
  mediaValues.forEach(value => {
    const checkbox = document.querySelector(`[name="media_source"][value="${value}"]`);
    if (checkbox) {
      checkbox.checked = true;
      console.log(`✓ チェックボックス設定: media_source = ${value}`);
    } else {
      console.log(`⚠️ チェックボックスが見つからない: media_source[value="${value}"]`);
    }
  });

  // 紹介者フィールドを埋める
  const referralField = document.querySelector('[name="media_referral"]');
  if (referralField) {
    referralField.value = '友人の田中さん';
    console.log('✓ 紹介者フィールド設定完了');
  } else {
    console.log('⚠️ 紹介者フィールドが見つからない');
  }

  // 条件分岐フィールドの表示を更新
  updateConditionalFields();
  console.log('✓ 条件分岐フィールド更新完了');

  console.log("✅ デモデータの自動入力が完了しました");
}

// 条件分岐フィールドの表示を更新する関数
function updateConditionalFields() {
  // 経験詳細フィールドを表示
  const experienceSelect = document.querySelector('[name="experience"]');
  if (experienceSelect && experienceSelect.value === '有り') {
    const expFields = document.getElementById('experience_fields');
    if (expFields) {
      expFields.classList.remove('d-none');
      expFields.querySelectorAll('input').forEach(input => input.setAttribute('required', ''));
    }
  }

  // メディア関連フィールドの表示
  const referralCheckbox = document.querySelector('[name="media_source"][value="紹介"]');
  if (referralCheckbox && referralCheckbox.checked) {
    const referralField = document.getElementById('media_referral_field');
    if (referralField) referralField.classList.remove('d-none');
  }

  // 寮希望フィールドの表示
  const jobTypeSelect = document.querySelector('[name="job_type"]');
  if (jobTypeSelect && jobTypeSelect.value === 'レギュラー') {
    const dormitoryField = document.getElementById('dormitory_field');
    if (dormitoryField) {
      dormitoryField.classList.remove('d-none');
      dormitoryField.querySelectorAll('input[name="dormitory"]').forEach(input => input.setAttribute('required', ''));
    }
  }
}

(async () => {
  try {
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

    // LIFF初期化完了後にデモデータの自動入力（URLに?demo がある場合）
    if (isDemoMode) {
      console.log("🎬 デモモードが有効です。LIFF初期化完了後にフィールドを自動入力します...");
      // 少し待ってからデータを入力（DOMの準備を確実にする）
      setTimeout(() => {
        fillDemoData();
      }, 100);
    } else {
      console.log("ℹ️ デモモードではありません。通常モードで実行します。");
    }

    // イベント委譲を使った効率的なエラークリア処理
    document.addEventListener('input', function(e) {
      if (e.target.matches('input, textarea, select') && e.target.classList.contains('is-invalid')) {
        clearFieldError(e.target.name);
      }
    });

    document.addEventListener('change', function(e) {
      const target = e.target;

      // 通常フィールドのエラークリア
      if (target.matches('input, textarea, select') && target.classList.contains('is-invalid')) {
        clearFieldError(target.name);
      }

      // ラジオボタンの特別処理（グループ全体のエラークリア）
      if (target.type === 'radio') {
        const groupName = target.name;
        const radioGroup = document.querySelectorAll(`input[name="${groupName}"]`);
        if (radioGroup[0] && radioGroup[0].classList.contains('is-invalid')) {
          clearFieldError(groupName);
        }
      }
    });

    // 条件分岐表示の制御
    $("#experience").addEventListener("change", e => {
      const expFields = $("#experience_fields");
      if(e.target.value === '有り') {
        expFields.classList.remove('d-none');
        expFields.querySelectorAll('input').forEach(input => input.setAttribute('required', ''));
      } else {
        expFields.classList.add('d-none');
        expFields.querySelectorAll('input').forEach(input => {
          input.removeAttribute('required');
          input.value = '';
        });
      }
    });

    // チェックボックスの変更を監視（複数選択対応）
    document.querySelectorAll('[name="media_source"]').forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const otherField = $("#media_other_field");
        const referralField = $("#media_referral_field");
        const otherCheckbox = document.querySelector('[name="media_source"][value="その他"]');
        const referralCheckbox = document.querySelector('[name="media_source"][value="紹介"]');

        // その他フィールドの表示制御
        if(otherCheckbox && otherCheckbox.checked) {
          otherField.classList.remove('d-none');
        } else {
          otherField.classList.add('d-none');
          $("#media_other").value = '';
        }

        // 紹介フィールドの表示制御
        if(referralCheckbox && referralCheckbox.checked) {
          referralField.classList.remove('d-none');
        } else {
          referralField.classList.add('d-none');
          $("#media_referral").value = '';
        }
      });
    });

    $("#job_type").addEventListener("change", e => {
      const otherField = $("#job_other_field");
      const dormitoryField = $("#dormitory_field");

      if(e.target.value === 'その他') {
        otherField.classList.remove('d-none');
      } else {
        otherField.classList.add('d-none');
        $("#job_other").value = '';
      }

      if(e.target.value === 'レギュラー') {
        dormitoryField.classList.remove('d-none');
        dormitoryField.querySelectorAll('input[name="dormitory"]').forEach(input => input.setAttribute('required', ''));
      } else {
        dormitoryField.classList.add('d-none');
        dormitoryField.querySelectorAll('input[name="dormitory"]').forEach(input => {
          input.removeAttribute('required');
          input.checked = false;
        });
      }
    });

    btn.addEventListener("click", async ()=>{
      err.classList.add('d-none');
      ok.classList.add('d-none');
      clearAllErrors(); // 以前のエラー表示をクリア

      let hasError = false;
      let firstErrorField = null;

      // 基本必須項目チェック
      const requiredFields = ['real_name', 'kana', 'phone', 'age', 'location', 'current_job', 'experience', 'job_type', 'parent_consent', 'id_document', 'resident_card'];
      for(let field of requiredFields) {
        const element = $(`[name="${field}"]`);
        if(element) {
          // ラジオボタンの場合は特別処理
          if(element.type === 'radio') {
            const radioButtons = document.querySelectorAll(`[name="${field}"]`);
            const isChecked = Array.from(radioButtons).some(radio => radio.checked);
            if (!isChecked) {
              showFieldError(field);
              hasError = true;
              if (!firstErrorField) firstErrorField = radioButtons[0];
            }
          }
          // 通常の入力フィールドの場合
          else if (!element.value.trim()) {
            showFieldError(field);
            hasError = true;
            if (!firstErrorField) firstErrorField = element;
          }
        }
      }

      if (hasError) {
        err.textContent="必須項目を入力してください";
        err.classList.remove('d-none');
        // 最初のエラーフィールドにスクロール
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
        return;
      }

      // 条件付き必須項目チェック
      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());

      if(values.experience === '有り') {
        const expRequiredFields = ['store_name', 'experience_years', 'employment_status'];
        let expHasError = false;
        let expFirstErrorField = null;

        for(let field of expRequiredFields) {
          if(!values[field] || !values[field].trim()) {
            console.log(`経験詳細フィールドエラー: ${field}`); // デバッグログ
            showFieldError(field);
            expHasError = true;
            if (!expFirstErrorField) expFirstErrorField = $(`[name="${field}"]`);
          }
        }

        if (expHasError) {
          err.textContent="経験詳細の必須項目を入力してください";
          err.classList.remove('d-none');
          if (expFirstErrorField) {
            expFirstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            expFirstErrorField.focus();
          }
          return;
        }
      }

      if(values.job_type === 'レギュラー' && !values.dormitory) {
        showFieldError('dormitory');
        err.textContent="寮希望を選択してください";
        err.classList.remove('d-none');
        const dormitoryRadios = document.querySelectorAll(`[name="dormitory"]`);
        if (dormitoryRadios.length > 0) {
          dormitoryRadios[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      const text=buildMsg();
      btn.disabled=true; btn.textContent="送信中…";
      try{
        // URLパラメータをチェック
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentIsDebugMode = currentUrlParams.has('debug');
        const currentIsDemoMode = currentUrlParams.has('demo');

        if (currentIsDebugMode || currentIsDemoMode) {
          // デバッグ・デモモード：詳細情報を表示
          console.group("📝 フォーム送信内容");
          console.log("📄 送信予定のメッセージ:");
          console.log("%c" + text, "background: #e3f2fd; padding: 8px; border-radius: 4px; font-family: monospace; white-space: pre-line;");
          console.log("📊 フォームデータ:");
          const formData = new FormData(form);
          const formValues = Object.fromEntries(formData.entries());
          console.table(formValues);
          console.groupEnd();

          // デモモード時はHTMLにも送信内容を表示
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

          // デバッグモードではここで終了（実際の送信なし）
          if (currentIsDebugMode) {
            return;
          }
        }

        // 通常モード または デモモード：実際にLIFFで送信
        if (!currentIsDebugMode) {
          if(liff.isInClient()){
            await liff.sendMessages([
              {type:"text",text},
              {type:"text",text:"[フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
            setTimeout(()=>{ try{liff.closeWindow();}catch(_){} },600);
          }else if(liff.isApiAvailable('shareTargetPicker')){
            await liff.shareTargetPicker([
              {type:"text",text},
              {type:"text",text:"[フォームから送信されました]"}
            ]);
            ok.classList.remove('d-none');
          }else{
            err.textContent="LINEアプリ内で開いてください";
            err.classList.remove('d-none');
          }
        }
      }catch(e){ err.textContent="送信失敗: "+e.message; err.classList.remove('d-none'); }
      btn.disabled=false; btn.textContent="応募内容を送信";
    });
  }catch(e){ logd("init_error: "+e.message); err.textContent="LIFF初期化失敗: "+e.message; err.classList.remove('d-none'); }
})();