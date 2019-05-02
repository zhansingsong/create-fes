const { join } = require('path');
const glob = require('glob');
const Twig = require('twig');
const fse = require('fs-extra');
const Base = require('./utils/Base');

const base = new Base('tmpl');

base.run((paths, chalk) => {
  const { entryNames, common } = paths.fesMap;

  if (!fse.existsSync(join(paths.appBuildTmpl))) {
    base.softExit(null, 0, () => {
      console.error(
        chalk.redBright(
          `Please make sure ${chalk.greenBright('build dir')} generated, and ${chalk.blueBright(
            'npm run build'
          )} to build tmpl for it!`
        )
      );
    });
  }

  base.app.use(
    base.views(join(paths.appNodeModules, 'fes-scripts', 'scripts', 'utils', 'tmpl'), {
      map: {
        html: 'twig',
      },
    })
  );

  const mapPageToRoute = [];
  const routes = [];
  Object.keys(entryNames).forEach((f) => {
    const {
      name, route, mockData, buildTmpl,
    } = entryNames[f];
    let mock = {};
    [common.mock, mockData].forEach((exp) => {
      glob.sync(exp).forEach((mf) => {
        try {
          mock = Object.assign({}, mock, require(mf)); // eslint-disable-line
        } catch (error) {
          mock = {};
        }
      });
    });

    mapPageToRoute.push({ url: route, name: name.replace('_', '/') });
    routes.push({
      path: route,
      method: 'get',
      middleware: async (ctx) => {
        const template = Twig.twig({
          // id: id, // id is optional, but useful for referencing the template later
          data: fse.readFileSync(buildTmpl, 'utf8'),
          allowInlineIncludes: true,
          path: buildTmpl,
        });
        ctx.body = template.render(mock);
        ctx.type = 'text/html';
      },
    }); // eslint-disable-line
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
  const server = base.app.listen(base.port, () => {
    base.logViewInfo();
    base.autoOpenBrowser();
  });
  base.bindSigEvent(server);
});
