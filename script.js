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

    const widget = document.createElement('div');
    widget.className = 'widget';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'widget-content';

    if (code.includes('<iframe')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = code;
        const iframe = tempDiv.querySelector('iframe');
        
        if (iframe) {
            iframe.style.width = width;
            iframe.style.height = height;
            contentWrapper.appendChild(iframe);
        }
    } else {
        const htmlContainer = document.createElement('div');
        htmlContainer.className = 'widget-html';
        htmlContainer.style.width = width;
        htmlContainer.style.height = height;
        htmlContainer.innerHTML = code;
        contentWrapper.appendChild(htmlContainer);
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-widget-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
        widget.remove();
    });

    widget.appendChild(removeBtn);
    widget.appendChild(contentWrapper);
    widgetContainer.appendChild(widget);

    widgetCode.value = '';
    widgetWidth.value = '100%';
    widgetHeight.value = '300px';
    widgetModal.classList.remove('show');
});
