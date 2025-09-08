const { post } = require('../_utils/request');

/**
 * 新增评论
 * @param {Object} comment - Comment 对象
 * @returns {Promise<any>}
 */
function addComment(comment = {}) {
	const goodId = parseInt(comment.good_id || 0, 10) || 0;
	const landId = parseInt(comment.land_id || 0, 10) || 0;
	const userId = parseInt(comment.user_id || 0, 10) || 0;
	const payload = {
		id: 0,
		create_time: '',
		text: String(comment.text || comment.TEXT || ''),
		comment_id: 0,
		good_id: goodId,
		land_id: landId,
		user_id: userId,
		avatar: String(comment.avatar || ''),
		nickname: String(comment.nickname || ''),
		comment_reply_num: 0,
	};
	  return post('http://8.133.19.244:8889/commodity/addComment', { comment: payload });
}

module.exports = {
	addComment,
}; 