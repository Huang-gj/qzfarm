import dayjs from 'dayjs';
const layoutMap = {
  0: 'vertical',
};
Page({
  data: {
    pageLoading: false,
    commentList: [],
    pageNum: 1,
    myPageNum: 1,
    pageSize: 10,
    total: 0,
    myTotal: 0,
    hasLoaded: false,
    layoutText: layoutMap[0],
    loadMoreStatus: 0,
    myLoadStatus: 0,
    land_id: '',
    commentLevel: '',
    hasImage: '',
    commentType: '',
    totalCount: 0,
    countObj: {
      badCount: '0',
      commentCount: '0',
      goodCount: '0',
      middleCount: '0',
      hasImageCount: '0',
      uidCount: '0',
    },
    // 新评论输入框
    newCommentText: '',
    // 回复框
    showCompose: false,
    replyToNickname: '',
    composeText: '',
    replyToCommentId: 0,
  },
  onLoad(options) {
    console.log('[land comments page] onLoad options:', options);
    const landIdParam = options.landId || options.land_id || '';
    const landIdNum = parseInt(landIdParam, 10) || 0;
    this.setData({ land_id: landIdNum });
    if (landIdNum) {
      this.loadAllComments(landIdNum);
    }
  },
  onShow() {
    console.log('[land comments page] onShow, land_id:', this.data.land_id);
    if (this.data.land_id) {
      // 可见即刷新，便于重进页面也能看到回复数量变化
      this.loadAllComments(this.data.land_id);
    } else {
      // 兜底：从路由参数再取一次
      const pages = getCurrentPages();
      const current = pages[pages.length - 1] || {};
      const query = (current && current.options) || {};
      const landIdParam = query.landId || query.land_id || '';
      const landIdNum = parseInt(landIdParam, 10) || 0;
      console.log('[land comments page] onShow fallback query:', query, 'parsed:', landIdNum);
      if (landIdNum) {
        this.setData({ land_id: landIdNum });
        this.loadAllComments(landIdNum);
      }
    }
  },
  async loadAllComments(landId) {
    try {
      wx.showLoading({ title: '加载评论', mask: false });
      const { getComment } = require('../../../services/comments/getComment');
      const res = await getComment({ good_id: 0, land_id: landId });
      console.log('[land comments list] getComment response:', res);
      const list = Array.isArray(res?.comments) ? res.comments : [];
      const pageList = list.map((c, idx) => {
        const rootId = c.comment_id || c.CommentID || c.id || 0;
        const replyNumRaw = c.comment_reply_num ?? c.CommentReplyNum ?? 0;
        const replyNum = Number(replyNumRaw) || 0;
        console.log(`[land comments list] item#${idx}`, {
          id: c.id || c.ID,
          comment_id: c.comment_id || c.CommentID,
          comment_reply_num: replyNumRaw,
          parsedReplyNum: replyNum,
        });
        return {
          _rawId: c.id || c.ID || 0, // DB 自增ID
          _rootCommentId: rootId,    // 根评论ID
          userName: c.nickname || '',
          commentContent: c.text || c.TEXT || '',
          commentTime: c.create_time ? dayjs(c.create_time).format('YYYY/MM/DD HH:mm') : '',
          userHeadUrl: c.avatar || '',
          commentScore: 0,
          commentResources: [],
          isAnonymity: false,
          specInfo: '',
          sellerReply: '',
          goodsDetailInfo: '',
          replyCount: replyNum,
          showExpand: replyNum > 0,
          showReplies: false,
          replies: [],
        };
      });
      this.setData({
        commentList: pageList,
        totalCount: pageList.length,
        countObj: {
          ...this.data.countObj,
          commentCount: String(pageList.length),
        },
        hasLoaded: true,
        loadMoreStatus: 2,
      });
    } catch (e) {
      console.error('[land comments list] load error:', e);
      wx.showToast({ title: '加载评论失败', icon: 'none' });
      this.setData({ hasLoaded: true, loadMoreStatus: 2 });
    } finally {
      wx.hideLoading();
    }
  },
  onTapReplyFromCard(e) {
    // 组件通过 event.detail 传出 id、nickname；此 id 为根评论ID
    const { id = 0, nickname = '' } = e.detail || {};
    this.setData({
      showCompose: true,
      replyToNickname: nickname,
      replyToCommentId: id,
      composeText: '',
    });
  },
  onComposeInput(e) {
    this.setData({ composeText: e.detail.value });
  },
  onCancelCompose() {
    this.setData({ showCompose: false, replyToNickname: '', replyToCommentId: 0, composeText: '' });
  },
  async onToggleReplies(e) {
    const { id, index } = e.currentTarget.dataset; // id 为根评论ID
    console.log('[land toggle replies] click:', { id, index });
    const list = [...this.data.commentList];
    const item = list[index];
    if (!item) return;
    if (item.showReplies) {
      item.showReplies = false;
      this.setData({ commentList: list });
      return;
    }
    try {
      const { getCommentReply } = require('../../../services/comments/getCommentReply');
      const res = await getCommentReply({ comment_id: id });
      console.log('[land toggle replies] getCommentReply response:', res);
      const raw = Array.isArray(res?.comment_reply || res?.commentReplies) ? (res.comment_reply || res.commentReplies) : [];
      item.replies = raw.map((r) => ({
        id: r.id || r.ID,
        create_time: r.create_time,
        comment_id: r.comment_id || r.CommentID,
        comment_reply_id: r.comment_reply_id || r.CommentReplyID,
        reply_to: r.reply_to || r.ReplyTo,
        text: r.text || r.TEXT,
        user_id: r.user_id || r.UserID,
        avatar: r.avatar,
        nickname: r.nickname,
      }));
      item.showReplies = true;
      list[index] = item;
      this.setData({ commentList: list });
    } catch (err) {
      console.error('[land toggle replies] error:', err);
      wx.showToast({ title: '加载回复失败', icon: 'none' });
    }
  },
  async onSubmitReply() {
    const text = (this.data.composeText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    if (!this.data.replyToCommentId) {
      wx.showToast({ title: '请选择要回复的评论', icon: 'none' });
      return;
    }
    const app = getApp();
    const userInfo = app?.globalData?.userInfo || wx.getStorageSync('userInfo') || {};
    const user_id = userInfo.user_id || 0;
    const avatar = userInfo.avatar || '';
    const nickname = userInfo.nickname || '';

    try {
      const { addCommentReply } = require('../../../services/comments/addCommentReply');
      await addCommentReply({
        id: 0,
        create_time: '',
        comment_id: this.data.replyToCommentId, // 使用根评论ID
        comment_reply_id: 0,
        reply_to: this.data.replyToNickname || '',
        text: text,
        user_id: user_id,
        avatar: avatar,
        nickname: nickname,
      });
      wx.showToast({ title: '已回复', icon: 'success' });
      const list = [...this.data.commentList];
      const index = list.findIndex((it) => String(it._rootCommentId) === String(this.data.replyToCommentId));
      if (index !== -1) {
        const reply = {
          id: Date.now(),
          create_time: dayjs().format('YYYY/MM/DD HH:mm'),
          reply_to: this.data.replyToNickname || '',
          text: text,
          user_id,
          avatar,
          nickname,
        };
        list[index].replies = list[index].replies || [];
        list[index].replies.push(reply);
        list[index].showReplies = true;
        list[index].replyCount = (list[index].replyCount || 0) + 1;
        list[index].showExpand = list[index].replyCount > 0;
        this.setData({ commentList: list });
      }
      this.onCancelCompose();
    } catch (err) {
      console.error('[land submit reply] error:', err);
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },
  changeTag(e) {
    const { commenttype } = e.currentTarget.dataset;
    this.setData({ commentType: commenttype || '' });
    this.loadAllComments(this.data.land_id);
  },
  onNewCommentInput(e) {
    this.setData({ newCommentText: e.detail.value });
  },
  async onSubmitNewComment() {
    const text = (this.data.newCommentText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    
    // 获取用户信息
    const app = getApp();
    const userInfo = app?.globalData?.userInfo || wx.getStorageSync('userInfo') || {};
    const user_id = userInfo.user_id || 0;
    const avatar = userInfo.avatar || '';
    const nickname = userInfo.nickname || '';

    try {
      const { addComment } = require('../../../services/comments/addComment');
      const payload = {
        id: 0,
        create_time: '',
        text: text,
        comment_id: 0,
        good_id: 0,
        land_id: this.data.land_id || 0,
        user_id: user_id,
        avatar: avatar,
        nickname: nickname,
        comment_reply_num: 0,
      };
      await addComment(payload);
      wx.showToast({ title: '已发表', icon: 'success' });
      this.setData({ newCommentText: '' });
      // 刷新评论列表
      await this.loadAllComments(this.data.land_id);
    } catch (err) {
      console.error('[land submit new comment] error:', err);
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },
});
