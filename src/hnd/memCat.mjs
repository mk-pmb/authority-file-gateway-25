// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import loMapValues from 'lodash.mapvalues';
import mustBe from 'typechecks-pmb/must-be.js';

import learnCatalogFromCfgDict from './learnCatalogFromCfgDict.mjs';


function sTrim(s) { return String(s || '').trim(); }


const EX = {
  routeName: 'memcat',

  idKey: 'dc:identifier',


  learnCatalogTopLevel(initCtx, mustPop) {
    const { catInfo, catList } = initCtx;
    Object.assign(catInfo, loMapValues({
      subject: 'nonEmpty dictObj',
      keywordFields: 'nonEmpty ary',
      defaults: 'dictObj | nul | undef',
    }, mustPop));
    catInfo.items = [];
    catInfo.searchIndex = [];
    catList.forEach(function learnOneCatalogEntry(ent, idx) {
      mustBe.nest('Field ' + EX.idKey + ' for entry #' + (idx + 1),
        ent?.[EX.idKey]);
      catInfo.items.push(ent);
      const glued = catInfo.keywordFields.map(
        k => sTrim(getOwn(ent, k))).join(' ').toLowerCase();
      catInfo.searchIndex.push(glued);
    });
  },


  splitWordsLc(s) {
    return s.toLowerCase().split(/\s+/).filter(Boolean);
  },


  async searchHndImpl(searchReqCtx) {
    const { catInfo, qryParsed } = searchReqCtx;
    const catItems = catInfo.items;
    const searchWordsLc = EX.splitWordsLc(qryParsed.s);

    let nFound = 0;
    const replyMeta = {
      nFound: null,
      nTotal: catItems.length,
      // subject: catInfo.subject,
    };
    const replyList = [replyMeta];
    catInfo.searchIndex.forEach(function maybeAdd(gluedLc, entryIdx) {
      const allWordsFound = searchWordsLc.every(
        sw => gluedLc.includes(sw));
      if (!allWordsFound) { return; }
      const entryDetails = catItems[entryIdx];
      replyList.push({ ...catInfo.defaults, ...entryDetails });
      nFound += 1;
    });
    replyMeta.nFound = nFound;
    return replyList;
  },


};





EX.install = learnCatalogFromCfgDict.install.bind(null, EX);


export default EX;
