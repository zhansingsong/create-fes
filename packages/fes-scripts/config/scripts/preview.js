import Koa from 'koa';
import serve from 'koa-static';
import send from 'koa-send';
import Router from 'koa-router';
import views from 'koa-views';
import address from 'address';
import opn from 'opn';

import proxyMiddleware from 'http-proxy-middleware';
import glob from 'glob';
import c2k from 'koa2-connect';
import qrcodeTerminal from 'qrcode-terminal';
import chalk from 'chalk';
import { join, parse } from 'path';
import choosePort from '../utils/choosePort';
import appConfig from '../../app.config';
import paths from '../utils/paths';
import api from '../../src/api';

const { proxy, preview } = appConfig;
const { port, autoOpen, qrcode } = preview;
const router = new Router();
const app = new Koa();
app.use(views(join(__dirname, '../tpl'), {
  map: {
    html: 'twig',
  },
}));
// app.set('view engine', 'twig');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || port;
const HOST = process.env.HOST || '0.0.0.0';
const pagePath = join(paths.appBuild, '*.html');
const pages = glob.sync(pagePath, {});
const mapPageToRoute = [];
const routes = [];


choosePort(HOST, DEFAULT_PORT)
  .then((p) => {
    if (p == null) {
      return;
    }
    pages.forEach((f) => {
      const metas = parse(f);
      mapPageToRoute.push({ url: `/${metas.name}`, name: metas.name });
      routes.push(`/${metas.name}`);
      router.get(`/${metas.name}`, async (ctx) => {
        await send(ctx, `${metas.name}.html`, { root: paths.appBuild });
      });
    });
    // if (routes.indexOf('/index') > -1) {
    //   router.redirect('/', '/index');
    // } else {
    //   router.redirect('/', routes[0]);
    // }
    router.get('/', async (ctx) => {
      await ctx.render('root', { pages: mapPageToRoute });
    });
    api(router);
    console.log(mapPageToRoute);
    // // proxy
    try {
      Object.keys(proxy || {}).forEach((context) => {
        let options = proxy[context];
        if (typeof options === 'string') {
          options = { target: options };
        }
        // router.get(options.filter || context, c2k(proxyMiddleware(options)));
        router.all(options.filter || context, c2k(proxyMiddleware(options)));
      });
    } catch (error) {
      console.log(error);
    }
    // router
    app.use(router.routes());
    console.log(paths.appBuild);
    app.use(serve(paths.appBuild));
    // log info
    const server = app.listen(p);
    const LOCA = `http://localhost:${p}`;
    const ADDR = `http://${address.ip()}:${p}`;
    const uri = chalk.green(`server is listening at:  ${chalk.blueBright(`${LOCA}`)}`);
    const ip = chalk.green(`server is listening at:  ${chalk.blueBright(`${ADDR}`)}`);

    console.log(uri);
    console.log(ip);
    if (qrcode) {
      qrcodeTerminal.generate(ADDR, { small: true }, (qr) => {
        console.log(chalk.green('scan the QR code below:'));
        console.log(chalk.blue(qr));
      });
    }
    if (autoOpen) {
      opn(LOCA);
    }
    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        server.close();
        process.exit();
      });
    });
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
