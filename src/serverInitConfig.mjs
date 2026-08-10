// -*- coding: utf-8, tab-width: 2 -*-

import installMainRoutes from './hnd/mainRoutes.mjs';

const EX = {
  installMainRoutes,
};

EX.cliConfigDefaults = {
  envcfg_prefix: 'afgw_',
  listen_port: 33480,
};

export default EX;
