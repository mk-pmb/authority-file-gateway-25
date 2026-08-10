'use strict';
/* eslint-env browser */

// run on https://www.ub.uni-heidelberg.de/helios/fachinfo/www/kunst/digilit/

(function gen() {
  let buf = [
    '%YAML 1.2',
    '# -*- coding: UTF-8, tab-width: 2 -*-',
    '---',
    '',
    '# First list item is file metadata:',
    '- subject:',
    '    dc:title:   ' + document.title,
    '    dc:source:  ' + document.URL,
    '  keywordFields:',
    "    - 'dc:title'",
    '  defaults:',
    '    dc:source:  ' + document.URL,
    '',
    '# Then, actual catalog entries:',
  ].join('\n');
  const sel = '#content .table.kunsttabelle a';
  Array.from(document.querySelectorAll(sel)).forEach(function found(link) {
    buf += '\n\n- dc:title:       ' + link.innerText;
    buf += '\n  dc:identifier:  ' + link.href;
    const bg = link.firstElementChild.style.backgroundImage.split('"')[1];
    buf += bg && ('\n  ubhd:bgimg:     ' + (new URL(bg, document.URL)).href);
  });
  buf += '\n\n...\n';
  buf = buf.replace(/(: +)([ -\uFFFF]+)/g, "$1'$2'");
  window.kuwilitYaml = buf;
  window.alert('\n\n' + buf + '\n\n'); // eslint-disable-line no-alert
}());
