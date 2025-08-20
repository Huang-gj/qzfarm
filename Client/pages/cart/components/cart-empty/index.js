Component({
  properties: {
    tip: {
      type: String,
      value: '目前还没有认养内容哦',
    },
    btnText: {
      type: String,
      value: '去首页',
    },
  },
  methods: {
    handleClick() {
      this.triggerEvent('handleClick');
    },
  },
});