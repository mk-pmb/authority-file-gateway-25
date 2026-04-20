// -*- coding: utf-8, tab-width: 2 -*-

import memCatHnd from './memCat.mjs';


const EX = async function installMainRoutes(rt) {
  rt.get('/memcat/:catalogId', memCatHnd);
};


export default EX;
