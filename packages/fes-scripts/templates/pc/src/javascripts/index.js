require('../styles/style.scss');
// var a = require('./modules/a');

function component() {
  const element = document.createElement('div');

  // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
  element.innerHTML = 'the ant turn into a color ant on cursor over it';
  return element;
}

document.body.appendChild(component());
