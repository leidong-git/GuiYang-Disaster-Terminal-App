<script>
	export default {
		onLaunch: function() {
			let that = this
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
					data: wgtinfo,
				})
			})

			// 获取Ma地址保存设备唯一标识
			const net = plus.android.importClass('java.net.NetworkInterface');
			// 搜索具有指定名称的网络接口
			const wlan0 = net.getByName('wlan0');
			// 获得网卡的硬件地址
			const macByte = wlan0.getHardwareAddress();
			let mac = '';
			//转换MAC地址的思路来自网上(https://blog.csdn.net/zhangzhen53377562/article/details/109183891)
			macByte.forEach(item => {
				// .toString(16)数字以十六进制值显示
				let temp = '';
				if (item < 0) temp = (256 + item).toString(16);
				else temp = item.toString(16);
				if (temp.length == 1) temp = `0${temp}`;
				mac += temp;
			});
			mac = mac.toUpperCase();
			let mac2 = mac;
			for (let i = 2; i < mac2.length; i += 3) mac2 = mac2.slice(0, i) + ':' + mac2.slice(i);
			// console.log(net);
			// console.log(wlan0);
			// console.log(macByte);
			// console.log(mac2);

			// 获取设备信息
			uni.getSystemInfo({
				success: function(e) {
					uni.setStorage({
						key: 'mac',
						data: mac2
					})

					// 判断当前设备有无权限
					that.$http.post(
							`/Api/AppAuthorization/GetAppAuthorization`, {
								AuthorizationCode: mac2,
								AppDescription: ''
							}, 1)
						.then(res => {
							if (res.code === 200) {
								plus.navigator.closeSplashscreen();
								if (res.data) {
									uni.reLaunch({
										url: `/pages/login/login`,
										success: () => {
											plus.navigator.closeSplashscreen();
										}
									})
								} else {
									uni.reLaunch({
										url: `/pages/power/power`,
										success: () => {
											plus.navigator.closeSplashscreen();
										}
									})
								}
							} else {
								uni.reLaunch({
									url: `/pages/power/power`,
									success: () => {
										plus.navigator.closeSplashscreen();
									}
								})
							}
						})

						.catch(err => {
							uni.showToast({
								title: err
							})
						})
				},
				fail: function(e) {
					uni.showToast({
						title: '获取设备唯一标识失败！'
					})
				}
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