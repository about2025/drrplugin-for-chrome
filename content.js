// 非表示にする部屋名の正規表現リスト
const regHiddenRooms = [
  /誰でも歓迎部屋/,
  /雑談部屋\(画像OFF\)/,
  /相談/,
  /😭/,
  /みみみ/,
  /♪/,
  /Linux/,
  /憩いの場/,
  /小中/,
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
function isRoomHidden(roomName, hasLockIcon, userCount) {
  return (
    regHiddenRooms.some((regex) => regex.test(roomName)) || // 部屋名フィルタ
    hasLockIcon || // 鍵付き部屋
    userCount === 0 // 人数ゼロ
  );
}

/**
 * 部屋を非表示にする処理
 */
function hideRooms() {
  const roomXPath = "//ul[@class='rooms clearfix']/li[@class='name']";
  const roomNameElements = document.evaluate(roomXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  console.log(`[Debug] Found ${roomNameElements.snapshotLength} rooms.`);

  for (let i = 0; i < roomNameElements.snapshotLength; i++) {
    const roomNameElement = roomNameElements.snapshotItem(i);
    const roomName = roomNameElement.innerText.trim();
    const roomContainer = roomNameElement.closest("ul.rooms");

    if (!roomContainer) {
      console.warn(`[Warning] Room #${i + 1} has no valid container. Skipping.`);
      continue;
    }

    const roomLockIcon = !!roomContainer.querySelector(".fa-lock"); // 鍵付き判定
    const userList = roomContainer.querySelector("ul");
    const userCount = userList ? userList.children.length : 0;

    console.log(`[Debug] Room "${roomName}" has ${userCount} users.`);

    if (isRoomHidden(roomName, roomLockIcon, userCount)) {
      console.log(`[Debug] Hiding room: ${roomName}`);
      roomContainer.style.display = "none";
    } else {
      roomContainer.style.display = ""; // 表示
    }
  }
}

/**
 * 無視するユーザーやシステムメッセージを非表示にする
 */
function hideIgnoredContent() {
  // チャットの発言を非表示
  document.querySelectorAll("#talks dl.talk").forEach((talk) => {
    const talkerNameElement = talk.querySelector("dt");
    if (talkerNameElement) {
      const talkerName = talkerNameElement.innerText.trim();
      if (ignoredPatterns.some((regex) => regex.test(talkerName))) {
        talk.style.display = "none";
      }
    }
  });

  // システムメッセージを非表示
  document.querySelectorAll("#talks .talk.system").forEach((systemMessage) => {
    const messageText = systemMessage.innerText.trim();
    if (
      ignoredPatterns.some((regex) => regex.test(messageText)) &&
      (messageText.includes("入室しました") || messageText.includes("退室しました"))
    ) {
      systemMessage.style.display = "none";
    }
  });

  // ユーザーリストから無視するユーザーを削除し、部屋の人数をチェック
  document.querySelectorAll("#room_list ul.rooms li ul").forEach((userList) => {
    let userRemoved = false;

    userList.querySelectorAll("li").forEach((listItem) => {
      const itemText = listItem.textContent.trim();
      if (ignoredPatterns.some((regex) => regex.test(itemText))) {
        console.log(`[Debug] Removing user: ${itemText}`);
        listItem.remove();
        userRemoved = true;
      }
    });

    // ユーザー削除後に部屋の人数を再チェック
    if (userRemoved && userList.children.length === 0) {
      const roomContainer = userList.closest("ul.rooms");
      if (roomContainer) {
        console.log(`[Debug] Room is now empty, hiding it.`);
        roomContainer.style.display = "none";
      }
    }
  });
}

/**
 * 無視するユーザーを追加
 * @param {string} pattern - 正規表現パターン
 */
function addIgnoredNamePattern(pattern) {
  try {
    const regex = new RegExp(pattern);
    if (!ignoredPatterns.some((existingRegex) => existingRegex.toString() === regex.toString())) {
      ignoredPatterns.push(regex);
      console.log(`Added regex to ignored patterns: ${pattern}`);
      hideIgnoredContent(); // 追加後に即時非表示処理
    }
  } catch (e) {
    console.error(`Invalid regular expression: ${pattern}`, e);
  }
}

/**
 * DOM変更を監視して非表示処理を適用
 */
function observeChanges() {
  const observer = new MutationObserver(() => {
    hideRooms();
    hideIgnoredContent();
  });

  const targetNode = document.getElementById("room_list");
  if (targetNode) {
    hideRooms();
    observer.observe(targetNode, { childList: true, subtree: true });
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
}



// 動的に正規表現を登録して無視するテスト（任意で削除可能）
addIgnoredNamePattern("^名無し$"); // 完全一致「名無し」
addIgnoredNamePattern("^新田隼人$"); // 完全一致「新田隼人」
addIgnoredNamePattern("ﾄﾞｼﾀ"); // 部分一致「ﾄﾞｼﾀ」
addIgnoredNamePattern("社会の現実");
addIgnoredNamePattern("^ぷに$");
addIgnoredNamePattern("^たき$"); 
addIgnoredNamePattern("^猫魔符$");
addIgnoredNamePattern("野球くん");
addIgnoredNamePattern("真アコ兄");
addIgnoredNamePattern("ミチコ"); 
addIgnoredNamePattern("アサイー");
addIgnoredNamePattern("@◇@"); 
addIgnoredNamePattern("屁"); 
addIgnoredNamePattern("みみみ"); 
addIgnoredNamePattern("隼人"); 
addIgnoredNamePattern("苦夫"); 
addIgnoredNamePattern("ぷにゃぷにゃ"); 
addIgnoredNamePattern("レレレ"); 
addIgnoredNamePattern("深淵"); 
addIgnoredNamePattern("rakan"); 
addIgnoredNamePattern("ちひろ"); 
addIgnoredNamePattern("さそり"); 
addIgnoredNamePattern("ニンニクましまし"); 
addIgnoredNamePattern("(?<!駆け抜ける)熊"); 
addIgnoredNamePattern("山の幸"); 
addIgnoredNamePattern("ここなつ"); 
addIgnoredNamePattern("丘介"); 
addIgnoredNamePattern("はまいち");
addIgnoredNamePattern("失敗作少女");
addIgnoredNamePattern("♪");
addIgnoredNamePattern("のび");
addIgnoredNamePattern("さかな");
addIgnoredNamePattern("オフショア");
addIgnoredNamePattern("民");
addIgnoredNamePattern("顎");
addIgnoredNamePattern("あすか");
addIgnoredNamePattern("ぶぶ");
addIgnoredNamePattern("カイジ");
addIgnoredNamePattern("たろ");
addIgnoredNamePattern("あいすん");
addIgnoredNamePattern("納豆");
addIgnoredNamePattern("おじゆき");
addIgnoredNamePattern("きたがわ");
addIgnoredNamePattern("なめくじ");
addIgnoredNamePattern("赤羽");
addIgnoredNamePattern("おそ松");
addIgnoredNamePattern("ネカマ侍");
addIgnoredNamePattern("タケミカヅチ");
addIgnoredNamePattern("猫ぷは");
addIgnoredNamePattern("正明");
addIgnoredNamePattern("カナ");
addIgnoredNamePattern("せこ");
addIgnoredNamePattern("なめし");
addIgnoredNamePattern("のろ");
addIgnoredNamePattern("山下");
addIgnoredNamePattern("kranky");
addIgnoredNamePattern("サンドラ");
addIgnoredNamePattern("JACK");
addIgnoredNamePattern("人生の勝者");
addIgnoredNamePattern("100日後");
addIgnoredNamePattern("豆");
addIgnoredNamePattern("ぷか");
addIgnoredNamePattern("^雨$");
addIgnoredNamePattern("^ぱぁる$");
addIgnoredNamePattern("松");
addIgnoredNamePattern("うんこ");
addIgnoredNamePattern("桜井誠");
addIgnoredNamePattern("はげおやじ");
addIgnoredNamePattern("人生終了");
addIgnoredNamePattern("ハル");
addIgnoredNamePattern("ニトヒロ");
addIgnoredNamePattern("おすし");
addIgnoredNamePattern("ゆう");
addIgnoredNamePattern("雨宮");
addIgnoredNamePattern("巨大");
addIgnoredNamePattern("うさぎ");
addIgnoredNamePattern("バージニア");
addIgnoredNamePattern("A.*a");
addIgnoredNamePattern("Ben");


// 初期化処理
observeChanges();
