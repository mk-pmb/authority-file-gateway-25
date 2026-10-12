// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import loMapValues from 'lodash.mapvalues';
import mustBe from 'typechecks-pmb/must-be.js';
import objPop from 'objpop';
import vTry from 'vtry';

import httpErrors from '@ubhd-as22/http-server-base/src/httpErrors.mjs';


const {
  badBodyData,
} = httpErrors.throwable;


function mergeQueryDefaults(q, d) { return (d ? { ...d, ...q } : q); }
function sTrim(s) { return String(s || '').trim(); }


const doNothing = Boolean;
const alreadyInitialized = new Map();


const EX = {

  getCachedinitCtx(rtName) { return alreadyInitialized.get(rtName) || false; },


  async init(catImpl, srv) {
    const rtName = mustBe.nest('routeName', catImpl.routeName);
    const had = (catImpl.state || doNothing)();
    if (had) { return had; }
    // Set dummy to help detect accidental recursion:
    catImpl.state = '…init…'; // eslint-disable-line no-param-reassign

    const cfgDict = await srv.configFiles.readAsDict(rtName);
    const state = (catImpl.initialState || {});
    delete catImpl.initialState; // eslint-disable-line no-param-reassign
    state.knownCatalogs ||= new Map();
    const initCtx = {
      catImpl,
      srv,
      state,
    };
    if (catImpl.learnCommonMeta) {
      state.commonMeta = cfgDict[''];
      delete cfgDict[''];
      await (catImpl.learnCommonMeta || doNothing)(initCtx);
    }
    loMapValues(cfgDict, (v, k) => vTry(EX.learnOneCatalog,
      'Learn ' + rtName + ' catalog ' + k)(k, v, initCtx));
    await (catImpl.whenConfigured || doNothing)(initCtx);

    // eslint-disable-next-line no-param-reassign
    catImpl.state = Object.bind(null, state);
    return state;
  },


  async install(catImpl, srv) {
    const state = await EX.init(catImpl, srv);
    const impl = catImpl.searchHndImpl;
    mustBe.fun('searchHndImpl for ' + catImpl.routeName, impl);
    return EX.searchHnd.bind(null, impl, state);
  },


  learnOneCatalog(catName, origSpec, originitCtx) {
    const catList = Array.isArray(origSpec) && origSpec.slice(1);
    const catSpec = (catList ? origSpec[0] : origSpec);
    const catInfo = {};
    const initCtx = { ...originitCtx, catInfo, catList };
    initCtx.state.knownCatalogs.set(catName, catInfo);
    const topDescr = 'Catalog config top-level container';
    const popTop = () => mustBe.dictObj(topDescr, catSpec);
    popTop.expectEmpty = Boolean; // cheap no-op
    EX.learnSubDict(initCtx, popTop, topDescr, EX.learnTopLevel);
  },


  learnTopLevel(initCtx, mustPop) {
    const { catInfo } = initCtx;
    catInfo.queryDefaults = mustPop('dictObj | nul | undef',
      'queryDefaults') || false;
    initCtx.catImpl.learnCatalogTopLevel(initCtx, mustPop);
  },


  learnSubDict(initCtx, popParentDict, subKey, learnImpl) {
    const subDict = popParentDict('dictObj', subKey);
    mustBe.fun('learnImpl for ' + subKey, learnImpl);
    const popSubDict = objPop(subDict, { mustBe }).mustBe;
    popSubDict.learnSubDict = EX.learnSubDict.bind(null, initCtx, popSubDict);
    vTry(learnImpl, 'Learn ' + subKey)(initCtx, popSubDict);
    popSubDict.expectEmpty('Unsupported config field(s)');
  },


  async searchHnd(impl, state, req) {
    req.confirmCors();
    let qryMerged = {
      ...state.commonMeta?.queryDefaults,
      ...req.query,
    };
    if (req.method === 'POST') {
      const bodyData = await req.parseRequestBody({ fmt: 'webform' });
      Object.assign(qryMerged, bodyData);
    }

    function qryNonEmptyStr(key, descr) {
      const val = sTrim(getOwn(qryMerged, key));
      if (val) { return val; }
      throw badBodyData('Empty ' + descr + ' (field ' + key + ')');
    }

    const catId = qryNonEmptyStr('c', 'catalog ID');
    const catInfo = state.knownCatalogs.get(catId);
    if (!catInfo) { throw badBodyData('Unknown catalog ID'); }
    qryMerged = mergeQueryDefaults(qryMerged, catInfo.queryDefaults);

    function qryIntPosOr0(key) {
      const val = +getOwn(qryMerged, key);
      return ((Number.isInteger(val) && (val >= 1) && val) || 0);
    }

    const qryParsed = {
      c: catId,
      s: qryNonEmptyStr('s', 'Search string'),
      o: qryIntPosOr0('o'),
      n: qryIntPosOr0('n'),
    };
    const searchReqCtx = {
      catId,
      catInfo,
      qryIntPosOr0,
      qryMerged,
      qryNonEmptyStr,
      qryParsed,
      req,
    };

    const rspData = await impl(searchReqCtx);
    req.sendJsonResult(rspData);
  },



};


export default EX;
