const { post } = require('../_utils/request');

/**
 * 获取评论列表
 * @param {{ good_id?: number, land_id?: number }} params
 * @returns {Promise<any>}
 */
function getComment(params = {}) {
	const data = {
		good_id: params.good_id || 0,
		land_id: params.land_id || 0,
	};
	return post('/api/getComment', data);
}

module.exports = {
	getComment,
}; 