// 対象となる部屋の名前
const hiddenRooms = ["誰でも歓迎部屋", "雑談部屋(画像OFF)"];

// 無視する名前のリスト（正規表現の配列）
const ignoredPatterns = [];

// 部屋を非表示にする関数
function hideRooms() {
  const roomElements = document.querySelectorAll("#room_list ul.rooms li");
  roomElements.forEach((room) => {
    const roomNameElement = room.querySelector(".name");
    const roomLockIcon = room.querySelector(".fa.fa-lock"); // 鍵アイコンを判定
    if (roomNameElement) {
      const roomName = roomNameElement.innerText.trim();
      if (hiddenRooms.includes(roomName) || roomLockIcon) {
        if (room.style.display !== "none") {
          console.log(`Hiding room: ${roomName}`); // デバッグ用ログ
          room.style.display = "none";
        }
      }
    }
  });
}

// 無視する名前やシステムメッセージを非表示にする関数
function hideIgnoredContent() {
  // チャットの発言の非表示
  document.querySelectorAll("#talks dl.talk").forEach((talk) => {
    const talkerNameElement = talk.querySelector("dt");
    if (talkerNameElement) {
      const talkerName = talkerNameElement.innerText.trim();
      if (ignoredPatterns.some((regex) => regex.test(talkerName))) {
        if (talk.style.display !== "none") {
          console.log(`Hiding talk from: ${talkerName}`);
          talk.style.display = "none";
        }
      }
    }
  });

  // `talk system` の入退室・サイコロのログを非表示
  document.querySelectorAll("#talks .talk.system").forEach((systemMessage) => {
    const messageText = systemMessage.innerText.trim();
    // 入退室のメッセージを非表示
    if (
      ignoredPatterns.some((regex) => regex.test(messageText)) &&
      (messageText.includes("入室しました") || messageText.includes("退室しました"))
    ) {
      if (systemMessage.style.display !== "none") {
        console.log(`Hiding system message: ${messageText}`);
        systemMessage.style.display = "none";
      }
    }
    // サイコロのメッセージを非表示
    if (
      ignoredPatterns.some((regex) =>
        regex.test(
          messageText.replace(/さんはサイコロを振って\d+を出しました。/, "")
        )
      )
    ) {
      if (systemMessage.style.display !== "none") {
        console.log(`Hiding dice message: ${messageText}`);
        systemMessage.style.display = "none";
      }
    }
  });

  // `<li>` 要素内の特定の名前を削除
  document.querySelectorAll("#room_list ul.rooms li ul li").forEach((listItem) => {
    const itemText = listItem.textContent.trim();
    if (ignoredPatterns.some((regex) => regex.test(itemText))) {
      console.log(`Removing list item: ${itemText}`);
      listItem.remove(); // 要素を削除
    }
  });
}

// 動的に無視する名前パターンを登録する関数
function addIgnoredPattern(pattern) {
  try {
    const regex = new RegExp(pattern);
    if (!ignoredPatterns.some((existingRegex) => existingRegex.toString() === regex.toString())) {
      ignoredPatterns.push(regex);
      console.log(`Added regex to ignored patterns: ${pattern}`);
      hideIgnoredContent(); // 登録後に即時非表示
    } else {
      console.log(`Pattern already exists: ${pattern}`);
    }
  } catch (e) {
    console.error(`Invalid regular expression: ${pattern}`, e);
  }
}

// DOMの変更を監視して部屋や名前を非表示にする
function observeChanges() {
  const observer = new MutationObserver(() => {
    hideRooms();
    hideIgnoredContent();
  });

  // 部屋リストの監視
  const targetNode = document.getElementById("room_list");
  if (targetNode) {
    hideRooms();
    observer.observe(targetNode, { childList: true, subtree: true });
  } else {
    console.error("Target node #room_list not found!");
  }

  // チャット全体の監視
  const chatNode = document.getElementById("body");
  if (chatNode) {
    hideIgnoredContent();
    observer.observe(chatNode, { childList: true, subtree: true });
  } else {
    console.error("Target node #body not found!");
  }
}

// 初期化処理
observeChanges();

// 動的に正規表現を登録して無視するテスト（任意で削除可能）
addIgnoredPattern("^名無し$"); // 完全一致「名無し」
addIgnoredPattern("^新田隼人$"); // 完全一致「新田隼人」
addIgnoredPattern("ﾄﾞｼﾀ"); // 部分一致「ﾄﾞｼﾀ」
addIgnoredPattern("社会の現実"); // 部分一致「社会の現実」
addIgnoredPattern("^ぷに$"); // 部分一致「社会の現実」
addIgnoredPattern("^たき$"); // 部分一致「社会の現実」
addIgnoredPattern("^猫魔符$"); // 部分一致「社会の現実」
addIgnoredPattern("野球くん"); // 部分一致「社会の現実」
addIgnoredPattern("真アコ兄"); // 部分一致「社会の現実」
addIgnoredPattern("ミチコ"); // 部分一致「社会の現実」
addIgnoredPattern("アサイー"); // 部分一致「社会の現実」
