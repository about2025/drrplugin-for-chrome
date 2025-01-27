// 対象となる部屋の名前
const hiddenRooms = ["誰でも歓迎部屋", "雑談部屋(画像OFF)"];

// 無視する名前のリスト（正規表現の配列）
const ignoredPatterns = [];

function hideRooms() {
  const roomElements = document.querySelectorAll("#room_list ul.rooms li");
  console.log(`[Debug] Found ${roomElements.length} rooms.`); // 部屋の数を出力

  roomElements.forEach((room, index) => {
    console.log(`[Debug] Processing room #${index + 1}: ${room.outerHTML}`); // 各部屋のHTMLを出力
    const roomNameElement = room.querySelector(".name");
    const roomLockIcon = room.querySelector(".fa.fa-lock"); // 鍵アイコンを判定
    const userList = room.querySelector("ul"); // 部屋内の人物リスト

    let shouldHideRoom = false;

    // 部屋名が指定リストに含まれる場合や鍵付きの場合
    if (roomNameElement) {
      const roomName = roomNameElement.innerText.trim();
      console.log(`[Debug] Room name: ${roomName}`);
      if (hiddenRooms.includes(roomName) || roomLockIcon) {
        console.log(`[Debug] Hiding room due to name or lock: ${roomName}`);
        shouldHideRoom = true;
      }
    } else {
      console.log(`[Debug] No room name element found.`);
    }

    // ユーザーリストが存在しない場合
    if (!userList) {
      console.log(`[Debug] No user list found in room.`);
    } else {
      console.log(`[Debug] User list element found: ${userList.outerHTML}`);

      // ユーザーリストが空の場合
      if (userList.children.length === 0) {
        console.log(`[Debug] User list found, but it is empty.`);
        shouldHideRoom = true;
      } else {
        console.log(`[Debug] User list has ${userList.children.length} items.`);
      }

      // 部屋内の最初の人物が指定リストに含まれる場合
      if (userList.children.length > 0) {
        const firstUser = userList.children[0].innerText.trim(); // 最初の人物
        console.log(`[Debug] First user in the room: ${firstUser}`);
        if (ignoredPatterns.some((regex) => regex.test(firstUser))) {
          console.log(`[Debug] Hiding room due to first user: ${firstUser}`);
          shouldHideRoom = true;
        }
      }
    }

    // 部屋を非表示
    if (shouldHideRoom) {
      console.log(`[Debug] Hiding room: ${roomNameElement ? roomNameElement.innerText.trim() : "Unnamed Room"}`);
      room.style.display = "none";
    } else {
      console.log(`[Debug] Showing room: ${roomNameElement ? roomNameElement.innerText.trim() : "Unnamed Room"}`);
      room.style.display = ""; // 表示する部屋はリセット
    }
  });
}


// 無視する名前やシステムメッセージを非表示にする関数
function hideIgnoredContent() {
  // チャットの発言を非表示
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
addIgnoredPattern("しんしん");
addIgnoredPattern("社会の現実");
addIgnoredPattern("^ぷに$");
addIgnoredPattern("^たき$"); 
addIgnoredPattern("^猫魔符$");
addIgnoredPattern("野球くん");
addIgnoredPattern("真アコ兄");
addIgnoredPattern("ミチコ"); 
addIgnoredPattern("アサイー");
addIgnoredPattern("@◇@"); 
addIgnoredPattern("屁"); 
addIgnoredPattern("みみみ"); 
addIgnoredPattern("隼人"); 
addIgnoredPattern("苦夫"); 
addIgnoredPattern("ぷにゃぷにゃ"); 
addIgnoredPattern("レレレ"); 
addIgnoredPattern("深淵"); 
addIgnoredPattern("rakan"); 
addIgnoredPattern("ちひろ"); 
addIgnoredPattern("さそり"); 
addIgnoredPattern("ニンニクましまし"); 
addIgnoredPattern("熊"); 
addIgnoredPattern("山の幸"); 
addIgnoredPattern("ここなつ"); 
addIgnoredPattern("丘介"); 
addIgnoredPattern("はまいち");
addIgnoredPattern("失敗作少女");
addIgnoredPattern("♪");
addIgnoredPattern("のび");
addIgnoredPattern("さかな");
addIgnoredPattern("オフショア");
addIgnoredPattern("民");
addIgnoredPattern("顎");
addIgnoredPattern("あすか");
addIgnoredPattern("ぶぶ");
addIgnoredPattern("カイジ");
addIgnoredPattern("たろ");
addIgnoredPattern("あいすん");
addIgnoredPattern("納豆");
addIgnoredPattern("おじゆき");
addIgnoredPattern("きたがわ");
addIgnoredPattern("なめくじ");
addIgnoredPattern("赤羽");
addIgnoredPattern("おそ松");
addIgnoredPattern("ネカマ侍");
addIgnoredPattern("タケミカヅチ");