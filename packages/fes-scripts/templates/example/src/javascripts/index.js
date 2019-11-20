import a from './modules/a';
import cssm from '../styles/modules/_cssm.scss';

const getCssmHtml = cssmObj => (`
    <div class="${cssmObj.cnt}">
    <h3 class="${cssmObj.tt}">css-module</h3>
    <p class="${cssmObj.des}">介绍fes中css-modules的使用</p>
    </div>
  `);

function component() {
  const element = document.createElement('div');
  element.onclick = a;
  element.innerHTML = 'home page';
  return element;
}
let element = component();
const container = document.querySelector('.page-desc');
const cssmContainer = document.querySelector('.cssm');
container.appendChild(element);
cssmContainer.innerHTML = getCssmHtml(cssm);


if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => {
    container.removeChild(element);
  });

  module.hot.accept('./modules/a', () => {
    container.removeChild(element);
    element = component();
    container.appendChild(element);
  });
}
