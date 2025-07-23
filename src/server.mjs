// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';

import absDir from 'absdir';
import bodyParser from 'body-parser';
import express from 'express';


const app = express();

const EX = {

  app,
  autostart: true,
  port: 33480,
  resolveRelPath: absDir(import.meta, '..'),
  staticFilesDir: 'wwwpub',


  async start() {
    app.use(bodyParser.urlencoded({
      extended: false, // We expect only key/value pairs, not nested data.
    }));
    app.use(bodyParser.json());
    const staticFilesAbs = EX.resolveRelPath(EX.staticFilesDir);
    console.log('Serving static files from:', staticFilesAbs);
    app.staticFilesHnd = express.static(staticFilesAbs);
    app.use(app.staticFilesHnd);
    app.post('/', EX.onPostRequest);
    app.all('*', EX.sendErrorUnsupported);
    app.listen(EX.port, EX.onListening);
    return app;
  },


  onListening() {
    console.log('Server running:', { pid: process.pid, port: EX.port });
  },


  sendErrorUnsupported(req, res) {
    res.status(405).json({ error: 'Method not implemented' });
  },


  onPostRequest(req, res) {
    res.json(req.body);
  },


};


setTimeout(() => (EX.autostart && EX.start()), 5);
export default EX;
