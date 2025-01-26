// 対象となる部屋の名前
const hiddenRooms = ["誰でも歓迎部屋", "雑談部屋(画像OFF)"];

// 無視する名前のリスト（動的に登録可能）
const ignoredNames = new Set();

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
    if (talkerName && ignoredNames.has(talkerName)) {
      console.log(`Hiding talk from: ${talkerName}`);
      talk.style.display = "none";
    }
  });

  // `talk system` のフレーズを動的にチェックして非表示
  document.querySelectorAll("#talks .talk.system").forEach((systemMessage) => {
    const messageText = systemMessage.innerText.trim();
    // 無視対象の名前がシステムメッセージに含まれるか確認
    for (const ignoredName of ignoredNames) {
      if (
        messageText.includes(`${ignoredName}さんが入室しました`) ||
        messageText.includes(`${ignoredName}さんが退室しました`)
      ) {
        console.log(`Hiding system message: ${messageText}`);
        systemMessage.style.display = "none";
        break; // 一致したらそれ以上確認しない
      }
    }
  });
}

// 動的に無視する名前を登録する関数
function addIgnoredName(name) {
  if (name) {
    ignoredNames.add(name.trim());
    console.log(`Added to ignored names: ${name}`);
    hideIgnoredContent(); // 登録後に即時非表示
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

// 動的に名前を登録して無視するテスト（任意で削除可能）
addIgnoredName("名無し");
addIgnoredName("新田隼人");
