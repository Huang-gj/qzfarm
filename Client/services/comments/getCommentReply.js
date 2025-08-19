const { post } = require('../_utils/request');

/**
 * 获取某条评论的回复列表
 * @param {{ comment_id: number }} params
 * @returns {Promise<any>}
 */
function getCommentReply(params = {}) {
	const data = {
		comment_id: params.comment_id,
	};
	return post('/api/getCommentReply', data);
}

module.exports = {
	getCommentReply,
}; 