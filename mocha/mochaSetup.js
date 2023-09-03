const { JSDOM } = require('jsdom');
const { XMLHttpRequest } = require("xmlhttprequest");

const jsDom = new JSDOM('<body></body>', {
	url: 'https://example.org/'
});

global.window = jsDom.window;
global.document = jsDom.window.document;
global.FormData = jsDom.window.FormData;
global.XMLHttpRequest = XMLHttpRequest;
