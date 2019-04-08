const Base = require('./utils/Base');
const { join, parse } = require('path');
const glob = require('glob');
const Twig = require('twig');
const fse = require('fs-extra');

const base = new Base('tmpl');

base.run((paths) => {
  if (!fse.existsSync(join(paths.appBuild, 'tmpl'))) {
    base.softExit(null, 0, ((chalk) => {
      console.error(chalk.redBright(`please ensure ${chalk.greenBright('isTmpl')} is set to true first, and ${chalk.blueBright('npm run build')} to build tmpls for it!`));
    }));
  }

  const mockFiles = glob.sync(join(paths.appSrc, 'mock/*.+(js|json)'));
  base.app.use(base.views(join(paths.appNodeModules, 'fes-scripts', 'scripts', 'utils', 'tmpl'), {
    map: {
      html: 'twig',
    },
  }));

  const pagePath = join(paths.appBuild, 'tmpl', '*.html');
  const pages = glob.sync(pagePath, {});
  const mapPageToRoute = [];
  const routes = [];

  pages.forEach((f) => {
    const metas = parse(f);
    let mock = {};
    mockFiles.forEach((mf) => {
      if (metas.name === parse(mf).name.split('.')[0]) {
        try {
          mock = require(mf); // eslint-disable-line
        } catch (error) {
          mock = {};
        }
      }
    });

    mapPageToRoute.push({ url: `/${metas.name}`, name: metas.name });
    routes.push({
      path: `/${metas.name}`,
      method: 'get',
      middleware: async (ctx) => {
        const template = Twig.twig({
          // id: id, // id is optional, but useful for referencing the template later
          data: fse.readFileSync(f, 'utf8'),
          allowInlineIncludes: true,
          path: f,
        });
        ctx.body = template.render(mock);
        ctx.type = 'text/html';
      },
    }) // eslint-disable-line
  });

  // pages.forEach((f) => {
  //   const metas = parse(f);
  //   mapPageToRoute.push({ url: `/${metas.name}`, name: metas.name });
  //   routes.push({ path: `/${metas.name}`, method: 'get', middleware: `/${metas.name}.html` }) // eslint-disable-line
  // });
  routes.push({
    path: '/',
    method: 'get',
    middleware: async (ctx) => {
      await ctx.render('template', { pages: mapPageToRoute });
    },
  });
  base.createRouter(routes, paths.appBuild);
  base.app.use(base.serve(paths.appBuild));
  const server = base.app.listen(base.port, () => {
    base.logViewInfo();
    base.autoOpenBrowser();
  });
  base.bindSigEvent(server);
});
