// --- Cipher Functions ---

function affineEncrypt(text, a, b) {
    let result = '';
    for (let char of text) {
      if (/[a-zA-Z]/.test(char)) {
        const base = char === char.toUpperCase() ? 65 : 97;
        const shifted = ((char.charCodeAt(0) - base) * a + b) % 26;
        result += String.fromCharCode(shifted + base);
      } else {
        result += char;
      }
    }
    return result;
  }
  
  function affineDecrypt(text, a, b) {
    const modInvA = modInverse(a, 26);
    let result = '';
    for (let char of text) {
      if (/[a-zA-Z]/.test(char)) {
        const base = char === char.toUpperCase() ? 65 : 97;
        const shifted = ((char.charCodeAt(0) - base - b + 26) * modInvA) % 26;
        result += String.fromCharCode(shifted + base);
      } else {
        result += char;
      }
    }
    return result;
  }
  
  function vigenereEncrypt(text, key) {
    key = key.toLowerCase();
    let result = '', keyIndex = 0;
    for (let char of text) {
      if (/[a-zA-Z]/.test(char)) {
        const shift = key.charCodeAt(keyIndex % key.length) - 97;
        const base = char === char.toUpperCase() ? 65 : 97;
        const shifted = (char.charCodeAt(0) - base + shift) % 26;
        result += String.fromCharCode(shifted + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }
  
  function vigenereDecrypt(text, key) {
    key = key.toLowerCase();
    let result = '', keyIndex = 0;
    for (let char of text) {
      if (/[a-zA-Z]/.test(char)) {
        const shift = key.charCodeAt(keyIndex % key.length) - 97;
        const base = char === char.toUpperCase() ? 65 : 97;
        const shifted = (char.charCodeAt(0) - base - shift + 26) % 26;
        result += String.fromCharCode(shifted + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }
  
  function transpositionEncrypt(text) {
    let even = '', odd = '';
    for (let i = 0; i < text.length; i++) {
      if (i % 2 === 0) even += text[i];
      else odd += text[i];
    }
    return even + odd;
  }
  
  function transpositionDecrypt(text) {
    const mid = Math.ceil(text.length / 2);
    const first = text.slice(0, mid);
    const second = text.slice(mid);
    let result = '';
    for (let i = 0; i < mid; i++) {
      result += first[i];
      if (i < second.length) result += second[i];
    }
    return result;
  }
  
  function streamXOREncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const xorChar = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(xorChar);
    }
    return result;
  }
  
  function streamXORDecrypt(text, key) {
    return streamXOREncrypt(text, key); // XOR is symmetric
  }
  
  function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    throw new Error("No modular inverse");
  }
  
  // --- Ultimate Cipher Functions ---
  function ultimateEncrypt(text, a, b, vigKey, xorKey) {
    let step1 = affineEncrypt(text, a, b);
    let step2 = vigenereEncrypt(step1, vigKey);
    let step3 = transpositionEncrypt(step2);
    let final = streamXOREncrypt(step3, xorKey);
    return btoa(final); // Convert binary to base64
  }
  
  function ultimateDecrypt(text, a, b, vigKey, xorKey) {
    let decoded = atob(text); // Base64 to binary
    let step1 = streamXORDecrypt(decoded, xorKey);
    let step2 = transpositionDecrypt(step1);
    let step3 = vigenereDecrypt(step2, vigKey);
    let final = affineDecrypt(step3, a, b);
    return final;
  }
  
  // --- Button Event Listeners ---
  document.getElementById('encryptBtn').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    const a = parseInt(document.getElementById('aKey').value);
    const b = parseInt(document.getElementById('bKey').value);
    const vigKey = document.getElementById('vigKey').value;
    const xorKey = document.getElementById('xorKey').value;
    const encrypted = ultimateEncrypt(text, a, b, vigKey, xorKey);
    document.getElementById('resultOutput').value = encrypted;
  
    // Inject to WhatsApp Web input box
    chrome.scripting.executeScript({
      target: { tabId: chrome.tabs.TAB_ID_CURRENT },
      func: (msg) => {
        const box = document.querySelector('[contenteditable="true"]');
        if (box) {
          box.textContent = msg;
          const event = new InputEvent('input', { bubbles: true });
          box.dispatchEvent(event);
        }
      },
      args: [encrypted]
    });
  });
  
  document.getElementById('decryptBtn').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    const a = parseInt(document.getElementById('aKey').value);
    const b = parseInt(document.getElementById('bKey').value);
    const vigKey = document.getElementById('vigKey').value;
    const xorKey = document.getElementById('xorKey').value;
    try {
      const decrypted = ultimateDecrypt(text, a, b, vigKey, xorKey);
      document.getElementById('resultOutput').value = decrypted;
    } catch (e) {
      document.getElementById('resultOutput').value = "Decryption Error!";
    }
  });
  