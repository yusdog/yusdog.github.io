// Yusdog Platform Security & Device Ban Engine
(function (window) {
    'use strict';

    const KEY_VERSION = 'v3_kittens';
    const VALID_KEYS = ['kittensarecool123'];
    const IDB_NAME = 'yusdog_sec_vault';
    const IDB_STORE = 'security_profile';
    const IDB_VERSION = 1;

    // Comprehensive list of inappropriate/offensive words/slurs that trigger instant device ban
    const INAPPROPRIATE_PATTERNS = [
        /\bn[i1l]gg/i,
        /\bfag/i,
        /\bretard/i,
        /\bch[i1]nk/i,
        /\bsp[i1]c\b/i,
        /\bk[i1]ke\b/i,
        /\bwhore\b/i,
        /\bslut\b/i,
        /\bhitler\b/i,
        /\bnazi\b/i,
        /\brape/i,
        /\bchildporn/i,
        /\bcp\b/i,
        /\bporn/i,
        /\bsex\b/i,
        /\bdick\b/i,
        /\bcock\b/i,
        /\bpussy\b/i,
        /\bcunt\b/i,
        /\basshole\b/i,
        /\bbitch\b/i,
        /\bterrorist\b/i,
        /\bkillall\b/i,
        /\bsuicide\b/i
    ];

    // Compute Canvas Fingerprint
    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 240;
            canvas.height = 60;
            const ctx = canvas.getContext('2d');
            if (!ctx) return 'no-canvas';
            ctx.textBaseline = 'top';
            ctx.font = "14px 'Arial', sans-serif";
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Yusdog,Device#1🔒', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Yusdog,Device#1🔒', 4, 17);
            return canvas.toDataURL();
        } catch (e) {
            return 'canvas-err';
        }
    }

    // Compute WebGL Fingerprint
    function getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'no-webgl';
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                return `${vendor}~${renderer}`;
            }
            return gl.getParameter(gl.RENDERER) || 'webgl-basic';
        } catch (e) {
            return 'webgl-err';
        }
    }

    // Fast 32-bit FNV-1a Hash
    function fnv1a(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16);
    }

    // Generate unique, persistent Hardware Device Fingerprint ID
    function generateDeviceFingerprint() {
        const parts = [
            navigator.userAgent || '',
            navigator.language || '',
            screen.width + 'x' + screen.height + 'x' + (screen.colorDepth || 24),
            navigator.hardwareConcurrency || 'x',
            navigator.deviceMemory || 'm',
            getWebGLFingerprint(),
            fnv1a(getCanvasFingerprint())
        ];
        return 'yd_fp_' + fnv1a(parts.join('|'));
    }

    const DEVICE_ID = generateDeviceFingerprint();

    // Administrator hardware devices
    const ADMIN_DEVICES = ['yd_fp_e0a9e4a8', 'yd_fp_2d9b7922'];

    function isCurrentDeviceAdmin() {
        return ADMIN_DEVICES.includes(DEVICE_ID);
    }
    function openIDB() {
        return new Promise((resolve) => {
            if (!window.indexedDB) return resolve(null);
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: 'key' });
                }
            };
            req.onsuccess = function (e) {
                resolve(e.target.result);
            };
            req.onerror = function () {
                resolve(null);
            };
        });
    }

    async function getIDBValue(key) {
        const db = await openIDB();
        if (!db) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const store = tx.objectStore(IDB_STORE);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result ? req.result.val : null);
                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function setIDBValue(key, val) {
        const db = await openIDB();
        if (!db) return;
        try {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            const store = tx.objectStore(IDB_STORE);
            store.put({ key, val });
        } catch (e) {}
    }

    // Get list of known banned device fingerprints
    function getBannedFingerprintsList() {
        try {
            const raw = localStorage.getItem('yusdog_banned_devices_list');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function addBannedFingerprint(fp) {
        const list = getBannedFingerprintsList();
        if (!list.includes(fp)) {
            list.push(fp);
            try {
                localStorage.setItem('yusdog_banned_devices_list', JSON.stringify(list));
            } catch (e) {}
        }
    }

    // Check all layers for ban state
    async function isDeviceBanned() {
        if (isCurrentDeviceAdmin()) return false;
        // Layer 1: localStorage
        if (localStorage.getItem('yusdog_device_banned') === 'true') return true;
        // Layer 2: sessionStorage
        if (sessionStorage.getItem('yusdog_device_banned') === 'true') return true;
        // Layer 3: document.cookie
        if (document.cookie.includes('yusdog_banned=1')) return true;
        // Layer 4: Banned Fingerprint registry
        if (getBannedFingerprintsList().includes(DEVICE_ID)) return true;
        // Layer 5: IndexedDB
        const idbBanned = await getIDBValue('banned');
        if (idbBanned === 'true') return true;

        const idbBannedFp = await getIDBValue('banned_device_id');
        if (idbBannedFp === DEVICE_ID) return true;

        return false;
    }

    // Render permanent unbypassable ban screen
    function showBanScreen(reason) {
        const banHtml = `
            <div id="permanentBanOverlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: #050507;
                color: #ffffff;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 24px;
                box-sizing: border-box;
                text-align: center;
            ">
                <div style="
                    background: #111114;
                    border: 1px solid #3d1417;
                    border-radius: 16px;
                    max-width: 520px;
                    width: 100%;
                    padding: 40px 32px;
                    box-shadow: 0 24px 70px rgba(255, 30, 30, 0.2), 0 0 0 1px rgba(255, 60, 60, 0.1);
                    animation: banShake 0.4s ease;
                ">
                    <div style="font-size: 56px; margin-bottom: 16px; line-height: 1;">⛔</div>
                    <h1 style="color: #ff3b30; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 12px 0;">
                        DEVICE PERMANENTLY BANNED
                    </h1>
                    <p style="color: #d1d1d6; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                        This physical device has been permanently restricted from accessing the <strong>Yusdog</strong> platform (Games and Movies) due to a serious terms violation.
                    </p>
                    ${reason ? `<div style="background: #200d0e; border: 1px solid #5a1e22; border-radius: 8px; padding: 12px; margin-bottom: 20px; color: #ff8585; font-size: 13px; font-weight: 600;">Violation: ${reason}</div>` : ''}
                    <div style="background: #09090b; border: 1px solid #222225; border-radius: 10px; padding: 14px; text-align: left; font-size: 12px; color: #8e8e93; margin-bottom: 22px; font-family: monospace;">
                        <div><strong>DEVICE SIGNATURE:</strong> ${DEVICE_ID}</div>
                        <div style="margin-top: 4px;"><strong>STATUS:</strong> HARDWARE_LOCKOUT_ACTIVE</div>
                        <div style="margin-top: 4px;"><strong>IP RESET:</strong> INEFFECTIVE</div>
                        <div style="margin-top: 4px;"><strong>COOKIE CLEAR:</strong> INEFFECTIVE</div>
                    </div>
                    <p style="color: #636366; font-size: 13px; margin: 0; line-height: 1.5;">
                        Resetting browser cookies, switching networks, changing IP addresses, or using incognito mode will <strong>not</strong> restore access. This decision is final.
                    </p>
                </div>
            </div>
            <style>
                @keyframes banShake {
                    0%, 100% { transform: scale(1); }
                    20%, 60% { transform: scale(1.02) translateX(-4px); }
                    40%, 80% { transform: scale(1.02) translateX(4px); }
                }
            </style>
        `;
        document.body.innerHTML = banHtml;
        window.stop && window.stop();
    }

    // Execute instant ban on current device
    async function banCurrentDevice(reason) {
        if (isCurrentDeviceAdmin()) return;
        reason = reason || 'Violation of Platform Rules';
        // Layer 1
        try { localStorage.setItem('yusdog_device_banned', 'true'); } catch (e) {}
        try { localStorage.setItem('yusdog_ban_reason', reason); } catch (e) {}
        try { localStorage.removeItem('yusdog_key_unlocked'); } catch (e) {}
        try { localStorage.removeItem('yusdog_key_v3'); } catch (e) {}
        try { localStorage.removeItem('yusdog_key_version'); } catch (e) {}
        // Layer 2
        try { sessionStorage.setItem('yusdog_device_banned', 'true'); } catch (e) {}
        // Layer 3: Cookie (10 years)
        document.cookie = 'yusdog_banned=1; path=/; max-age=315360000; SameSite=Lax';
        // Layer 4: Banned Fingerprints list
        addBannedFingerprint(DEVICE_ID);
        // Layer 5: IndexedDB
        await setIDBValue('banned', 'true');
        await setIDBValue('banned_device_id', DEVICE_ID);
        await setIDBValue('ban_reason', reason);

        showBanScreen(reason);
    }

    // Enforce Key Invalidation (Kick out anyone with old key)
    function enforceKeyFreshness() {
        try {
            if (localStorage.getItem('yusdog_key_version') !== KEY_VERSION) {
                localStorage.removeItem('yusdog_key_unlocked');
                localStorage.removeItem('yusdog_key_v2');
                localStorage.removeItem('yusdog_key_v3');
                localStorage.removeItem('yusdog_key_version');
            }
        } catch (e) {}
    }

    // Submit Access Key handler
    function submitKey(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('keyInput');
        const error = document.getElementById('keyError');
        if (!input) return;
        const value = input.value.trim().toLowerCase();

        if (VALID_KEYS.includes(value)) {
            try {
                localStorage.setItem('yusdog_key_version', KEY_VERSION);
                localStorage.setItem('yusdog_key_unlocked', 'true');
                localStorage.setItem('yusdog_key_v3', 'true');
            } catch (err) {
                console.error(err);
            }
            const gate = document.getElementById('keyGateOverlay');
            if (gate) {
                gate.style.display = 'none';
            }
            if (typeof window.initNotice === 'function') {
                window.initNotice();
            }
        } else {
            if (error) {
                error.textContent = 'Invalid key. Please try again.';
            }
            input.classList.add('key-shake');
            setTimeout(() => input.classList.remove('key-shake'), 400);
            input.focus();
        }
    }

    // Relock site
    function lockSite() {
        if (typeof window.closePopup === 'function') {
            window.closePopup();
        }
        try {
            localStorage.removeItem('yusdog_key_unlocked');
            localStorage.removeItem('yusdog_key_v3');
            localStorage.removeItem('yusdog_key_version');
        } catch (e) {}
        window.location.href = '/';
    }

    // Check if username is inappropriate
    function checkUsernameInappropriate(username) {
        if (!username) return true;
        const clean = username.trim().toLowerCase();
        for (const pattern of INAPPROPRIATE_PATTERNS) {
            if (pattern.test(clean)) {
                return true;
            }
        }
        return false;
    }

    // Get locked username for this device
    async function getLockedUsername() {
        await enforceUsernameFreshness();
        let name = null;
        try { name = localStorage.getItem('yusdog_chat_username'); } catch (e) {}
        if (!name) {
            name = await getIDBValue('chat_username');
            if (name) {
                try { localStorage.setItem('yusdog_chat_username', name); } catch (e) {}
            }
        }
        return name;
    }

    // Permanently register username for this device
    async function registerLockedUsername(username) {
        username = (username || '').trim();
        if (!username) {
            throw new Error('Username cannot be empty.');
        }
        if (username.length < 3 || username.length > 20) {
            throw new Error('Username must be between 3 and 20 characters.');
        }
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(username)) {
            throw new Error('Username can only contain letters, numbers, underscores, and dashes.');
        }

        // Inappropriate name check -> triggers PERMANENT BAN
        if (checkUsernameInappropriate(username)) {
            await banCurrentDevice('Prohibited/inappropriate username: "' + username + '"');
            throw new Error('DEVICE_BANNED');
        }

        // Permanently lock
        try {
            localStorage.setItem('yusdog_chat_username', username);
            localStorage.setItem('yusdog_user_version', USERNAME_VERSION);
        } catch (e) {}
        await setIDBValue('chat_username', username);
        await setIDBValue('user_version', USERNAME_VERSION);
        document.cookie = `yusdog_chat_user=${encodeURIComponent(username)}; path=/; max-age=315360000; SameSite=Lax`;
        return username;
    }

    const USERNAME_VERSION = 'v2_restart';

    async function enforceUsernameFreshness() {
        try {
            if (localStorage.getItem('yusdog_user_version') !== USERNAME_VERSION) {
                localStorage.removeItem('yusdog_chat_username');
                localStorage.setItem('yusdog_user_version', USERNAME_VERSION);
                document.cookie = 'yusdog_chat_user=; path=/; max-age=0; SameSite=Lax';
                await setIDBValue('chat_username', null);
                await setIDBValue('user_version', USERNAME_VERSION);
            }
        } catch (e) {}
    }

    // Initialization routine
    async function initSecurity() {
        enforceKeyFreshness();
        await enforceUsernameFreshness();

        const banned = await isDeviceBanned();
        if (banned) {
            const reason = localStorage.getItem('yusdog_ban_reason') || await getIDBValue('ban_reason') || 'Violation of platform rules';
            showBanScreen(reason);
            return;
        }

        // If not unlocked, display Key Gate
        if (localStorage.getItem('yusdog_key_unlocked') !== 'true') {
            const gate = document.getElementById('keyGateOverlay');
            if (gate) {
                gate.style.display = 'flex';
            }
        }
    }

    // Public API
    window.YusdogSecurity = {
        DEVICE_ID,
        KEY_VERSION,
        VALID_KEYS,
        ADMIN_DEVICES,
        isCurrentDeviceAdmin,
        isDeviceBanned,
        banCurrentDevice,
        showBanScreen,
        submitKey,
        lockSite,
        checkUsernameInappropriate,
        getLockedUsername,
        registerLockedUsername,
        initSecurity
    };

    window.submitKey = submitKey;
    window.lockSite = lockSite;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

})(window);
