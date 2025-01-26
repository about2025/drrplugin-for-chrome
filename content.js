// 対象となる部屋の名前
const hiddenRooms = ["誰でも歓迎部屋", "雑談部屋(画像OFF)"];

// 無視する名前のリスト（正規表現の配列）
const ignoredPatterns = [];

// 部屋を非表示にする関数
function hideRooms() {
  const roomElements = document.querySelectorAll("#room_list ul.rooms");
  roomElements.forEach((room) => {
    const roomNameElement = room.querySelector(".name");
    const roomLockIcon = room.querySelector(".fa.fa-lock"); // 鍵アイコンを判定
    if (roomNameElement) {
      const roomName = roomNameElement.innerText.trim();
      // 部屋名が隠すリストに含まれる、または鍵付きの場合
      if (hiddenRooms.includes(roomName) || roomLockIcon) {
        console.log(`Hiding room: ${roomName}`); // デバッグ用ログ
        room.style.display = "none";
      }
    }
  });
}

// 無視する名前やシステムメッセージを非表示にする関数
function hideIgnoredContent() {
  // チャットの発言の非表示
  document.querySelectorAll("#talks dl.talk").forEach((talk) => {
    const talkerName = talk.querySelector("dt")?.innerText.trim();
    if (talkerName && ignoredPatterns.some((regex) => regex.test(talkerName))) {
      console.log(`Hiding talk from: ${talkerName}`);
      talk.style.display = "none";
    }
  });

  // `talk system` のフレーズを動的にチェックして非表示
  document.querySelectorAll("#talks .talk.system").forEach((systemMessage) => {
    const messageText = systemMessage.innerText.trim();
    if (
      ignoredPatterns.some((regex) => regex.test(messageText)) &&
      (messageText.includes("入室しました") || messageText.includes("退室しました"))
    ) {
      console.log(`Hiding system message: ${messageText}`);
      systemMessage.style.display = "none";
    }
  });
}

// 動的に無視する名前パターンを登録する関数
function addIgnoredPattern(pattern) {
  try {
    const regex = new RegExp(pattern);
    ignoredPatterns.push(regex);
    console.log(`Added regex to ignored patterns: ${pattern}`);
    hideIgnoredContent(); // 登録後に即時非表示
  } catch (e) {
    console.error(`Invalid regular expression: ${pattern}`);
  }
}

// DOMの変更を監視して部屋や名前を非表示にする
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

// 動的に正規表現を登録して無視するテスト（任意で削除可能）
addIgnoredPattern("^名無し$");       // 完全一致「名無し」
addIgnoredPattern("^新田隼人$");         // 「新田」で始まる名前全て
addIgnoredPattern("ﾄﾞｼﾀ");         // 
