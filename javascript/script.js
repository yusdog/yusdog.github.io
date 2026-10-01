// Yusdog Games - script.js
const VALID_KEYS = ["kittensarecool123"];

function submitKey(e) {
    if (e) e.preventDefault();
    if (window.YusdogSecurity && typeof window.YusdogSecurity.submitKey === 'function') {
        window.YusdogSecurity.submitKey(e);
        return;
    }
    const input = document.getElementById('keyInput');
    const error = document.getElementById('keyError');
    if (!input) return;
    const value = input.value.trim().toLowerCase();
    if (VALID_KEYS.includes(value)) {
        try {
            localStorage.setItem('yusdog_key_version', 'v3_kittens');
            localStorage.setItem('yusdog_key_unlocked', 'true');
            localStorage.setItem('yusdog_key_v3', 'true');
        } catch (err) {
            console.error(err);
        }
        const gate = document.getElementById('keyGateOverlay');
        if (gate) {
            gate.style.display = 'none';
        }
    } else {
        if (error) {
            error.textContent = "Invalid key. Please try again.";
        }
        input.classList.add('key-shake');
        setTimeout(() => input.classList.remove('key-shake'), 400);
        input.focus();
    }
}

function lockSite() {
    closePopup();
    try {
        localStorage.removeItem('yusdog_key_unlocked');
    } catch (e) {}
    window.location.href = '/';
}

function cloakIcon(url) {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
    }
    link.href = url;
    document.head.appendChild(link);
}

function cloakName(string) {
    if ((string + "").trim().length === 0) {
        document.title = "yusdog";
        return;
    }
    document.title = string;
}

function tabCloak() {
    closePopup();
    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');
    if (popupTitle) popupTitle.textContent = "Tab Cloak";
    if (popupBody) {
        popupBody.innerHTML = `
            <label for="tab-cloak-textbox" style="font-weight: bold;">Set Tab Title:</label><br>
            <input type="text" id="tab-cloak-textbox" placeholder="Enter new tab name..." oninput="cloakName(this.value)">
            <br><br><br><br>
            <label for="tab-cloak-iconbox" style="font-weight: bold;">Set Tab Icon:</label><br>
            <input type="text" id="tab-cloak-iconbox" placeholder="Enter new tab icon URL..." oninput='cloakIcon(this.value)'>
            <br><br><br>
        `;
        popupBody.contentEditable = false;
    }
    const popup = document.getElementById('popupOverlay');
    if (popup) popup.style.display = "flex";
}

const settingsBtn = document.getElementById('settings');
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        const popupTitle = document.getElementById('popupTitle');
        const popupBody = document.getElementById('popupBody');
        if (popupTitle) popupTitle.textContent = "Settings";
        if (popupBody) {
            popupBody.innerHTML = `
                <button id="settings-button" onclick="tabCloak()">Tab Cloak</button>
                <button id="settings-button" onclick="lockSite()" style="background-color: #241416; border-color: #4a2024; color: #ff6b6b;">Lock Site</button>
            `;
            popupBody.contentEditable = false;
        }
        const popup = document.getElementById('popupOverlay');
        if (popup) popup.style.display = "flex";
    });
}

function showContact() {
    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');
    if (popupTitle) popupTitle.textContent = "Contact";
    if (popupBody) {
        popupBody.innerHTML = `
            <p>Discord: <a href="https://discord.gg/NAFw4ykZ7n" target="_blank" style="color: #ffffff; text-decoration: underline;">https://discord.gg/NAFw4ykZ7n</a></p>
            <p>Email: youcancontactyusuf@gmail.com</p>
        `;
        popupBody.contentEditable = false;
    }
    const popup = document.getElementById('popupOverlay');
    if (popup) popup.style.display = "flex";
}

function loadPrivacy() {
    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');
    if (popupTitle) popupTitle.textContent = "Privacy Policy";
    if (popupBody) {
        popupBody.innerHTML = `
            <div style="max-height: 60vh; overflow-y: auto;">
                <h2>PRIVACY POLICY</h2>
                <p>Last updated April 17, 2025</p>
                <p>This Privacy Notice for yusdog ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services.</p>
                <p>If you have any questions or concerns, please contact us at <a href="https://discord.gg/NAFw4ykZ7n" target="_blank" style="color: #ffffff; text-decoration: underline;">https://discord.gg/NAFw4ykZ7n</a>.</p>
            </div>
        `;
        popupBody.contentEditable = false;
    }
    const popup = document.getElementById('popupOverlay');
    if (popup) popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById('popupOverlay');
    if (popup) popup.style.display = "none";
}

function saveData() {
    let data = JSON.stringify(localStorage) + "\n\n|\n\n" + document.cookie;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    link.download = `${Date.now()}.data`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const [localStorageData, cookieData] = content.split("\n\n|\n\n");
        try {
            const parsedData = JSON.parse(localStorageData);
            for (let key in parsedData) {
                localStorage.setItem(key, parsedData[key]);
            }
        } catch (error) {}
        if (cookieData) {
            const cookies = cookieData.split("; ");
            cookies.forEach(cookie => {
                document.cookie = cookie;
            });
        }
        alert("Data loaded");
    };
    reader.readAsText(file);
}

window.addEventListener('click', (e) => {
    const popup = document.getElementById('popupOverlay');
    if (popup && e.target === popup) {
        closePopup();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePopup();
    }
});
