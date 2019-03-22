import a from './modules/a';

// require('expose-loader?$!jquery');

function component() {
  const element = document.createElement('div');
  a('about');
  // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
  element.innerHTML = 'about';
  return element;
}

document.body.appendChild(component());
