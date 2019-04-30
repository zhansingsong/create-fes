const { join } = require('path');
const Base = require('./utils/Base');

const base = new Base('preview');

base.run((paths) => {
  const { entryNames } = paths.fesMap;
  base.app.use(base.views(join(paths.appNodeModules, 'fes-scripts', 'scripts', 'utils', 'tmpl'), {
    map: {
      html: 'twig',
    },
  }));

  const mapPageToRoute = [];
  const routes = [];

  Object.keys(entryNames).forEach((f) => {
    const { name, route, tmplName } = entryNames[f];
    mapPageToRoute.push({ url: route, name: name.replace('_', '/') });
    routes.push({ path: route,  method: 'get', middleware: tmplName}) // eslint-disable-line
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
