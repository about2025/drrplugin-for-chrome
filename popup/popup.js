document.addEventListener("DOMContentLoaded", () => {
  const hiddenRoomsInput = document.getElementById("hidden-rooms");
  const regexRoomsInput = document.getElementById("regex-rooms");
  const ignoredNamesInput = document.getElementById("ignored-names");
  const form = document.getElementById("settings-form");

  // 初期設定をロード
  chrome.storage.local.get(["hiddenRooms", "regHiddenRooms", "ignoredPatterns"], (result) => {
    hiddenRoomsInput.value = result.hiddenRooms?.join(", ") || "";
    regexRoomsInput.value = result.regHiddenRooms?.join("\n") || "";
    ignoredNamesInput.value = result.ignoredPatterns?.join("\n") || "";
  });

  // 設定を保存
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const hiddenRooms = hiddenRoomsInput.value.split(",").map((room) => room.trim());
    const regHiddenRooms = regexRoomsInput.value.split("\n").map((regex) => regex.trim());
    const ignoredPatterns = ignoredNamesInput.value.split("\n").map((regex) => regex.trim());

    chrome.storage.local.set({ hiddenRooms, regHiddenRooms, ignoredPatterns }, () => {
      alert("設定が保存されました！");
    });
  });
});
