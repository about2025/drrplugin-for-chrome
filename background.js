// 初期設定
const defaultSettings = {
  hiddenRooms: ["誰でも歓迎部屋", "雑談部屋(画像OFF)"],
  regHiddenRooms: [".*歓迎.*", "雑談部屋\\(.*\\)"],
  ignoredPatterns: ["^名無し$", "^新田隼人$"]
};

// 初期設定のロードまたは初期化
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["hiddenRooms", "regHiddenRooms", "ignoredPatterns"], (data) => {
    if (!data.hiddenRooms || !data.regHiddenRooms || !data.ignoredPatterns) {
      console.log("[Background] 設定を初期化します...");
      chrome.storage.local.set(defaultSettings, () => {
        console.log("[Background] 初期設定を保存しました。");
      });
    }
  });
});

// ポップアップやコンテンツスクリプトからのメッセージを処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSettings") {
    // 設定データを取得して返す
    chrome.storage.local.get(["hiddenRooms", "regHiddenRooms", "ignoredPatterns"], (data) => {
      sendResponse(data);
    });
    return true; // 非同期応答を示す
  } else if (message.type === "updateSettings") {
    // 設定データを更新
    const { hiddenRooms, regHiddenRooms, ignoredPatterns } = message.data;
    chrome.storage.local.set({ hiddenRooms, regHiddenRooms, ignoredPatterns }, () => {
      console.log("[Background] 設定が更新されました。");
      sendResponse({ status: "success" });
    });
    return true;
  }
});

// ストレージ変更を監視し、必要に応じて処理
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    console.log("[Background] ストレージが変更されました:", changes);
    // 必要に応じて処理を追加
  }
});
