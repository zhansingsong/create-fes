const Base = require('./utils/Base');
const { join, parse } = require('path');
const glob = require('glob');

const base = new Base('preview');
base.run((paths) => {
  base.app.use(base.views(join(paths.appNodeModules, 'fes-scripts', 'scripts', 'utils', 'tmpl'), {
    map: {
      html: 'twig',
    },
  }));

  const pagePath = join(paths.appBuild, '*.html');
  const pages = glob.sync(pagePath, {});
  const mapPageToRoute = [];
  const routes = [];

  pages.forEach((f) => {
    const metas = parse(f);
    mapPageToRoute.push({ url: `/${metas.name}`, name: metas.name });
    routes.push({ path: `/${metas.name}`,  method: 'get', middleware: `/${metas.name}.html`}) // eslint-disable-line
  });
  routes.push({
    path: '/',
    method: 'get',
    middleware: async (ctx) => {
      await ctx.render('template', { pages: mapPageToRoute });
    },
  });

  base.createRouter(routes, paths.appBuild);
  base.app.use(base.serve(paths.appBuild));
  const server = base.app.listen(base.port, (err) => { // eslint-disable-line
    if (err) {
      return console.log(err);
    }

    base.logViewInfo();
    base.autoOpenBrowser();
  });
  base.bindSigEvent(server);
});
