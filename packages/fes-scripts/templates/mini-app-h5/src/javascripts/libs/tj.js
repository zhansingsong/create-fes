/* eslint-disable */
const _sgaq = window._sgaq || [];

function closest(node, attr) {
  let result = node.getAttribute(attr);
  if (result) {
    return result;
  }
  let parent = node.parentNode;
  if (parent && parent.nodeType === 9) {
    return 'other';
  }
  if (parent && parent.nodeType === 1) {
    return closest(parent, attr);
  }
}

function offset(node) {
  let rect = node.getBoundingClientRect();
  let docElement = document.documentElement;
  return {
    top: rect.top + window.pageYOffset - docElement.clientTop,
    left: rect.left + window.pageXOffset - docElement.clientLeft,
  };
}
// according to the MDN docs:
// The Object constructor creates an object wrapper for the given value.
// If the value is null or undefined, it will create and return an empty object,
// otherwise, it will return an object of a type that corresponds to the given value.
// If the value is an object already, it will return the value.
function isObject(o) {
  return o === Object(o);
}

function params(o) {
  if (!o || !isObject(o)) {
    return '';
  }
  let keys = Object.keys(o);
  if (!keys.length) {
    return '';
  }
  let encode = encodeURIComponent;
  return keys
    .map(function (item) {
      // if (isObject(o))
      return encode(item) + '=' + encode(o[item]);
      // 去掉encode，因为服务器端已encode
      // return item + '=' + o[item];
    })
    .join('&');
}

const util = {
  pbflag: function (node) {
    return closest(node, 'pbflag');
  },
  pbtab: function (node) {
    return closest(node, 'pbtab');
  },
  pburl: function (node) {
    return closest(node, 'pburl') || node.getAttribute('href') || '';
  },
  urlname: function (node) {
    return (
      (node.querySelector('img') &&
        node.querySelector('img').getAttribute('src')) ||
      ''
    );
  },
  text: function (node) {
    return (node.innerText || this.urlname(node)).replace(/\s/g, '');
  },
  offset: function (node) {
    let _offset = offset(node);
    return _offset.left + '-' + _offset.top;
  },
  link_type: function (node) {
    return /sogou\.com/.test(this.pburl(node)) ? 'link' : 'outlink';
  },
  outlink_host: function (node) {
    let url = (this.pburl(node) || '').match(/http:\/\/([\w\.]+)\b/);
    return url ? url[1] : '';
  },
  // track: function(node) {
  //   let track = node.getAttribute('data-track');
  //   console.dir(track);
  //   if(track){
  //     return track;
  //   }
  //   return {};
  // }
};

const handler = function (target, param) {
  // let target = event.currentTarget;
  // options
  let pbtab = target ? util.pbtab(target) : '';
  let urlname = target ? util.urlname(target) : '';
  let outlink_host = target ? util.outlink_host(target) : '';
  let text = target ? util.text(target) : '';
  let pos = target ? util.offset(target) : '0_0';
  // 独立参数
  let link_type = target ? util.link_type(target) : 'link';
  let pbflag = target ? util.pbflag(target) : 'other';
  let pburl = target ? util.pburl(target) : 'null';
  // 定制参数

  // 直接使用Object.assign 有兼容性问题（Android5，iOS8.4）
  let options = Object.assign(
    {
      pbtab: pbtab,
      urlname: urlname,
      outlink_host: outlink_host,
      text: text.slice(0, 60),
      pos: pos,
    },
    // util.track(target),
    param || {},
  );
  // console.log('tj--->options: %o,---%o,---%o,---%o,---%o ', options,link_type, pbflag, pburl, params(options));

  // console.log('~~~~~~~~~tj click params ~~~~~~~~~~~')
  // console.log(decodeURIComponent(params(options)));
  // console.log(link_type);
  // console.log(pbflag);
  // console.log(pburl);
  // console.log('~~~~~~~~~tj click params ~~~~~~~~~~~')

  _sgaq.push(['_trackEvent', link_type, pbflag, pburl, params(options)]);
};
export const pbclick = (target, options) => {
  handler(target, options || {});
};
export const bpshow = (el, options) => {
  _sgaq.push([
    '_trackEvent',
    'show',
    util.pbflag(el),
    'null',
    params(options || {}),
  ]);
};
export const pagetj = (pcode, ptype) => {
  // fire
  _sgaq.push(['_setPcode', pcode]);
  _sgaq.push(['_setAccount', ptype]);
  _sgaq.push(['_trackPageview']);
};

export default () => {
  const { pcode, ptype } = window.spb_vars;
  // fire
  pagetj(pcode, ptype);
  document.addEventListener(
    'click',
    function (event) {
      let target = event.target;
      let currentTarget = event.currentTarget;
      // console.log(target.nodeName + '~~~~' + event.currentTarget.nodeName);

      while (target !== currentTarget) {
        // 处理react不能stopPropagation
        if (target.getAttribute('data-stop')) {
          event.stopPropagation();
          return false;
        }
        if (target.nodeName === 'A' || target.classList.contains('pbflag')) {
          handler.call(null, target);
          return true;
        }
        target = target.parentNode;
      }
    },
    false,
  );
};
