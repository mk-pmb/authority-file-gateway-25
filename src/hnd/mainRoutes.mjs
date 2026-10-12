// -*- coding: utf-8, tab-width: 2 -*-

import memCatHnd from './memCat.mjs';


const EX = async function installMainRoutes(rt) {
  const srv = rt.getServer();
  rt.all('/memcat/', await memCatHnd.install(srv));
};


export default EX;
