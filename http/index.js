let baseUrl = ""; //公共路径
// // #ifdef APP-PLUS
// baseUrl = "https://www.tjonline.club"; //公共路径
// // #endif

//post请求封装
function postRequest(url, data, code = 0) {
	var promise = new Promise((resolve, reject) => {
		var postData = data || '';
		if (code == 0) {
			baseUrl = "https://www.tjonline.club"; //公共路径
		} else {
			baseUrl = "http://47.108.83.28:10458"; //设备权限
		}
		uni.request({
			url: baseUrl + url,
			data: postData,
			method: 'POST',
			success: function(res) {
				resolve(res.data);
			},
			// 这里的接口请求，如果出现问题就输出接口请求失败
			fail: (err) => {
				reject(err)
			}
		})
	});
	return promise;
}

//get请求封装
function getRequest(url, data, code = 0) {
	var promise = new Promise((resolve, reject) => {
		var postData = data || '';

		// #ifdef APP-PLUS
		if (code == 0) {
			baseUrl = "https://www.tjonline.club"; //公共路径
		} else {
			baseUrl = "http://47.108.83.28:10457"; //格点数据
		}
		// #endif

		uni.request({
			url: baseUrl + url,
			data: postData,
			method: "GET",
			dataType: 'json',
			success: function(res) {
				resolve(res.data);
			},
			// 这里的接口请求，如果出现问题就输出接口请求失败
			fail: (err) => {
				reject(err)
			}
		});
	});
	return promise;
}


export default {
	post: postRequest,
	get: getRequest,
}