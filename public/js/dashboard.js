const form = document.getElementById('settings-form');
const bgTypeSelect = document.getElementById('bgType');
const socialsList = document.getElementById('socials-list');
const addSocialBtn = document.getElementById('add-social');
const saveStatus = document.getElementById('save-status');
const previewIframe = document.getElementById('preview-iframe');

const initial = window.__INITIAL_SETTINGS__ || {};

// ---------- checkbox initial state (glow.*) ----------
Object.entries(initial.glow || {}).forEach(([key, val]) => {
    const el = form.querySelector(`[name="glow.${key}"]`);
    if (el) el.checked = Boolean(val);
});

// ---------- select initial state (some browsers don't respect server-rendered <option selected>) ----------
['usernameEffect', 'bioEffect', 'backgroundType', 'backgroundEffect'].forEach((name) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el && initial[name]) el.value = initial[name];
});

// ---------- background type field toggling ----------
function updateBgFields() {
    const type = bgTypeSelect.value;
    document.querySelectorAll('.bg-field').forEach((field) => {
        field.classList.toggle('active', field.dataset.for === type);
    });
}
bgTypeSelect.addEventListener('change', updateBgFields);
updateBgFields();

// ---------- socials editor ----------
function addSocialRow(platform = '', url = '') {
    const row = document.createElement('div');
    row.className = 'social-row';
    row.innerHTML = `
        <input type="text" class="social-platform" placeholder="แพลตฟอร์ม เช่น Discord" value="${platform}">
        <input type="url" class="social-url" placeholder="https://..." value="${url}">
        <button type="button" title="ลบ">✕</button>
    `;
    row.querySelector('button').addEventListener('click', () => row.remove());
    socialsList.appendChild(row);
}
(initial.socials || []).forEach((s) => addSocialRow(s.platform, s.url));
addSocialBtn.addEventListener('click', () => addSocialRow());

// ---------- form submit ----------
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {};
    const glow = {};

    for (const [key, value] of fd.entries()) {
        if (key.startsWith('glow.')) {
            const glowKey = key.split('.')[1];
            glow[glowKey] = form.querySelector(`[name="${key}"]`).checked;
        } else {
            payload[key] = value;
        }
    }
    // make sure unchecked boxes are captured too
    ['username', 'description', 'location', 'socials'].forEach((k) => {
        const el = form.querySelector(`[name="glow.${k}"]`);
        if (el) glow[k] = el.checked;
    });
    payload.glow = glow;

    payload.socials = Array.from(socialsList.querySelectorAll('.social-row'))
        .map((row) => ({
            platform: row.querySelector('.social-platform').value.trim(),
            url: row.querySelector('.social-url').value.trim(),
        }))
        .filter((s) => s.platform && s.url);

    saveStatus.textContent = 'กำลังบันทึก...';
    try {
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.ok) {
            saveStatus.textContent = 'บันทึกแล้ว ✓';
            previewIframe.src = previewIframe.src; // reload preview
            setTimeout(() => (saveStatus.textContent = ''), 2000);
        } else {
            saveStatus.textContent = 'บันทึกไม่สำเร็จ';
            saveStatus.style.color = '#ed4245';
        }
    } catch (err) {
        saveStatus.textContent = 'เกิดข้อผิดพลาด';
        saveStatus.style.color = '#ed4245';
    }
});
