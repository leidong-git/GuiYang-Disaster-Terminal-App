<template>
	<view class="login_cont">
		<!-- header -->
		<view class="header">
			<image :src="`../../static/images/login/${login_header.name}`" />
		</view>
		<view class="login_content">
			<view class="login_title">用户登录</view>
			<view class="login_k">
				<view class="login_row">
					<i class="iconfont icon-dengluyonghuming"></i>
					<input v-model="loginInfo.LoginName" placeholder="请输入登录名称" />
				</view>
				<view class="login_row">
					<i class="iconfont icon-mima"></i>
					<input v-model="loginInfo.Password" placeholder="请输入密码" />
				</view>
				<view class="login_row">
					<i class="iconfont icon-yanzhengma"></i>
					<input v-model="loginInfo.VerifyCode" placeholder="请输入验证码" />
					<view ref="canvas" class="code-img-wrapper" @click="UpdateImageCode">
						<canvas class="code_canvas" canvas-id="canvas"></canvas>
					</view>
				</view>
				<view class="login_row">
					<button @click="Login">登录</button>
				</view>
			</view>
		</view>

		<view class="login_footer">
			<text>版权所有：贵州云海气象科技服务有限责任公司 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;联系电话：14785089385</text>
		</view>



		<!-- #ifdef APP-PLUS -->
		<!-- 更新进度 -->
		<uni-popup ref="download" background-color="#fff" width="550px" :is-mask-click="false">
			<view class="popup-content">
				<view class="dialog_title">
					<view class="title_nr">
						<i class="iconfont icon-yunxiazai"></i>
						<text>下载新版本</text>
					</view>
				</view>
				<view class="dialog_nr">
					<text>新版本下载中，请稍等</text>
					<progress :percent="percent" font-size='24rpx' border-radius='44rpx' activeColor='#D52424' show-info
						stroke-width="10"></progress>
				</view>
			</view>
		</uni-popup>
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		Mcaptcha
	} from '@/static/javascript/mcaptcha.js'
	export default {
		data() {
			return {
				login_header: {
					name: 'login_name.png'
				},
				loginInfo: {
					LoginName: 'gysqxj001',
					Password: 'qwer1234',
					VerifyCode: ''
				},
				rules: {
					LoginName: {
						rule: /\s*\S+?/,
						msg: '登录名称不能为空！'
					},
					Password: {
						rule: /^[0-9a-zA-Z]{6,16}$/,
						msg: '密码应该为6-16位字符'
					}
				},

				downLineShow: false,
				percent: '',
			}
		},
		onReady() {
			/*#ifdef H5*/
			let width = this.$refs.canvas.$el.offsetWidth
			let height = this.$refs.canvas.$el.offsetHeight
			/*#endif*/
			/*#ifdef APP-PLUS*/
			let width = 80
			let height = 35
			/*#endif*/
			this.mcaptcha = new Mcaptcha({
				el: 'canvas',
				width: width,
				height: height,
				createCodeImg: ""
			});

			// #ifdef APP-PLUS
			this.getSysVersion()
			// #endif
		},

		onLoad() {

		},
		methods: {

			// #ifdef APP-PLUS
			//获取版本列表
			getSysVersion() {
				const _this = this;
				//获取缓存中，当前app的版本号
				uni.getStorage({
					key: 'GYFZJZ_Code',
					success: (res) => {
						_this.GYFZJZ_Code = res.data;
						this.$http.get('/Admin/CustomerApp/UpdateVersion2/true')
							.then(res => {
								if (res.Status === 1) {
									let appversion = res.Data.Version
									var appUrl = res.Data.Url;

									// 后端返回的app版本和当前app版本比较
									if (appversion > _this.GYFZJZ_Code.version) {
										uni.showModal({
											title: "发现新版本",
											content: "确认下载更新",
											success: (res) => {
												if (res.confirm ==
													true) { //当用户确定更新，执行更新,下面方法进行下载app
													_this.appdownLoad(appUrl);
												} else {
													return false
												}
											}
										})
									}
								} else {
									uni.showToast({
										title: res.msg,
										icon: 'error',
									});
								}
							})
					},
				})
			},

			appdownLoad(url) {
				const downloadTask = uni.downloadFile({
					url: url, //仅为示例，并非真实的资源
					success: (res) => {
						uni.hideLoading()
						if (res.statusCode === 200) {
							let that = this;
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: function(red) {
									uni.openDocument({
										filePath: red.savedFilePath,
										success: (sus) => {
											uni.showToast({
												title: '下载完成',
											})
										}
									})
								}
							})
						}
					}
				});

				downloadTask.onProgressUpdate((res) => {
					this.$refs.download.open('center')
					this.percent = res.progress

					// 满足测试条件，取消下载任务。
					if (res.progress == 100) {
						this.downLineShow = false
					}
				});
			},
			// #endif

			// 刷新验证码
			UpdateImageCode() {
				this.mcaptcha.refresh()
			},

			// 登录
			Login() {
				if (!this.Verify('LoginName')) return
				if (!this.Verify('Password')) return
				if (!this.loginInfo.VerifyCode) {
					return uni.showToast({
						title: '请输入验证码'
					})
				}
				let validate = this.mcaptcha.validate(this.loginInfo.VerifyCode)
				if (!validate) {
					return uni.showToast({
						title: '验证码错误'
					})
				}

				uni.showLoading({
					title: '登录中',
					icon: 'success',
				})

				this.$http.get(
						`/api/Customer/GetCustomer?LoginName=${this.loginInfo.LoginName}&Password=${this.loginInfo.Password}`
					)
					.then(res => {
						uni.showToast({
							title: '登录成功！',
						})
						this.$store.commit('Login', res.Data)
						let admin = {
							name: this.loginInfo.LoginName,
							pwd: this.loginInfo.Password
						}
						this.$store.commit('GetAdmin', admin)
						uni.hideToast()
						// 跳转首页
						uni.navigateTo({
							url: `/pages/index/index`
						})
					})

			},

			// 验证
			Verify(key) {
				let Bool = true
				if (!this.rules[key].rule.test(this.loginInfo[key])) {
					uni.showToast({
						title: this.rules[key].msg
					})
					Bool = false
					return false
				}
				return Bool
			},
		}
	}
</script>

<style lang="less" scoped="scoped">
	.login_cont {
		width: 100%;
		height: 100vh;
		background: url('../../static/images/login/login_bg.png') no-repeat;
		background-size: cover;
		background-position: 50% 50%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		padding: 20rpx 0 50rpx 0;
		box-sizing: border-box;

		.header {
			width: 100%;
			height: 35rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			image {
				width: 440rpx;
				height: 35rpx;
			}

		}

		.login_content {
			width: 215rpx;
			height: auto;
			margin: 0 auto;
			padding: 0rpx 12rpx;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			background: rgba(255, 255, 255, 1);
			box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
			border-radius: 8rpx;
			margin-top: 30rpx;

			.login_title {
				width: 100%;
				height: 40rpx;
				font-size: 16rpx;
				line-height: 40rpx;
				color: #222222;
				text-align: center;
				letter-spacing: 2px;
			}

			.login_k {
				width: 100%;
				height: auto;

				.login_row {
					display: flex;
					height: 30rpx;
					align-items: center;
					font-size: 16rpx;
					margin-bottom: 15rpx;
					position: relative;

					input {
						width: 100%;
						height: 100%;
						border-radius: 50px;
						background: #fcfcfc;
						border: 1px solid #ededed;
						box-shadow: inset 0px 5px 5px rgba(0, 0, 0, 0.1);
						padding-left: 30rpx;
						line-height: 30rpx;
					}

					.iconfont {
						width: 40rpx;
						height: 30rpx;
						font-size: 18rpx;
						line-height: 30rpx;
						color: #bebebe;
						position: absolute;
						left: 8rpx;
						top: 50%;
						transform: translate(0, -50%);
					}

					button {
						width: 100%;
						border-radius: 50px;
						background-image: linear-gradient(to right, #26d0ff, #00a8ff);
						color: #fff;
						font-size: 16rpx;
						height: 35rpx;
						line-height: 35rpx;
						border: 0;
						letter-spacing: 5px;
					}

					.code-img-wrapper {
						width: 150rpx;
						height: 100%;
						border-radius: 2px;
						box-sizing: border-box;
						border: 1px solid #ededed;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-left: 15rpx;
						box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.2);

						.code_canvas {
							width: 100%;
							height: 100%;
						}
					}
				}

				.login_row:hover input,
				.login_row:focus input {
					border: 1px solid #00a8ff;
				}

				.login_row:hover .iconfont,
				.login_row:focuss .iconfont {
					color: #00a8ff;
				}

				.login_row:last-child {
					margin: 20rpx auto;
				}
			}
		}

		.login_footer {
			width: 100%;
			height: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: auto;
			right: 0;
			bottom: 10rpx;
			left: 0;

			text {
				color: #fff;
				text-shadow: 0px 0px 10px #0040bc;
			}
		}
	}

	/deep/.uni-popup .uni-popup__wrapper {
		width: 300rpx !important;
		height: auto;
		border-radius: 5px;
		border: 1px solid #fff;
		box-shadow: 0 0 10px 5px rgba(47, 186, 238, 0.2);
	}

	.dialog_title {
		width: 100%;
		height: 25rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4rpx;
		box-sizing: border-box;
		background: #2FBAEE;
		color: #fff;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
	}

	.dialog_title .title_nr {
		width: 90%;
		display: flex;
		align-items: center;
		flex-direction: row;
	}

	.title_nr .iconfont {
		margin-right: 7rpx;
	}

	.title_nr text {
		width: 95%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 10rpx;
	}

	.dialog_title text i {
		font-size: 8rpx;
		font-style: initial;
		margin-left: 7rpx;
	}

	.dialog_title .title_time {
		color: #7bdaff;
	}

	.dialog_title i {
		cursor: pointer;
		margin: 0;
		font-size: 12rpx;
		color: #fff;
	}

	.dialog_nr {
		width: 100%;
		padding: 15px;
		box-sizing: border-box;
		display: inline-block;
		font-size: 10rpx;
		line-height: 20rpx;
		background: #fffdf5;
		color: #222222;
	}

	.uni-progress {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/deep/.uni-progress-bar {
		width: 85%;
		border-radius: 5px
	}

	/deep/.uni-progress-inner-bar {
		background-color: #00a8ff !important;
		border-radius: 5px
	}
</style>