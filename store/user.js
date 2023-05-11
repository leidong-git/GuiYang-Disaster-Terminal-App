export default {
	state: {
		loginInfo: false,
		userInfo: {

		}
	},
	mutations: {
		Login(state, code) {
			state.userInfo = code
			state.loginInfo = true
			uni.setStorageSync('userInfo', JSON.stringify(code))
		},

		LoginOut(state) {
			state.userInfo = {}
			state.loginInfo = false
			uni.removeStorageSync('userInfo')
		},

		DataInfo(state, data) {
			if (data) {
				state.userInfo = data;
				uni.setStorageSync("userInfo", JSON.stringify(data));
			} else {
				if (uni.getStorageSync('userInfo')) {
					state.userInfo = JSON.parse(uni.getStorageSync('userInfo'));
				}
			}
		}
	},
}
