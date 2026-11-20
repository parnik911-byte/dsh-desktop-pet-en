/** Dev-only: verify theme renders when backdrop-filter is disabled (offscreen
 *  software compositing turns blur surfaces black — real windows are fine). */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 640, height: 640, show: false, frame: false, backgroundColor: "#f9fafb",
    webPreferences: { offscreen: true, backgroundThrottling: false, preload: path.join(__dirname, "..", "preload.js") },
  });
  await win.loadFile(path.join(__dirname, "..", "renderer", "index.html"), { query: { chat: "1" } });
  await new Promise((r) => setTimeout(r, 600));
  await win.webContents.executeJavaScript(`
    (() => {
      document.getElementById("chat").classList.remove("hidden");
      document.body.dataset.chatOpen = "1";
      // neutralize backdrop-filter for the software-composited capture
      const st = document.createElement("style");
      st.textContent = "*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}";
      document.head.append(st);
      // paint a realistic conversation with frosted tool cards (input/output io)
      const msgs = document.getElementById("chat-messages");
      msgs.innerHTML =
        '<div class="chat-truncated-note">⏳ This conversation is long/old — showing only the latest 250 messages (480 earlier ones omitted)</div>' +
        '<div class="chat-row chat-user"><div class="chat-bubble">Whale Girl, make the chat box look like the web version~</div></div>' +
        // consecutive tool calls collapse into ONE group — head shows the latest
        '<div class="chat-tool-group collapsed">' +
          '<button type="button" class="chat-tool-group-head">' +
            '<span class="chat-tool-group-count">🛠️ Tool calls × 3</span>' +
            '<span class="chat-tool-group-preview">⚡ Run command · Get-Process | Select-Object -First 3</span>' +
            '<span class="chat-tool-group-chevron">▸</span>' +
          '</button>' +
          '<div class="chat-tool-group-body">' +
            '<div class="chat-tool" data-call-id="c2">' +
              '<div class="chat-tool-head"><span class="chat-tool-icon">🛠️</span><span class="chat-tool-name">🔎 Search content</span><span class="chat-tool-sep"></span><span class="chat-tool-summary">pattern: chat-bg in renderer</span></div>' +
              '<div class="chat-tool-io"><span class="chat-tool-io-label">Input</span><code class="chat-tool-io-text">{"pattern":"chat-bg","path":"renderer"}</code></div>' +
              '<div class="chat-tool-io"><span class="chat-tool-io-label">Output</span><code class="chat-tool-io-text">renderer/pet.css: chat-bg.webp 50% 0% / cover no-repeat</code></div>' +
            '</div>' +
            '<div class="chat-tool" data-call-id="c1">' +
              '<div class="chat-tool-head"><span class="chat-tool-icon">🛠️</span><span class="chat-tool-name">📖 Read file</span><span class="chat-tool-sep"></span><span class="chat-tool-summary">renderer/pet.css</span></div>' +
              '<div class="chat-tool-io"><span class="chat-tool-io-label">Input</span><code class="chat-tool-io-text">{"file_path":"renderer/pet.css"}</code></div>' +
            '</div>' +
            '<div class="chat-tool" data-running data-call-id="c0">' +
              '<div class="chat-tool-head"><span class="chat-tool-icon">🛠️</span><span class="chat-tool-name">⚡ Run command</span><span class="chat-tool-sep"></span><span class="chat-tool-summary">Get-Process | Select-Object -First 3</span></div>' +
              '<div class="chat-tool-io"><span class="chat-tool-io-label">Input</span><code class="chat-tool-io-text">{"command":"Get-Process | Select-Object -First 3"}</code></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="chat-row chat-assistant"><div class="chat-bubble">OK! I merge consecutive tool calls into one small card — click it to expand~ 🐳</div></div>' +
        '<div class="chat-row chat-user"><div class="chat-bubble">Awesome, thanks!</div></div>';
      document.getElementById("chat-title-label").textContent = "🐳 Chat with Whale Girl";
      // whale-girl avatar in the title bar (first idle frame)
      const av = document.getElementById("chat-avatar");
      av.style.backgroundImage = "url('pet://assets/characters/whale-girl/idle.png')";
      av.style.backgroundSize = "300% 100%";
      av.style.backgroundPosition = "0 0";
      av.style.display = "inline-block";
      document.getElementById("chat-stats").textContent = "Turn 3  ·  Input 1.2k tok · Output 856 tok  ·  Cache hit 62%";
      document.getElementById("chat-input").value = "Tell me about your ribbon…";
      return true;
    })()
  `);
  await new Promise((r) => setTimeout(r, 300));
  const img = await win.webContents.capturePage();
  const out = path.join(__dirname, "..", "docs", "chat-theme-preview.png");
  fs.writeFileSync(out, img.toPNG());
  console.log("preview saved:", out);
  app.quit();
});
