const addWidgetBtn = document.getElementById('addWidgetBtn');
const widgetModal = document.getElementById('widgetModal');
const closeModal = document.querySelector('.close-modal');
const widgetTypeBtns = document.querySelectorAll('.widget-type-btn');
const htmlWidgetPanel = document.getElementById('htmlWidgetPanel');
const addHtmlWidget = document.getElementById('addHtmlWidget');
const widgetContainer = document.getElementById('widgetContainer');
const widgetCode = document.getElementById('widgetCode');
const widgetWidth = document.getElementById('widgetWidth');
const widgetHeight = document.getElementById('widgetHeight');
const autoAdapt = document.getElementById('autoAdapt');

const STORAGE_KEY = 'musicPlayerWidgets';

function saveWidgets() {
    const widgets = [];
    document.querySelectorAll('.widget').forEach(widget => {
        const content = widget.querySelector('.widget-content').innerHTML;
        const isAutoAdapt = widget.querySelector('.widget-content').classList.contains('auto-adapt');
        widgets.push({ content, autoAdapt: isAutoAdapt });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

function loadWidgets() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const widgets = JSON.parse(saved);
        widgets.forEach(w => {
            createWidget(w.content, w.autoAdapt);
        });
    } catch (e) {
        console.error('Error loading widgets:', e);
    }
}

function createWidget(contentHTML, autoAdaptEnabled = false) {
    const widget = document.createElement('div');
    widget.className = 'widget';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'widget-content';
    if (autoAdaptEnabled) {
        contentWrapper.classList.add('auto-adapt');
    }
    contentWrapper.innerHTML = contentHTML;

    if (autoAdaptEnabled && contentWrapper.querySelector('iframe')) {
        const iframe = contentWrapper.querySelector('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-widget-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
        widget.remove();
        saveWidgets();
    });

    widget.appendChild(removeBtn);
    widget.appendChild(contentWrapper);
    widgetContainer.appendChild(widget);
}

function openModal() {
    widgetModal.classList.add('show');
    widgetCode.value = '';
    widgetWidth.value = '100%';
    widgetHeight.value = '300px';
    autoAdapt.checked = true;
}

function closeModalFunc() {
    widgetModal.classList.remove('show');
}

addWidgetBtn.addEventListener('click', openModal);

closeModal.addEventListener('click', closeModalFunc);

widgetModal.addEventListener('click', (e) => {
    if (e.target === widgetModal) {
        closeModalFunc();
    }
});

widgetTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        widgetTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        if (type === 'html') {
            htmlWidgetPanel.classList.add('show');
        }
    });
});

addHtmlWidget.addEventListener('click', () => {
    const code = widgetCode.value.trim();
    const width = widgetWidth.value || '100%';
    const height = widgetHeight.value || '300px';
    const isAutoAdapt = autoAdapt.checked;

    if (!code) {
        alert('Введите HTML код');
        return;
    }

    let contentHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;

    const iframe = tempDiv.querySelector('iframe');
    if (iframe) {
        if (isAutoAdapt) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '200px';
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

    createWidget(contentHTML, isAutoAdapt);
    saveWidgets();

    closeModalFunc();
});

document.addEventListener('DOMContentLoaded', loadWidgets);
