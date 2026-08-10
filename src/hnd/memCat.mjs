// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import loMapValues from 'lodash.mapvalues';
import mustBe from 'typechecks-pmb/must-be.js';
import objPop from 'objpop';
import vTry from 'vtry';

import httpErrors from '@ubhd-as22/http-server-base/src/httpErrors.mjs';


const {
  badRequest,
} = httpErrors.throwable;


function sTrim(s) { return String(s || '').trim(); }


const EX = {

  knownCatalogs: new Map(),
  idKey: 'dc:identifier',


  async install(srv) {
    const cfgDict = await srv.configFiles.readAsDict('memcat');
    loMapValues(cfgDict, (v, k) => vTry(EX.learnOneCatalog,
      'Learn memcat catalog ' + k)(k, v, srv));
    return EX.memDictHnd;
  },


  async learnOneCatalog(catName, entries) {
    mustBe.ary('Catalog top-level container', entries);
    const mustPopMeta = objPop(entries[0], { mustBe }).mustBe;
    const catalog = [];
    EX.knownCatalogs.set(catName, catalog);
    catalog.meta = loMapValues({
      subject: 'nonEmpty dictObj',
      keywordFields: 'nonEmpty ary',
      defaults: 'dictObj | nul | undef',
    }, mustPopMeta);
    catalog.searchIndex = [];
    mustPopMeta.expectEmpty('Unsupported meta data field(s)');
    entries.forEach(function each(ent, idx) {
      if (!idx) { return; }
      mustBe.nest('Field ' + EX.idKey + ' for entry #' + idx, ent?.[EX.idKey]);
      catalog.push(ent);
      const glued = catalog.meta.keywordFields.map(
        k => sTrim(getOwn(ent, k))).join(' ').toLowerCase();
      catalog.searchIndex.push(glued);
    });
  },


  async memDictHnd(req) {
    req.confirmCors();
    const qry = { ...req.query };
    if (req.method === 'POST') {
      const bodyData = await req.parseRequestBody({ fmt: 'webform' });
      Object.assign(qry, bodyData);
    }

    function qryNeStr(key, descr) {
      const val = sTrim(getOwn(qry, key));
      if (val) { return val; }
      throw badRequest('Empty ' + descr + ' (field ' + key + ')');
    }

    const catItems = EX.knownCatalogs.get(qryNeStr('c', 'catalog ID'));
    if (!catItems) { throw badRequest('Unknown catalog ID'); }

    const searchWordsLc = qryNeStr('s', 'Search string')
      .toLowerCase().split(/\s+/).filter(Boolean);

    const catMeta = catItems.meta;
    let nFound = 0;
    const replyMeta = {
      nFound: null,
      nTotal: catItems.length,
      subject: catMeta.subject,
    };
    const replyList = [replyMeta];
    catItems.searchIndex.forEach(function maybeAdd(gluedLc, entryIdx) {
      const allWordsFound = searchWordsLc.every(
        sw => gluedLc.includes(sw));
      if (!allWordsFound) { return; }
      const entryDetails = catItems[entryIdx];
      replyList.push({ ...catMeta.defaults, ...entryDetails });
      nFound += 1;
    });
    replyMeta.nFound = nFound;
    req.sendJsonResult(replyList);
  },


};





export default EX;
