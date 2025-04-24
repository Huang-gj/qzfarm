Component({
  properties: {
    imgUrl: {
      type: String,
      value: 'https://cdn-we-retail.ym.tencent.com/miniapp/template/empty-cart.png',
    },
    tip: {
      type: String,
      value: '目前还没有认养内容哦',
    },
    btnText: {
      type: String,
      value: '去首页',
    },
  },
  data: {},
  methods: {
    handleClick() {
      this.triggerEvent('handleClick');
    },
  },
});