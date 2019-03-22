import Koa from 'koa';
import serve from 'koa-static';
// import send from 'koa-send';
import Router from 'koa-router';
import views from 'koa-views';
import address from 'address';
import opn from 'opn';
import Twig from 'twig';

import proxyMiddleware from 'http-proxy-middleware';
import glob from 'glob';
import c2k from 'koa2-connect';
import qrcodeTerminal from 'qrcode-terminal';
import chalk from 'chalk';
import { join, parse } from 'path';
import fse from 'fs-extra';
import choosePort from '../utils/choosePort';
import appConfig from '../../app.config';
import paths from '../utils/paths';
import api from '../../src/api';

const { proxy, tmpl } = appConfig;
const { port, autoOpen, qrcode } = tmpl;
const router = new Router();
const app = new Koa();
const mockFiles = glob.sync(join(process.cwd(), 'src', 'mock/*.+(js|json)'));
app.use(views(join(__dirname, '../tpl'), {
  map: {
    html: 'twig',
  },
}));
// app.set('view engine', 'twig');
if (!fse.existsSync(join(process.cwd(), 'build', 'tmpl'))) {
  console.error(chalk.redBright(`please ensure ${chalk.greenBright('isTmpl')} is set to true first, and ${chalk.blueBright('npm run build')} to build tmpls for it!`));
  process.exit();
}
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || port;
const HOST = process.env.HOST || '0.0.0.0';
const pagePath = join(process.cwd(), 'build', 'tmpl', '*.html');
const pages = glob.sync(pagePath, {});
const mapPageToRoute = [];

/* eslint global-require: [0] */
/* eslint import/no-dynamic-require: [0] */
choosePort(HOST, DEFAULT_PORT)
  .then((p) => {
    if (p == null) {
      return;
    }
    pages.forEach((f) => {
      const metas = parse(f);
      let mock = {};
      mockFiles.forEach((m) => {
        if (metas.name === parse(m).name) {
          try {
            mock = require(m);
          } catch (error) {
            mock = {};
          }
        }
      });

      mapPageToRoute.push({ url: `/${metas.name}`, name: metas.name });
      router.get(`/${metas.name}`, async (ctx) => {
        const template = Twig.twig({
          // id: id, // id is optional, but useful for referencing the template later
          data: fse.readFileSync(f, 'utf8'),
          allowInlineIncludes: true,
          path: f,
        });
        ctx.body = template.render(mock);
        ctx.type = 'text/html';
        // await send(ctx, template.render(mock), { root: paths.appBuild });
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
    // console.log(mapPageToRoute);
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
