const data = {
  code: 0,
  msg: '',
  data: {
    'hot|4': [
      {
        name: '@CNAME',
        img: '@IMAGE',
        url: '@URL("http")',
      },
    ],
    'lunbo|4-6': [
      {
        img: '@IMAGE',
        url: '@URL("http")',
      },
    ],
    'slevel|4': [
      {
        img: '@IMAGE',
        title: '@CTITLE(4,6)',
        summary: '@CTITLE(9,12)',
        url: '@URL("http")',
        'bid|+1': 1111,
      },
    ],
    'superRecommend|4': [
      {
        url: '@URL',
        bid: '@STRING("number",4,4)', // 漫画自有id
        title: '@CTITLE(4,6)', // 书名
        author: '@CNAME(4,6)', // 作者
        img: '@IMAGE', // 图片链接
        cate: '@CWORD(2,4) @CWORD(2,4)', // 分类
        startChapter: '@INTEGER(0,1)',
        latestChapter: '@NATURAL(50,1000)', // 最新更新章节
        updateTime: '@DATE(yyyy-MM-dd)',
        finish: '@INTEGER(0,1)', // 是否完结
        summary: '@CPARAGRAPH(2,4)', // 摘要
      },
    ],
    activity: {
      title: '@CTITLE(6,8)',
      'content|2': [
        {
          img: '@IMAGE',
          url: '@URL("http")',
        },
      ],
    },
    'todayUpdate|6': [
      {
        bid: '@GUID',
        img: '@IMAGE',
        title: '@CTITLE(4,6)',
        latestChapter: '@NATURAL(50,1000)', // 最新更新章节
        url: '@URL("http")',
      },
    ],
    'tiaomanDay|4': [
      {
        img: '@IMAGE',
        title: '@CTITLE(4,6)',
        summary: '@CTITLE(9,12)',
        url: '@URL("http")',
      },
    ],
    'oneMinuteDuanman|15': [
      {
        img: '@IMAGE',
        title: '@CTITLE(4,6)',
        summary: '@CTITLE(9,12)',
        url: '@URL("http")',
      },
    ],
    'topn|5': [
      {
        url: '@URL',
        bid: '@STRING("number",4,4)', // 漫画自有id
        title: '@CTITLE(4,6)', // 书名
        author: '@CNAME(4,6)', // 作者
        img: '@IMAGE', // 图片链接
        cate: '@CWORD(2,4) @CWORD(2,4)', // 分类
        startChapter: '@INTEGER(0,1)',
        latestChapter: '@NATURAL(50,1000)', // 最新更新章节
        updateTime: '@DATE(yyyy-MM-dd)',
        finish: '@INTEGER(0,1)', // 是否完结
        summary: '@CPARAGRAPH(2,4)', // 摘要
      },
    ],
  },
};

module.exports = data;
