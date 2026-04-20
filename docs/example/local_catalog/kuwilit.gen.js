'use strict';
/* eslint-env browser */

// run on https://www.ub.uni-heidelberg.de/helios/fachinfo/www/kunst/digilit/

(function gen() {
  function jsonLn(x) { return JSON.stringify(x, null, 2).replace(/\s+/g, ' '); }
  const meta = {
    subject: {
      'dc:title': document.title,
      'dc:isVersionOf': document.URL,
    },
    keywordFields: ['dc:title'],
    defaults: {
      'dc:isPartOf': document.URL,
    },
  };
  let buf = '[' + jsonLn(meta);
  const sel = '#content .table.kunsttabelle a';
  Array.from(document.querySelectorAll(sel)).forEach(function found(link) {
    const rec = { 'dc:title': link.innerText, id: link.href };
    const bg = link.firstElementChild.style.backgroundImage.split('"')[1];
    if (bg) { rec['ubhd:bgimg'] = (new URL(bg, document.URL)).href; }
    buf += '\n,' + jsonLn(rec);
  });
  buf += '\n]';
  window.kuwilitJson = buf;
  window.alert('\n\n' + buf + '\n\n'); // eslint-disable-line no-alert
}());
