// ====================
// グローバル設定（ファイル上部で登録）
// ====================

// 部屋名非表示用正規表現リスト
const GLOBAL_REG_HIDDEN_ROOMS = [
  /誰でも歓迎部屋/,
  /雑談部屋\(画像OFF\)/,
  /相談/,
  /😭/,
  /💕/,
  /みみみ/,
  /♪/,
  /Linux/,
  /憩いの場/,
  /小中/,
  /鬱/,
  /ウルフ/,
  /運動部/,
  /絵/,
  /理系/,
  /変態/,
  /インドア/,
  /コミュ/,
  /映画/,
  /聖書部屋/,
  /タスク/,
  /休憩室/,
  /トリップ/,
  /学生/,
  /❤/,
  /隼人/,
  // 追加：表情絵文字 U+1F600～U+1F64F を含む部屋名も非表示対象
  /[\u{1F600}-\u{1F64F}]/u,
];

// 無視する名前のパターン（文字列の配列、後で RegExp に変換）
const GLOBAL_IGNORED_NAME_PATTERNS = [
  "名無し",
  "マイキー",
  "新田隼人",
  "ﾄﾞｼﾀ",
  "社会の現実",
  "^ぷに$",
  "^たき$",
  "^猫魔符$",
  "野球くん",
  "真アコ兄",
  "ミチコ",
  "アサイー",
  "@◇@",
  "屁",
  "みみみ",
  "隼人",
  "苦夫",
  "ぷにゃぷにゃ",
  "レレレ",
  "深淵",
  "rakan",
  "ちひろ",
  "さそり",
  "ニンニクましまし",
  "(?<!駆け抜ける)熊",
  "山の幸",
  "ここなつ",
  "丘介",
  "はまいち",
  "失敗作少女",
  "♪",
  "のび",
  "さかな",
  "オフショア",
  "民",
  "顎",
  "あすか",
  "ぶぶ",
  "カイジ",
  "たろ",
  "あいすん",
  "納豆|なっと",
  "おじゆき",
  "きたがわ",
  "なめくじ",
  "赤羽",
  "おそ松",
  "ネカマ侍",
  "タケミカヅチ",
  "猫ぷは",
  "正明",
  "カナ$",
  "せこ",
  "なめし",
  "のろ",
  "山下",
  "kranky",
  "サンドラ",
  "JACK",
  "人生の勝者",
  "100日後",
  "豆",
  "ぷか",
  "^雨$",
  "^ぱぁる$",
  "松",
  "うんこ",
  "桜井誠",
  "はげおやじ",
  "人生終了",
  "ハル",
  "ニトヒロ",
  "おすし",
  "ゆう",
  "雨宮",
  "巨大",
  "うさぎ",
  "バージニア",
  "A.*a",
  "パンツ",
  "高学歴",
  "です",
  "ケン",
  "^け$",
  "^ライダー$",
  "^まこと$",
  "^伊藤",
  "^クマ",
  "たけし",
  "丸亀",
  "渡邊",
  "TK",
  "モチヤマ",
  "春爛漫",
  "yama",
  "まりりん",
  "こうん",
  "柏",
  "森崎",
  "なるみ",
  "すまお",
  "どる",
  "田中",
];

// ====================
// メイン処理（DOM 操作など）
// ====================
(() => {
  // 無視パターンを RegExp オブジェクトとして保持する配列（初期化時のみ変換）
  const ignoredPatterns = GLOBAL_IGNORED_NAME_PATTERNS.map(pattern => new RegExp(pattern));

  // 部屋名非表示用正規表現はグローバル設定をそのまま利用
  const regHiddenRooms = GLOBAL_REG_HIDDEN_ROOMS;

  /**
   * 指定された部屋を非表示にするべきか判定
   * @param {string} roomName - 部屋名
   * @param {boolean} hasLockIcon - 鍵付きかどうか
   * @param {number} userCount - 部屋の人数
   * @returns {boolean} - 非表示にするべきか
   */
  const isRoomHidden = (roomName, hasLockIcon, userCount) =>
    regHiddenRooms.some(regex => regex.test(roomName)) || // 部屋名フィルタ
    hasLockIcon || // 鍵付き部屋
    userCount === 0; // 人数ゼロ

  /**
   * 部屋の非表示処理
   */
  const hideRooms = () => {
    // DOM 構造を直接走査（querySelectorAll の結果は静的 NodeList）
    const roomNameElements = document.querySelectorAll("ul.rooms.clearfix > li.name");
    const len = roomNameElements.length;
    // ループごとに変数定義をまとめ、for ループで高速化
    for (let i = 0; i < len; i++) {
      const roomNameElement = roomNameElements[i];
      const roomName = roomNameElement.textContent.trim();  // innerText より textContent の方が高速
      const roomContainer = roomNameElement.closest("ul.rooms");
      if (!roomContainer) {
        console.warn(`[Warning] Room "${roomName}" has no valid container. Skipping.`);
        continue;
      }
      // 1度のクエリでロックアイコンをチェック
      const roomLockIcon = !!roomContainer.querySelector(".fa-lock");
      const userList = roomContainer.querySelector("ul");
      const userCount = userList ? userList.children.length : 0;

      // 判定後に非表示処理を実施
      if (isRoomHidden(roomName, roomLockIcon, userCount)) {
        roomContainer.style.display = "none";
        // ※ CSS クラスを使う場合は、以下のようにする例（CSS 側に .hidden { display: none; } を定義）
        // roomContainer.classList.add("hidden");
        // 直後の <hr class="dashed"> 要素があれば削除
        const nextSibling = roomContainer.nextElementSibling;
        if (nextSibling && nextSibling.matches("hr.dashed")) {
          nextSibling.remove();
        }
      } else {
        roomContainer.style.display = "";
        // roomContainer.classList.remove("hidden");
      }
    }
  };

  /**
   * 無視対象のユーザー名やシステムメッセージを非表示にする処理
   */
  const hideIgnoredContent = () => {
    // チャット発言の非表示
    const talks = document.querySelectorAll("#talks dl.talk");
    for (let i = 0, len = talks.length; i < len; i++) {
      const talk = talks[i];
      const dt = talk.querySelector("dt");
      if (dt) {
        const talkerName = dt.textContent.trim();
        for (let j = 0, patLen = ignoredPatterns.length; j < patLen; j++) {
          if (ignoredPatterns[j].test(talkerName)) {
            talk.style.display = "none";
            break;
          }
        }
      }
    }

    // システムメッセージの非表示
    const sysTalks = document.querySelectorAll("#talks .talk.system");
    for (let i = 0, len = sysTalks.length; i < len; i++) {
      const systemMessage = sysTalks[i];
      const messageText = systemMessage.textContent.trim();
      // 1ループ内で条件をまとめる
      if (
        (ignoredPatterns.some(regex => regex.test(messageText))) &&
        (messageText.includes("入室しました") || messageText.includes("退室しました"))
      ) {
        systemMessage.style.display = "none";
      }
    }

    // ユーザーリストから無視対象ユーザーを削除し、部屋の人数チェック
    const userLists = document.querySelectorAll("#room_list ul.rooms li ul");
    for (let i = 0, len = userLists.length; i < len; i++) {
      const userList = userLists[i];
      let userRemoved = false;
      const listItems = userList.querySelectorAll("li");
      for (let j = 0, l = listItems.length; j < l; j++) {
        const listItem = listItems[j];
        const itemText = listItem.textContent.trim();
        for (let k = 0, patLen = ignoredPatterns.length; k < patLen; k++) {
          if (ignoredPatterns[k].test(itemText)) {
            console.log(`[Debug] Removing user: ${itemText}`);
            listItem.remove();
            userRemoved = true;
            break;
          }
        }
      }
      if (userRemoved && userList.children.length === 0) {
        const roomContainer = userList.closest("ul.rooms");
        if (roomContainer) {
          roomContainer.style.display = "none";
          const nextSibling = roomContainer.nextElementSibling;
          if (nextSibling && nextSibling.matches("hr.dashed")) {
            nextSibling.remove();
          }
        }
      }
    }
  };

  // debouncing 用のフラグ
  let updatePending = false;
  const scheduleUpdate = () => {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(() => {
        hideRooms();
        hideIgnoredContent();
        updatePending = false;
      });
    }
  };

  /**
   * DOM 変更を監視し、変更があった場合にまとめて処理を実行する
   */
  const observeChanges = () => {
    const observer = new MutationObserver(scheduleUpdate);

    // 監視対象のノードをできるだけ限定する
    const roomListNode = document.getElementById("room_list");
    if (roomListNode) {
      // 初回処理
      hideRooms();
      observer.observe(roomListNode, { childList: true, subtree: true });
    } else {
      console.error("Target node #room_list not found!");
    }

    const chatNode = document.getElementById("body");
    if (chatNode) {
      hideIgnoredContent();
      observer.observe(chatNode, { childList: true, subtree: true });
    } else {
      console.error("Target node #body not found!");
    }
  };

  // 初期化処理：監視を開始
  observeChanges();
})();
