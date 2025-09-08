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
	
	// 使用8889端口，因为评论接口属于商品/土地服务
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
			    url: 'http://8.133.19.244:8889/commodity/getComment',
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
	getComment,
}; 