import a from './modules/a';

function component() {
  const element = document.createElement('div');
  element.onclick = a;
  element.innerHTML = 'home page';
  return element;
}
let element = component();
const container = document.querySelector('.page-desc');
container.appendChild(element);

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
