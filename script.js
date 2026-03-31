const addWidgetBtn = document.getElementById('addWidgetBtn');
const removeAllBtn = document.getElementById('removeAllBtn');
const widgetModal = document.getElementById('widgetModal');
const closeModal = document.querySelector('.close-modal');
const saveWidgetBtn = document.getElementById('saveWidgetBtn');
const widgetContainer = document.getElementById('widgetContainer');
const widgetCode = document.getElementById('widgetCode');
const widgetWidth = document.getElementById('widgetWidth');
const widgetHeight = document.getElementById('widgetHeight');
const autoAdapt = document.getElementById('autoAdapt');
const autoCenter = document.getElementById('autoCenter');
const modalTitle = document.getElementById('modalTitle');

const WIDGETS_KEY = 'musicPlayerWidgets';

let editingWidgetId = null;

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeIframeAttributes(iframe) {
    const allowedAttrs = ['src', 'width', 'height', 'style', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'];
    const trustedAttrs = {};
    
    allowedAttrs.forEach(attr => {
        if (iframe.hasAttribute(attr)) {
            let value = iframe.getAttribute(attr);
            if (attr === 'src' && value) {
                try {
                    const url = value.startsWith('//') ? 'https:' + value : value;
                    const parsed = new URL(url);
                    if (!['http:', 'https:'].includes(parsed.protocol)) {
                        return;
                    }
                } catch (e) {
                    return;
                }
            }
            trustedAttrs[attr] = value;
        }
    });
    
    return trustedAttrs;
}

function createSafeIframe(code) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;
    
    const iframe = tempDiv.querySelector('iframe');
    if (iframe) {
        const attrs = sanitizeIframeAttributes(iframe);
        if (Object.keys(attrs).length === 0) {
            return '';
        }
        let safeCode = '<iframe';
        for (const [key, value] of Object.entries(attrs)) {
            safeCode += ` ${key}="${escapeHTML(value)}"`;
        }
        safeCode += '></iframe>';
        return safeCode;
    }
    
    return code;
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 480) return 'mobile';
    if (width <= 768) return 'tablet';
    return 'desktop';
}

function getDefaultHeight() {
    const device = getDeviceType();
    if (device === 'mobile') return '150px';
    if (device === 'tablet') return '200px';
    return '300px';
}

function applyDeviceStyles() {
    const device = getDeviceType();
    document.body.dataset.device = device;
    
    document.querySelectorAll('.widget').forEach(widget => {
        const content = widget.querySelector('.widget-content');
        const isAutoAdapt = content.classList.contains('auto-adapt');
        
        if (isAutoAdapt) {
            const iframe = content.querySelector('iframe');
            if (iframe) {
                iframe.style.removeProperty('width');
                iframe.style.removeProperty('height');
                iframe.style.removeProperty('min-height');
                
                if (device === 'mobile') {
                    iframe.style.width = '100%';
                    iframe.style.height = '150px';
                    iframe.style.minHeight = '150px';
                } else if (device === 'tablet') {
                    iframe.style.width = '100%';
                    iframe.style.height = '200px';
                    iframe.style.minHeight = '200px';
                } else {
                    iframe.style.width = '100%';
                    iframe.style.height = getDefaultHeight();
                    iframe.style.minHeight = '200px';
                }
            }
        }
    });
}

function getWidgets() {
    const saved = localStorage.getItem(WIDGETS_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch (e) {
        return [];
    }
}

function saveWidgets() {
    const widgets = [];
    document.querySelectorAll('.widget').forEach(widget => {
        const content = widget.querySelector('.widget-content').innerHTML;
        const isAutoAdapt = widget.querySelector('.widget-content').classList.contains('auto-adapt');
        const isAutoCenter = widget.querySelector('.widget-content').classList.contains('auto-center');
        const width = widget.dataset.width || '100%';
        const height = widget.dataset.height || '300px';
        const id = widget.dataset.id;
        widgets.push({ id, content, autoAdapt: isAutoAdapt, autoCenter: isAutoCenter, width, height });
    });
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
}

function loadWidgets() {
    const widgets = getWidgets();
    widgets.forEach(w => {
        createWidget(w.content, w.autoAdapt, w.autoCenter, w.width, w.height, w.id);
    });
}

function createWidget(contentHTML, autoAdaptEnabled = false, autoCenterEnabled = true, width = '100%', height = '300px', id = null) {
    const widgetId = id || 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.dataset.id = widgetId;
    widget.dataset.width = width;
    widget.dataset.height = height;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'widget-controls';

    const editBtn = document.createElement('button');
    editBtn.className = 'widget-btn edit-btn';
    editBtn.innerHTML = '✎';
    editBtn.title = 'Изменить';
    editBtn.addEventListener('click', () => openEditModal(widgetId));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'widget-btn';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Удалить';
    removeBtn.addEventListener('click', () => {
        widget.remove();
        saveWidgets();
    });

    controlsDiv.appendChild(editBtn);
    controlsDiv.appendChild(removeBtn);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'widget-content';
    if (autoAdaptEnabled) contentWrapper.classList.add('auto-adapt');
    if (autoCenterEnabled) contentWrapper.classList.add('auto-center');
    contentWrapper.innerHTML = contentHTML;

    applyWidgetStyles(contentWrapper, autoAdaptEnabled, width, height);

    widget.appendChild(controlsDiv);
    widget.appendChild(contentWrapper);
    widgetContainer.appendChild(widget);
}

function applyWidgetStyles(contentWrapper, autoAdaptEnabled, width, height) {
    const iframe = contentWrapper.querySelector('iframe');
    if (iframe) {
        iframe.style.removeProperty('width');
        iframe.style.removeProperty('height');
        iframe.style.removeProperty('min-height');
        
        if (autoAdaptEnabled) {
            const device = getDeviceType();
            if (device === 'mobile') {
                iframe.style.width = '100%';
                iframe.style.height = '150px';
                iframe.style.minHeight = '150px';
            } else if (device === 'tablet') {
                iframe.style.width = '100%';
                iframe.style.height = '200px';
                iframe.style.minHeight = '200px';
            } else {
                iframe.style.width = '100%';
                iframe.style.height = '300px';
                iframe.style.minHeight = '200px';
            }
        } else {
            iframe.style.width = width;
            iframe.style.height = height;
        }
    }
}

function openModal() {
    editingWidgetId = null;
    modalTitle.textContent = 'Добавить виджет';
    saveWidgetBtn.textContent = 'Добавить';
    widgetCode.value = '';
    widgetWidth.value = '100%';
    widgetHeight.value = getDefaultHeight();
    autoAdapt.checked = false;
    autoCenter.checked = true;
    widgetModal.classList.add('show');
}

function openEditModal(widgetId) {
    const widget = document.querySelector(`.widget[data-id="${widgetId}"]`);
    if (!widget) return;

    editingWidgetId = widgetId;
    modalTitle.textContent = 'Изменить виджет';
    saveWidgetBtn.textContent = 'Сохранить';

    const contentWrapper = widget.querySelector('.widget-content');
    const iframe = contentWrapper.querySelector('iframe');
    
    if (iframe) {
        widgetCode.value = iframe.outerHTML;
    } else {
        widgetCode.value = contentWrapper.innerHTML;
    }

    widgetWidth.value = widget.dataset.width || '100%';
    widgetHeight.value = widget.dataset.height || getDefaultHeight();
    autoAdapt.checked = contentWrapper.classList.contains('auto-adapt');
    autoCenter.checked = contentWrapper.classList.contains('auto-center');

    widgetModal.classList.add('show');
}

function closeModalFunc() {
    widgetModal.classList.remove('show');
    editingWidgetId = null;
}

function showConfirmDialog(message, onConfirm) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog show';
    dialog.innerHTML = `
        <div class="confirm-content">
            <h3>${message}</h3>
            <div class="confirm-buttons">
                <button class="confirm-btn no">Отмена</button>
                <button class="confirm-btn yes">Удалить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('.confirm-btn.yes').addEventListener('click', () => {
        onConfirm();
        dialog.remove();
    });
    
    dialog.querySelector('.confirm-btn.no').addEventListener('click', () => {
        dialog.remove();
    });
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });
}

function removeAllWidgets() {
    if (widgetContainer.children.length === 0) return;
    
    showConfirmDialog('Удалить все виджеты?', () => {
        widgetContainer.innerHTML = '';
        localStorage.removeItem(WIDGETS_KEY);
    });
}

addWidgetBtn.addEventListener('click', openModal);
removeAllBtn.addEventListener('click', removeAllWidgets);
closeModal.addEventListener('click', closeModalFunc);

widgetModal.addEventListener('click', (e) => {
    if (e.target === widgetModal) closeModalFunc();
});

saveWidgetBtn.addEventListener('click', () => {
    let code = widgetCode.value.trim();
    const width = widgetWidth.value || '100%';
    const height = widgetHeight.value || getDefaultHeight();
    const isAutoAdapt = autoAdapt.checked;
    const isAutoCenter = autoCenter.checked;

    if (!code) {
        alert('Введите код iframe');
        return;
    }

    code = createSafeIframe(code);
    if (!code) {
        alert('Неверный код iframe');
        return;
    }

    let contentHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;

    const iframe = tempDiv.querySelector('iframe');
    if (iframe) {
        if (isAutoAdapt) {
            const device = getDeviceType();
            if (device === 'mobile') {
                iframe.style.width = '100%';
                iframe.style.height = '150px';
            } else if (device === 'tablet') {
                iframe.style.width = '100%';
                iframe.style.height = '200px';
            } else {
                iframe.style.width = '100%';
                iframe.style.height = '300px';
            }
        } else {
            iframe.style.width = width;
            iframe.style.height = height;
        }
        contentHTML = iframe.outerHTML;
    } else {
        if (isAutoAdapt) {
            contentHTML = `<div class="widget-html auto-adapt" style="width:100%;min-height:200px;">${code}</div>`;
        } else {
            contentHTML = `<div class="widget-html" style="width:${width};height:${height};">${code}</div>`;
        }
    }

    if (editingWidgetId) {
        const widget = document.querySelector(`.widget[data-id="${editingWidgetId}"]`);
        if (widget) {
            const contentWrapper = widget.querySelector('.widget-content');
            contentWrapper.innerHTML = contentHTML;
            contentWrapper.classList.toggle('auto-adapt', isAutoAdapt);
            contentWrapper.classList.toggle('auto-center', isAutoCenter);
            widget.dataset.width = width;
            widget.dataset.height = height;
            applyWidgetStyles(contentWrapper, isAutoAdapt, width, height);
            saveWidgets();
        }
    } else {
        createWidget(contentHTML, isAutoAdapt, isAutoCenter, width, height);
        saveWidgets();
    }

    closeModalFunc();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widgetModal.classList.contains('show')) {
        closeModalFunc();
    }
});

window.addEventListener('resize', applyDeviceStyles);

document.addEventListener('DOMContentLoaded', () => {
    loadWidgets();
    applyDeviceStyles();
});
