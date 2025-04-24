// --- Function to type encrypted message into WhatsApp Web ---
function typeMessage(encryptedMessage) {
  const inputBox = document.querySelector("footer div[contenteditable='true']");

  if (inputBox) {
    inputBox.focus();

    // Use execCommand as a workaround to insert text (safer for WhatsApp Web)
    document.execCommand('insertText', false, encryptedMessage);

    // Dispatch input event so WhatsApp detects the typed content
    inputBox.dispatchEvent(new InputEvent("input", { bubbles: true }));
    console.log("✅ Encrypted message typed into WhatsApp input box.");
  } else {
    console.error("❌ WhatsApp input box not found.");
  }
}

// --- Listen for messages from popup.js ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Received message from popup.js:", message);

  if (message.action === "sendMessage") {
    typeMessage(message.text);
    sendResponse({ status: "success" });
  }
});

// --- Detect dynamic loading of WhatsApp Web and prepare when ready ---
function observePageChanges() {
  const observer = new MutationObserver(() => {
    const inputBox = document.querySelector("footer div[contenteditable='true']");
    if (inputBox) {
      console.log("✅ WhatsApp Web input detected. Ready to type messages.");
      observer.disconnect(); // Stop watching once detected
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Start observing as soon as content script loads
observePageChanges();
