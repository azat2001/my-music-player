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

const STORAGE_KEY = 'musicPlayerWidgets';

function saveWidgets() {
    const widgets = [];
    document.querySelectorAll('.widget').forEach(widget => {
        const content = widget.querySelector('.widget-content').innerHTML;
        widgets.push({ content });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

function loadWidgets() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const widgets = JSON.parse(saved);
    widgets.forEach(w => {
        createWidget(w.content);
    });
}

function createWidget(contentHTML) {
    const widget = document.createElement('div');
    widget.className = 'widget';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'widget-content';
    contentWrapper.innerHTML = contentHTML;

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

addWidgetBtn.addEventListener('click', () => {
    widgetModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    widgetModal.classList.remove('show');
});

widgetModal.addEventListener('click', (e) => {
    if (e.target === widgetModal) {
        widgetModal.classList.remove('show');
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

    if (!code) {
        alert('Введите HTML код');
        return;
    }

    let contentHTML;
    if (code.includes('<iframe')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = code;
        const iframe = tempDiv.querySelector('iframe');
        if (iframe) {
            iframe.style.width = width;
            iframe.style.height = height;
            contentHTML = iframe.outerHTML;
        }
    } else {
        contentHTML = `<div class="widget-html" style="width:${width};height:${height};">${code}</div>`;
    }

    createWidget(contentHTML);
    saveWidgets();

    widgetCode.value = '';
    widgetWidth.value = '100%';
    widgetHeight.value = '300px';
    widgetModal.classList.remove('show');
});

loadWidgets();
