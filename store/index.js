import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		loginInfo: false,
		userInfo: {

		},
		admin: {},
		lastTime: new Date().getTime(),
		timeshow: false,
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

		// 保存用户名密码
		GetAdmin(state, code) {
			state.admin = code
			uni.setStorageSync('admin', JSON.stringify(code))
		},

		// 保存用户信息
		DataInfo(state, data) {
			if (data) {
				state.userInfo = data;
				uni.setStorageSync("userInfo", JSON.stringify(data));
			} else {
				if (uni.getStorageSync('userInfo')) {
					state.userInfo = JSON.parse(uni.getStorageSync('userInfo'));
				}
			}
		},

		//点击事件调用，刷新最后一次点击时间
		lastTimeUpdata: (state, lastTime) => {
			state.lastTime = lastTime;
		},

		//长时间未操作值
		TimeShow: (state, timeshow) => {
			state.timeshow = timeshow;
		}
	},

})