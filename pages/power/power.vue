<template>
	<view class="content">
		<text class="power_title">未经授权设备</text>
		<div class="power">
			<view class="contact">
				<i class="iconfont icon-jinggao"></i>
				<text>本设备未经授权安装</text>
				<text class="text_detail">如需授权请联系</text>
				<image src="../../static/images/power/jt.png" />
				<view class="contact_cont">
					<text class="contact_cont_name">贵阳市气象局</text>
					<view class="phone">
						<image class="phone_img" src="../../static/images/power/phone.png" />
						<text>0851-85615733</text>
					</view>
				</view>
			</view>

			<view class="power_form">
				<view class="power_form_button">
					<button v-if="!refresh" type="default" @click="Empower()">申请授权</button>
					<button v-if="refresh" type="default" @click="Refresh()">已申请，刷新App</button>
				</view>
				<view class="power_form_input">
					<view class="title">申请备注</view>
					<input class="uni-input" v-model="empower.detail" placeholder="" />
				</view>
			</view>
		</div>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				empower: {
					uuid: '',
					detail: '',
					name: '贵阳市防灾减灾智慧终端'
				},

				refresh: false,
			}
		},
		onReady() {
			// 获取设备id
			this.empower.mac = uni.getStorageSync('mac');
		},
		methods: {
			// 申请授权
			Empower() {
				this.$http.post(
						`/Api/AppAuthorization/SaveAppAuthorization`, {
							AuthorizationCode: this.empower.mac,
							AppDescription: this.empower.name,
							Remark: this.empower.detail
						}, 1)
					.then(res => {
						if (res.code == 200) {
							this.refresh = true
							uni.showToast({
								title: "申请成功!"
							})
						} else {
							this.refresh = true
							uni.showToast({
								title: res.msg
							})
						}
					})
			},

			//刷新App
			Refresh() {
				this.$http.post(
						`/Api/AppAuthorization/GetAppAuthorization`, {
							AuthorizationCode: this.empower.mac,
							AppDescription: ''
						}, 1)
					.then(res => {
						if (res.code === 200) {
							if (res.data) {
								uni.reLaunch({
									url: `/pages/login/login`,
									success: () => {

									}
								})
							} else {
								uni.showToast({
									icon: 'error',
									title: "审核未通过！！"
								})
							}
						}
					})

			}
		}
	}
</script>

<style>
	.content {
		width: 100%;
		height: 100vh;
		background: url('../../static/images/login/login_bg.png') no-repeat;
		background-size: cover;
		background-position: 50% 50%;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		align-content: center;
	}

	.power_title {
		width: 100%;
		height: 80rpx;
		font-size: 30rpx;
		color: #fff;
		display: inline-block;
		text-align: center;

	}

	.power {
		width: 300rpx;
		height: 75vh;
		background: #fff;
		border-radius: 5rpx;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2);
		box-sizing: border-box;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.contact {
		width: 100%;
		height: 42vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		line-height: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1px solid #ccc;
	}

	.contact .iconfont {
		font-size: 28rpx;
		color: #ef2c2c;
		margin-bottom: 10rpx;
	}

	.contact text {
		font-size: 18rpx;
		color: #434343;
	}

	.text_detail {
		font-size: 15rpx !important;
	}

	>>>.contact image {
		width: 20rpx;
		height: 20rpx;
	}

	>>>.phone_img {
		width: 15rpx !important;
		height: 15rpx !important;
		margin-right: 3rpx;
	}

	.contact_cont {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.contact_cont_name {
		width: 100%;
		text-align: center;
	}

	.phone {
		display: flex;
		align-items: center;
	}

	.contact_cont text {
		font-size: 13rpx !important;
	}

	.power_form {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.power_form .power_form_button,
	.power_form .power_form_input {
		width: 100%;
	}

	.power_form_button uni-button {
		width: 80%;
		height: 30rpx;
		line-height: 30rpx;
		margin: 0 auto;
		border-radius: 50px;
		font-size: 12rpx;
		background-image: linear-gradient(to right, #2B94EC, #28ABF6);
		color: #fff;
	}

	.power_form_button uni-button:hover,
	.power_form_button uni-button:focus {
		background-image: linear-gradient(to right, #28ABF6, #2B94EC);
		color: #fff !important;
	}

	.power_form_input {
		width: 80% !important;
		display: flex;
		height: 30rpx;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		border: 1px solid #2B94EC;
		box-shadow: inset 0 0 5px 2px rgba(0, 0, 0, 0.2);
		border-radius: 50px;
	}

	.power_form_input .title {
		width: 70rpx;
		font-size: 12rpx;
		padding: 0 10rpx;
		box-sizing: border-box;
		border-right: 1px solid #ccc;
		text-align: center;
	}

	.power_form_input input {
		width: calc(100% - 70rpx);
		padding: 0 10rpx;
		box-sizing: border-box;
	}

	.uni-input-wrapper {
		width: 100%;
		border: 0;
		height: 100%;
		color: #434343;
		font-size: 12rpx;
	}
</style>