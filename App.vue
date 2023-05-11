<script>
	export default {
		onLaunch: function() {
			// #ifndef H5
			// 非H5平台
			// 设置横屏方向
			plus.screen.lockOrientation('landscape-primary');
			plus.navigator.setFullscreen(true)
			// #endif
			this.$store.commit('DataInfo');

			//#ifdef APP-PLUS
			// 获取app 信息存储
			plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
				uni.setStorage({
					key: 'GYFZJZ_Code',
					data: wgtinfo
				})
			})
			//#endif 
		},
		onShow: function() {
			// 自启动
			// let pwi = uni.requireNativePlugin('lich-PowerOnAutoStart');
			// pwi.isIgnoringBatteryOptimizations((d) => { //判断忽略电池优化是否设置
			// 	if (d) {
			// 		pwi.canDrawOverlays((d1) => { //判断是否允许悬浮窗
			// 			if (!d1) {
			// 				pwi.toastMakeText("请允悬浮窗弹出"); //消息提示可自行替换
			// 			}
			// 			pwi.setCanDrawOverlays(); //打开浮窗弹设置页面
			// 		})
			// 	} else {
			// 		pwi.toastMakeText("请忽略电源管理选项");
			// 		pwi.setIgnoringBatteryOptimizations(); //打开忽略电池优化设置页面
			// 	}
			// })
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url("uni.scss");
	@import url('static/css/style.css');
	@import url('static/fonts/iconfont.css');

	@keyframes wordsLoop {
		0% {
			transform: translateX(0px);
			-webkit-transform: translateX(0px);
		}

		100% {
			transform: translateX(-100%);
			-webkit-transform: translateX(-100%);
		}
	}

	@-webkit-keyframes wordsLoop {
		0% {
			transform: translateX(0px);
			-webkit-transform: translateX(0px);
		}

		100% {
			transform: translateX(-100%);
			-webkit-transform: translateX(-100%);
		}
	}
</style>