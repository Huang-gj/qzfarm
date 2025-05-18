Component({
  properties: {
    imgUrl: {
      type: String,
      value: 'https://cdn-we-retail.ym.tencent.com/miniapp/template/empty-cart.png',
    },
    cloudImgUrl: {
      type: String,
      value: '',
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
  data: {
    actualImgUrl: '',
  },
  lifetimes: {
    attached() {
      this.loadImage();
    }
  },
  methods: {
    handleClick() {
      this.triggerEvent('handleClick');
    },
    loadImage() {
      const {
        cloudImgUrl,
        imgUrl
      } = this.properties;

      if (cloudImgUrl) {
        // 如果提供了云存储图片路径，则转换为可用的URL
        const {
          genPicURL
        } = require('../../../../utils/genURL');
        genPicURL(cloudImgUrl)
          .then(url => {
            this.setData({
              actualImgUrl: url
            });
          })
          .catch(err => {
            console.error('获取云存储图片失败:', err);
            // 失败则使用默认图片
            this.setData({
              actualImgUrl: imgUrl
            });
          });
      } else {
        // 否则使用默认图片
        this.setData({
          actualImgUrl: imgUrl
        });
      }
    }
  },
});