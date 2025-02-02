(() => {
  // 非表示にする部屋名の正規表現リスト
  const regHiddenRooms = [
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
    /プログラム/,
    // 追加：絵文字コード（表情文字 U+1F600～U+1F64F および 🥹）を含む部屋名を非表示にする
    /[\u{1F600}-\u{1F64F}\u{1F979}]/u
  ];

  // 無視する名前のリスト（正規表現の配列）
  const ignoredPatterns = [];

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
   * 直後にある <hr class="dashed"> 要素を削除する
   * @param {HTMLElement} container - 部屋コンテナ（ul.rooms）
   */
  const removeFollowingDashedHr = (container) => {
    const nextSibling = container.nextElementSibling;
    if (nextSibling && nextSibling.matches("hr.dashed")) {
      console.log(`[Debug] Removing hr element following hidden room.`);
      nextSibling.remove();
    }
  };

  /**
   * 部屋を非表示にする処理
   */
  const hideRooms = () => {
    const roomXPath = "//ul[@class='rooms clearfix']/li[@class='name']";
    const roomNameElements = document.evaluate(
      roomXPath,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    console.log(`[Debug] Found ${roomNameElements.snapshotLength} rooms.`);
    for (let i = 0; i < roomNameElements.snapshotLength; i++) {
      const roomNameElement = roomNameElements.snapshotItem(i);
      const roomName = roomNameElement.innerText.trim();
      const roomContainer = roomNameElement.closest("ul.rooms");
      if (!roomContainer) {
        console.warn(`[Warning] Room #${i + 1} has no valid container. Skipping.`);
        continue;
      }
      // 鍵付き判定
      const roomLockIcon = Boolean(roomContainer.querySelector(".fa-lock"));
      const userList = roomContainer.querySelector("ul");
      const userCount = userList ? userList.children.length : 0;
      console.log(`[Debug] Room "${roomName}" has ${userCount} users.`);
      if (isRoomHidden(roomName, roomLockIcon, userCount)) {
        console.log(`[Debug] Hiding room: ${roomName}`);
        roomContainer.style.display = "none";
        // ここでは、部屋名が非表示対象、もしくは人数が 0、または鍵付きの場合に hr を削除
        if (regHiddenRooms.some(regex => regex.test(roomName)) || userCount === 0 || roomLockIcon) {
          removeFollowingDashedHr(roomContainer);
        }
      } else {
        roomContainer.style.display = "";
      }
    }
  };

  /**
   * 無視するユーザーやシステムメッセージを非表示にする処理
   */
  const hideIgnoredContent = () => {
    // チャットの発言を非表示
    document.querySelectorAll("#talks dl.talk").forEach(talk => {
      const talkerNameElement = talk.querySelector("dt");
      if (talkerNameElement) {
        const talkerName = talkerNameElement.innerText.trim();
        if (ignoredPatterns.some(regex => regex.test(talkerName))) {
          talk.style.display = "none";
        }
      }
    });
    // システムメッセージを非表示
    document.querySelectorAll("#talks .talk.system").forEach(systemMessage => {
      const messageText = systemMessage.innerText.trim();
      if (
        ignoredPatterns.some(regex => regex.test(messageText)) &&
        (messageText.includes("入室しました") || messageText.includes("退室しました"))
      ) {
        systemMessage.style.display = "none";
      }
    });
    // ユーザーリストから無視するユーザーを削除し、部屋の人数をチェック
    document.querySelectorAll("#room_list ul.rooms li ul").forEach(userList => {
      let userRemoved = false;
      userList.querySelectorAll("li").forEach(listItem => {
        const itemText = listItem.textContent.trim();
        if (ignoredPatterns.some(regex => regex.test(itemText))) {
          console.log(`[Debug] Removing user: ${itemText}`);
          listItem.remove();
          userRemoved = true;
        }
      });
      if (userRemoved && userList.children.length === 0) {
        const roomContainer = userList.closest("ul.rooms");
        if (roomContainer) {
          console.log(`[Debug] Room is now empty, hiding it.`);
          roomContainer.style.display = "none";
          // 人数が 0 の場合も hr を削除
          removeFollowingDashedHr(roomContainer);
        }
      }
    });
  };

  /**
   * 無視するユーザーを追加する関数
   * @param {string} pattern - 正規表現パターン
   */
  const addIgnoredNamePattern = (pattern) => {
    try {
      const regex = new RegExp(pattern);
      if (!ignoredPatterns.some(existingRegex => existingRegex.toString() === regex.toString())) {
        ignoredPatterns.push(regex);
        console.log(`Added regex to ignored patterns: ${pattern}`);
        hideIgnoredContent(); // 登録後に即時非表示処理を実行
      }
    } catch (e) {
      console.error(`Invalid regular expression: ${pattern}`, e);
    }
  };

  /**
   * DOM の変更を監視し、非表示処理を適用する関数
   */
  const observeChanges = () => {
    const observer = new MutationObserver(() => {
      hideRooms();
      hideIgnoredContent();
    });
    const roomListNode = document.getElementById("room_list");
    if (roomListNode) {
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

  // 無視するユーザーの正規表現を登録（必要に応じて追加・変更可能）
  const ignoredNamePatterns = [
    "名無し",
    "マイキー",
    "新田隼人",
    "ﾄﾞｼﾀ|ドシタ",
    "社会の現実",
    "ぷに",
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
    "とも",
    "ピーベリー",
    "小野寺",
    "めんま",
    "じゅーしーちん",
    "たぷたぷ",
    "馬鹿",


  ];

  // 上記パターンを順次登録
  ignoredNamePatterns.forEach(pattern => addIgnoredNamePattern(pattern));

  // 初期化：DOM 監視の設定を開始
  observeChanges();
})();

