
# Drrrkari Lounge Filter

## 概要

`Drrrkari Lounge Filter` は、[デュラララチャット(仮)](https://drrrkari.com/lounge/) の特定の部屋を非表示にするための Chrome 拡張機能です。  
本拡張機能は、ユーザーが指定した部屋名に基づいて該当する部屋をページから非表示にします。

---

## 機能

- 指定された部屋名（例: **誰でも歓迎部屋**, **雑談部屋(画像OFF)**）を非表示にします。
- 動的に追加される部屋もリアルタイムで監視し、非表示にします。

---

## インストール方法

### 必要条件

- Google Chrome または Chromium ブラウザ
- デベロッパーモードを有効化

### 手順

1. **リポジトリをクローンまたはダウンロード**
   - プロジェクトをローカル環境にクローンまたはダウンロードしてください。

2. **ファイル構成**
   以下のようにファイルが配置されていることを確認してください。

   ```
   /manifest.json
   /content.js
   /README.md
   ```

3. **Chrome に拡張機能を読み込む**
   - Chrome の「拡張機能」ページを開きます。
   - 右上の「デベロッパーモード」を有効にします。
   - 「パッケージ化されていない拡張機能を読み込む」をクリックし、プロジェクトフォルダを選択します。

4. **拡張機能を有効化**
   - 拡張機能一覧に追加された `Drrrkari Lounge Filter` を有効化してください。

5. **動作確認**
   - [Drrrkari Lounge](https://drrrkari.com/lounge/) を開き、指定された部屋（例: **誰でも歓迎部屋**, **雑談部屋(画像OFF)**）が非表示になっていることを確認します。

---

## ファイル詳細

### `manifest.json`
拡張機能の設定ファイル。以下のような情報が記載されています。

```json
{
  "manifest_version": 3,
  "name": "Drrrkari Lounge Filter",
  "version": "1.0",
  "description": "特定の部屋を非表示にするChrome拡張",
  "permissions": ["scripting"],
  "host_permissions": ["https://drrrkari.com/*"],
  "content_scripts": [
    {
      "matches": ["https://drrrkari.com/lounge/"],
      "js": ["content.js"]
    }
  ]
}
```

### `content.js`
非表示にしたい部屋を指定し、その部屋を非表示にするスクリプト。

```javascript
// 対象となる部屋の名前
const hiddenRooms = ["誰でも歓迎部屋", "雑談部屋(画像OFF)"];

// 部屋を非表示にする関数
function hideRooms() {
  const roomElements = document.querySelectorAll("#room_list ul.rooms");
  roomElements.forEach((room) => {
    const roomNameElement = room.querySelector(".name");
    if (roomNameElement) {
      const roomName = roomNameElement.innerText.trim();
      if (hiddenRooms.includes(roomName)) {
        console.log(`Hiding room: ${roomName}`);
        room.style.display = "none";
      }
    }
  });
}

// DOMの変更を監視して部屋を非表示にする
const observer = new MutationObserver(() => {
  hideRooms();
});

// 対象エリアを監視
const targetNode = document.getElementById("room_list");
if (targetNode) {
  hideRooms();
  observer.observe(targetNode, { childList: true, subtree: true });
} else {
  console.error("Target node #room_list not found!");
}
```

---

## 今後の改良予定

- UIを追加して、ユーザーがブラウザ上で非表示にする部屋名を指定できるようにする。
- 他のページ（例: `/room/`）にも対応。

---

## ライセンス

このプロジェクトは MIT ライセンスの下で提供されます。
