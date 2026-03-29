const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const resultSection = document.getElementById('resultSection');
const embedCodeInput = document.getElementById('embedCode');
const previewContainer = document.getElementById('preview');
const notification = document.getElementById('notification');

function generateWidget() {
    const username = document.getElementById('username').value.trim();
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const borderColor = document.getElementById('borderColor').value;
    const borderRadius = document.getElementById('borderRadius').value;

    if (!username) {
        showNotification('Введите имя пользователя!');
        return;
    }

    const playlistId = username.includes('/') ? '' : '1010';
    const userPart = username.includes('/playlist/') 
        ? username.split('/playlist/')[1].split('/')[0]
        : username;

    const srcUrl = username.includes('/playlist/')
        ? username
        : `https://music.yandex.ru/iframe/playlist/${userPart}/${playlistId}`;

    const embedCode = `<div style="width:${width}px;max-width:100%;border:2px solid ${borderColor};border-radius:${borderRadius}px;overflow:hidden;">
  <iframe frameborder="0" allow="clipboard-write" src="${srcUrl}" style="width:100%;height:${height}px;border:none;"></iframe>
</div>`;

    embedCodeInput.value = embedCode;
    previewContainer.innerHTML = embedCode;
    resultSection.classList.add('show');

    navigator.clipboard.writeText(embedCode).then(() => {
        showNotification('Код скопирован в буфер обмена!');
    }).catch(() => {
        showNotification('Код готов к копированию!');
    });

    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyCode() {
    const code = embedCodeInput.value;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Код скопирован!');
    }).catch(() => {
        embedCodeInput.select();
        showNotification('Выделите и скопируйте код!');
    });
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

generateBtn.addEventListener('click', generateWidget);
copyBtn.addEventListener('click', copyCode);

const htmlModal = document.getElementById('htmlModal');
const htmlCodeInput = document.getElementById('htmlCodeInput');
const addWidgetOpenBtn = document.getElementById('addWidgetOpenBtn');
const addWidgetBtn = document.getElementById('addWidgetBtn');
const cancelWidgetBtn = document.getElementById('cancelWidgetBtn');
const widgetsContainer = document.getElementById('widgetsContainer');

let widgetCount = 0;

addWidgetOpenBtn.addEventListener('click', () => {
    htmlModal.classList.add('show');
    htmlCodeInput.value = '';
    htmlCodeInput.focus();
});

cancelWidgetBtn.addEventListener('click', () => {
    htmlModal.classList.remove('show');
});

htmlModal.addEventListener('click', (e) => {
    if (e.target === htmlModal) {
        htmlModal.classList.remove('show');
    }
});

addWidgetBtn.addEventListener('click', () => {
    const htmlCode = htmlCodeInput.value.trim();
    if (!htmlCode) {
        showNotification('Введите HTML код!');
        return;
    }

    widgetCount++;
    const widgetId = 'widget-' + widgetCount;

    const widgetItem = document.createElement('div');
    widgetItem.className = 'widget-item';
    widgetItem.id = widgetId;
    widgetItem.innerHTML = `
        <button class="widget-delete" onclick="removeWidget('${widgetId}')">✕ Удалить</button>
        <div class="widget-content">${htmlCode}</div>
    `;

    widgetsContainer.appendChild(widgetItem);
    htmlModal.classList.remove('show');
    showNotification('Виджет добавлен!');

    saveWidgetsToStorage();
});

window.removeWidget = function(widgetId) {
    const widget = document.getElementById(widgetId);
    if (widget) {
        widget.remove();
        showNotification('Виджет удалён!');
        saveWidgetsToStorage();
    }
};

function saveWidgetsToStorage() {
    const widgets = [];
    document.querySelectorAll('.widget-item').forEach(item => {
        widgets.push({
            id: item.id,
            html: item.querySelector('.widget-content').innerHTML
        });
    });
    localStorage.setItem('siteWidgets', JSON.stringify(widgets));
}

function loadWidgetsFromStorage() {
    const saved = localStorage.getItem('siteWidgets');
    if (saved) {
        try {
            const widgets = JSON.parse(saved);
            widgets.forEach(w => {
                const widgetItem = document.createElement('div');
                widgetItem.className = 'widget-item';
                widgetItem.id = w.id;
                widgetItem.innerHTML = `
                    <button class="widget-delete" onclick="removeWidget('${w.id}')">✕ Удалить</button>
                    <div class="widget-content">${w.html}</div>
                `;
                widgetsContainer.appendChild(widgetItem);
                const num = parseInt(w.id.replace('widget-', ''));
                if (num > widgetCount) widgetCount = num;
            });
        } catch (e) {
            console.error('Error loading widgets:', e);
        }
    }
}

loadWidgetsFromStorage();
