// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import httpErrors from '@ubhd-as22/http-server-base/src/httpErrors.mjs';
import mustBe from 'typechecks-pmb/must-be.js';

import kuwilit from '../../docs/example/local_catalog/kuwilit.json'
  with { type: 'json' };


const {
  noSuchResource,
} = httpErrors.throwable;


const EX = async function memDictHnd(req) {
  const { catalogId } = req.params;
  const [catMeta, ...catItems] = getOwn(EX.knownCatalogs, catalogId, '');
  if (!catMeta) { throw noSuchResource('Unknown catalog ID'); }
  const keywordLc = mustBe.nest('Search keyword', req.query.q).toLowerCase();
  const { defaults, keywordFields } = catMeta;
  let nFound = 0;
  const replyMeta = {
    nFound: null,
    nTotal: catItems.length,
    subject: catMeta.subject,
  };
  const replyList = [replyMeta];
  catItems.forEach(function maybeAdd(entry) {
    let matchingField = false;
    keywordFields.some(function check(key) {
      const valLc = getOwn(entry, key, '').toLowerCase();
      matchingField ||= (valLc.includes(keywordLc) && key);
      return matchingField;
    });
    if (!matchingField) { return; }
    replyList.push({ ...defaults, ...entry });
    nFound += 1;
  });
  replyMeta.nFound = nFound;
  req.sendJsonResult(replyList);
};


EX.knownCatalogs = {
  kuwilit,
};


export default EX;
