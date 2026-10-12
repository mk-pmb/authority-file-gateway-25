// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import loMapValues from 'lodash.mapvalues';
import mustBe from 'typechecks-pmb/must-be.js';

import httpErrors from '@ubhd-as22/http-server-base/src/httpErrors.mjs';

const {
  badRequest,
  badVerb,
} = httpErrors.throwable;


const doNothing = Boolean;
const api = {};

function sTrim(s) { return String(s || '').trim(); }


const EX = {

  getUnboundApi() { return api; },

  async init(req) {
    req.confirmCors();
    const initCtx = {
      qry: { ...req.query },
    };
    loMapValues(api, (f, k) => { initCtx[k] = f.bind(null, initCtx); });
    await EX.byVerbLc({
      '*': badVerb,
      get: doNothing,
      async post() {
        const bodyData = await req.parseRequestBody({ fmt: 'webform' });
        Object.assign(initCtx.qry, bodyData);
      },
    }, req);
    return initCtx;
  },


  async byVerbLc(verbFuncs, req, ...args) {
    const verb = mustBe.nest('HTTP method', req?.method).toLowerCase();
    const func = getOwn(verbFuncs, verb, '*');
    if (!func) { return; }
    const result = await func.apply(verbFuncs, args);
    return result;
  },


};


Object.assign(api, {

  qryNonEmptyStr(initCtx, key, descr) {
    const val = sTrim(getOwn(initCtx.qry, key));
    if (val) { return val; }
    throw badRequest('Empty ' + descr + ' (field ' + key + ')');
  },

});


export default EX;
