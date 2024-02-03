/*  eslint-disable indent */
//  I'm disabling this rule here because the patterns and
//  indenting in this case makes it pretty readable.
import '../vendor_custom/prismjs-custom.js';
import { sourceDump } from './sourceDump.js';
import { Remarkable } from '../web_modules/remarkable.js';
import { name as browserName } from '../web_modules/platform.js';

// DOM queries
const srcPreEl = document.querySelector('.source-pane > pre');
const srcCodeEl = document.querySelector('.source-pane > pre > code');
const srcLabelEl = document.querySelector('.prism-show-language');
const demoEl = document.querySelector('.demo-frame');
const docsEl = document.querySelector('.docs-pane-content');
const docsLinkDemoName = document.querySelector('.demo-name');
const unsupportedEl = document.querySelector('.unsupported');

// We pull this value to the top level, so callbacks can access its latest value.
let selected;

const srcDetails = {
  css: {
    label: 'CSS',
    prismId: 'css',
    filename: 'styles.css',
  },
  'css-step': {
    label: 'CSS',
    prismId: 'css',
    filename: 'styles.css',
  },
  smil: {
    label: 'SVG',
    prismId: 'markup',
    filename: 'image.svg',
  },
  video: {
    label: 'HTML',
    prismId: 'markup',
    filename: 'index.html',
  },
  flash: {
    label: 'HTML',
    prismId: 'markup',
    filename: 'index.html',
  },
  'animated-gif': {
    label: 'HTML',
    prismId: 'markup',
    filename: 'index.html',
  },
  default: {
    label: 'JavaScript',
    prismId: 'javascript',
    filename: 'script.js',
  },
};

function showIncompatibilityMessage() {
  // hide iframe
  demoEl.style.display = 'none';
  // show message
  unsupportedEl.style.display = '';
}

function resetIncompatibilityMessage() {
  // show iframe
  demoEl.style.display = '';
  // hide message
  unsupportedEl.style.display = 'none';
}

/**
 * Runs Remarkable on readme text, and drops it into the docs pane.
 */
function markdownToHtml(response) {
  const parser = new Remarkable('commonmark');
  docsEl.innerHTML = parser.render(response);
}

/**
 * Checks if the selected demo is compatible with this browser.
 */
function isCompatible(selectedId) {
  if (selectedId === 'smil') {
    // only return true if there's a Modernizr 👍 and the browser isn't Safari.
    return Modernizr.smil && (browserName !== 'Safari');
  }
  if (selectedId === 'flash') {
    // Flash is deprecated in most browsers but can still be emulated by tools like
    // https://ruffle.rs. Both emulators and legacy flash plugins should be detected
    // by the check below (see: https://stackoverflow.com/a/42815720/1154642).
    return !!navigator.plugins.namedItem("Shockwave Flash");
  }
  if (selectedId === 'p5') {
    return Modernizr.webgl;
  }
  if (selectedId === 'webgpu') {
    // WebGPU is still in development on some browsers.
    return navigator.gpu;
  }
  return true;
}

/**
 * Runs PrismJS on the page. Designed to be called once the new source is on the page.
 */
function highlightSource() {
  const srcPrismId =
    srcDetails[selected.id] ? srcDetails[selected.id].prismId : srcDetails.default.prismId;
  const srcLabelText =
    srcDetails[selected.id] ? srcDetails[selected.id].label : srcDetails.default.label;

  srcCodeEl.className = '';
  srcCodeEl.classList.add(`language-${srcPrismId}`);
  srcLabelEl.textContent = srcLabelText;

  Prism.highlightAll();
}

/**
 * Updates the preview & source panes based to match the currently selected option.
 */
function updatePanes() {
  selected = document.querySelector(window.location.hash);

  const name = selected.textContent;
  const srcFileName =
    srcDetails[selected.id] ? srcDetails[selected.id].filename : srcDetails.default.filename;
  const demoFileName = (selected.id === 'smil') ? 'image.svg' : 'index.html';

  // pane content urls
  const srcUrl = `examples/${selected.id}/${srcFileName}`;
  const demoUrl = `examples/${selected.id}/${demoFileName}`;
  const docsUrl = `examples/${selected.id}/readme.md`;

  // Update the source pane (scroll it to the top, and get the new source).
  srcPreEl.scrollTop = 0;
  sourceDump(srcUrl, srcCodeEl, { successCallback: highlightSource });

  // Update the demo pane.
  resetIncompatibilityMessage();
  if (!isCompatible(selected.id)) {
    showIncompatibilityMessage();
  } else {
    demoEl.setAttribute('src', demoUrl);
  }

  // Update the docs pane.
  docsLinkDemoName.textContent = name;
  sourceDump(docsUrl, undefined, { successCallback: markdownToHtml });
}

export {
  updatePanes,
};
