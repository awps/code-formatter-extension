import Prism from 'prismjs';

Prism.manual = true;

function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

function init() {
    const firstPre = document.body.firstChild;

    if (!firstPre || !firstPre.tagName || firstPre.tagName !== 'PRE') {
        return;
    }

    const text = firstPre.innerText;

    if (!text) {
        return;
    }

    const length = text.length;

    if (length > 3e6) {
        return;
    }

    firstPre.hidden = true;
    firstPre.style.display = 'none';

    const data = parseJSON(text);

    if (!data || typeof data !== 'object') {
        return;
    }

    console.log(data);

    const beauty = JSON.stringify(data, null, 4);

    document.body.classList.add('nice-json-is-loaded');

    firstPre.insertAdjacentHTML('afterend', `<pre id="nice-json-renderer" class="nice-json-renderer"><code class="language-json">${beauty}</code></pre>`);

    Prism.highlightAll();
}

init();
