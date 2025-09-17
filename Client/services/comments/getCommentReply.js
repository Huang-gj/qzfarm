/**
 * 获取某条评论的回复列表
 * @param {{ comment_id: number }} params
 * @returns {Promise<any>}
 */
function getCommentReply(params = {}) {
	const data = {
		comment_id: params.comment_id,
	};
	
	// 使用8889端口，因为评论回复接口属于商品/土地服务
	return new Promise((resolve, reject) => {
		// 获取存储的token
		const tokenData = wx.getStorageSync('token');
		let headers = {
			'Content-Type': 'application/json'
		};

		// 如果有token，添加到请求头
		if (tokenData && tokenData.accessToken) {
			headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
		}

		wx.request({
          // url: 'http://8.133.19.244:8889/commodity/getCommentReply',
          url: 'https://qzfarm.top/commodity/getCommentReply',
			method: 'POST',
			data: data,
			header: headers,
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else {
					reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
				}
			},
			fail: (err) => {
				console.error('请求失败:', err);
				reject(new Error(err.errMsg || '网络请求失败'));
			}
		});
	});
}

module.exports = {
	getCommentReply,
}; 