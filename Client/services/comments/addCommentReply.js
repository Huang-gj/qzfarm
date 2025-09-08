const { post } = require('../_utils/request');

/**
 * 新增评论回复
 * @param {Object} comment_reply - CommentReply 对象
 * @returns {Promise<any>}
 */
function addCommentReply(comment_reply = {}) {
	const payload = {
		id: 0,
		create_time: '',
		comment_id: comment_reply.comment_id || 0,
		comment_reply_id: comment_reply.comment_reply_id || 0,
		reply_to: comment_reply.reply_to || '',
		text: comment_reply.text || comment_reply.TEXT || '',
		user_id: comment_reply.user_id || 0,
		avatar: comment_reply.avatar || '',
		nickname: comment_reply.nickname || '',
	};
	  return post('http://8.133.19.244:8889/commodity/addCommentReply', { comment_reply: payload });
}

module.exports = {
	addCommentReply,
}; 