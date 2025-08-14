Component({
  externalClasses: ['wr-class'],
  options: {
    multipleSlots: true,
  },
  properties: {
    goodsDetailInfo: {
      type: String,
      value: '',
    },
    sellerReply: {
      type: String,
      value: '',
    },
    userHeadUrl: {
      type: String,
      value: '',
    },
    userName: {
      type: String,
      default: '',
    },
    commentContent: {
      type: String,
      value: '',
    },
    commentScore: {
      type: Number,
      value: 0,
    },
    commentTime: {
      type: String,
      value: '',
    },
    commentResources: {
      type: Array,
      value: [],
    },
    commentId: {
      type: Number,
      value: 0,
    },
  },

  data: {
    showMoreStatus: false,
    showContent: false,
    hideText: false,
    eleHeight: null,
    overText: false,
    isDisabled: true,
    startColors: ['#FFC51C', '#DDDDDD'],
    showReplyAction: false,
  },
  methods: {
    handleCardTap() {
      this.setData({ showReplyAction: !this.data.showReplyAction });
    },
    onTapReply() {
      this.triggerEvent('reply', { id: this.properties.commentId, nickname: this.properties.userName });
    },
  },
});
