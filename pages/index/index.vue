<template>
	<view class="content" @touchend="isDo()">
		<view class="header">
			<view class="header_time">{{header.time}}</view>
			<image class="header_name" :src="`../../static/images/login/${header.icon}`"></image>
			<view class="header_user">当前用户：{{userInfo.CustomerName}}</view>
		</view>

		<view class="index_cont">
			<view class="map_cont">
				<!-- 地图 -->
				<view class="map" id="map"></view>

				<view :addressR="addressR" :change:addressR="leaflet.Init_Reset"></view>
				<view :address="address" :change:address="leaflet.InitAddress"></view>
				<view :threshold="threshold" :change:threshold="leaflet.GetThreshold"></view>
				<view :map_action_data="map_action_data" :change:map_action_data="leaflet.InitTypeMarker"></view>
				<view :radar_data_list="radar_data_list" :change:radar_data_list="leaflet.InitRadar"></view>
				<view :original_json="original_json" :change:original_json="leaflet.GetOriginal"></view>
				<view :geo_json="geo_json" :change:geo_json="leaflet.GetColorPattern"></view>
				<view :lattice_data="lattice_data" :change:lattice_data="leaflet.GetGridOpen"></view>



				<!-- 滚动播报 -->
				<view class="map_marquee">
					<view id="bottom-content" class="bottom-content">
						<text id="bottom-text"
							:style="{ animation: `wordsLoop ${marquee.scrollTime}s linear infinite normal` }">{{ marquee.value }}</text>
					</view>
				</view>

				<!-- 预警 -->
				<view class="map_warning" v-if="map_warning.length > 0 ">
					<!-- <view class="map_warning_zw" v-if="map_warning.length == 0">暂无预警</view> -->
					<view class="warning_list" @click="Warning_Detail(index)" v-for="(item,index) in map_warning"
						:key="index">
						<image :src="`../../static/images/warning/${item.PinYin}.png`"></image>
					</view>

					<!-- 普通弹窗 -->
					<uni-popup ref="popup" background-color="#fff" width="550px">
						<view class="popup-content">
							<view class="dialog_title">
								<view class="title_nr">
									<i class="iconfont icon-yujing"></i>
									<text>{{map_warning_detail.Headline}}
										<i>({{map_warning_detail.SendTime}})</i></text>
								</view>
								<view>
									<i class="iconfont icon-guanbi1" @click="Warning_Detail_Close()"></i>
								</view>
							</view>
							<view class="dialog_nr">
								<text>{{map_warning_detail.Description}}</text>
								<view class="guide">
									<view class="guide_title">
										| 防御指南:
									</view>
									<view class="guide_nr" v-html="map_warning_detail.guide">

									</view>
								</view>
							</view>
						</view>
					</uni-popup>
				</view>

				<!-- 地图时间 -->
				<div class="map_time">
					<text v-show="map_time.radar.length > 0" v-for="(item,index) in map_time.radar"
						:key="index">{{item}}</text>
					<text v-show="map_time.type.length > 0" v-for="(item,index) in map_time.type"
						:key="index">{{item}}</text>
				</div>

				<!-- 地图操作栏 -->
				<view class="map_action">
					<text class="action_nr_title">{{map_action_title}}</text>
					<view class="action_nr">
						<view class="action_item" v-for="(item,index) in map_action" :key="index">
							<view @click="Map_Action_Click(item,index)"
								:class="`action_cont ${ map_action_active.type == item.type?'active':''}`">
								<i :class="`iconfont ${item.icon}`"></i>
								<text>{{item.name}}</text>
							</view>
							<view class="item_xian"></view>
						</view>
					</view>


					<text class="action_nr_title">{{map_prediction_title}}</text>
					<view class="action_nr">
						<view class="action_item" v-for="(item,index) in map_prediction" :key="index">
							<view @click="Map_Prediction_Click(item,index)"
								:class="`action_cont ${ map_action_active.type == item.type?'active':''}`">
								<i :class="`iconfont ${item.icon}`"></i>
								<text>{{item.name}}</text>
							</view>
							<view class="item_xian"></view>
						</view>
					</view>
				</view>

				<!-- 决策 -->
				<!-- <view class="pre_action" v-if="pre_action_show">
					<view @click="Pre_Action_Click(item,index)" class="pre_action_item"
						v-for="(item,index) in pre_action">
						<view :class="`pre_action_cont  ${pre_action_active == index ? 'active':''}`">
							<i :class="`iconfont ${item.icon}`"></i>
							<text>{{item.name}}</text>
						</view>
						<view class="item_xian"></view>
					</view>
					pre_action: [{
						icon: 'icon-gaiicon-',
						name: '决策'
					}, {
						icon: 'icon-fenlei_hover',
						name: '行业'
					}],
					pre_action_active: 0,
					pre_action_show: false,
				</view> -->

				<!-- 雷达按钮 -->
				<view @click="Radar_Action_Show()" :class="`rader_operate ${radar_action_show ? 'active':''}`">
					<i class="iconfont icon-satellite-signal-full"></i>
				</view>

				<!-- 雷达按钮 -->
				<view @click="Reset_Action()" class="reset_operate">
					<i class="iconfont icon-a-dingwei2"></i>
				</view>

				<!-- 降雨滑块 -->
				<view class="rain_action slider_action" v-if="rain_action_show">
					<view class="rain_action_title">降雨</view>
					<view class="slider_cont">
						<view class="slider_tool">
							<view class="tool_list" v-for="(item,index) in precData" :key="index"></view>
						</view>
						<slider min="0" :max="rain_action.max" :value="rain_action.value" @change="Slider_Change"
							step="10"></slider>
						<view class="slider_size">
							<view class="tool_list" v-for="(item,index) in precData" :key="index">
								<text>{{item}}</text>
							</view>
						</view>
					</view>
					<i @click="Rain_Action_Paly()"
						:class="`iconfont ${rain_action_paly?'icon-zanting':'icon-bofang'}`"></i>
				</view>

				<!-- 预报滑块 -->
				<view class="rain_action slider_action" v-if="prediction_action_show">
					<view class="rain_action_title">{{map_action_active.name}}</view>
					<view class="slider_cont">
						<view class="slider_tool">
							<view class="tool_list" v-for="(item,index) in prediction_action.list" :key="index"></view>
						</view>
						<slider min="0" :max="prediction_action.max" :value="prediction_action.value"
							@change="Pre_Slider_Change" step="10"></slider>
						<view class="slider_size">
							<view class="tool_list" v-for="(item,index) in prediction_action.list" :key="index">
								<text>{{item}}</text>
							</view>
						</view>
					</view>
					<i @click="Pre_Action_Paly()"
						:class="`iconfont ${prediction_action_paly?'icon-zanting':'icon-bofang'}`"></i>
				</view>

				<!-- 雷达滑块 -->
				<view class="radar_action slider_action" v-if="radar_action_show">
					<view class="rain_action_title">雷达</view>
					<view class="slider_cont">
						<view class="slider_tool">
							<view class="tool_list" v-for="(item,index) in radar_data" :key="index"></view>
						</view>
						<slider min="0" :max="radar_action.max" :value="radar_action.value" @change="Radar_Change"
							step="10"></slider>
						<view class="slider_size">
							<view class="tool_list" v-for="(item,index) in radar_data" :key="index">
								<text>{{item.Datetime | radar_time}}</text>
							</view>
						</view>
					</view>
					<i @click="Radar_Play()" :class="`iconfont ${radar_action_paly?'icon-zanting':'icon-bofang'}`"></i>
				</view>

				<!-- 色标 -->
				<view class="legend" v-if="legend_show">
					<text class="legend_title">{{legend.name}}:{{legend.unit}}</text>
					<view class="legend_nr">
						<view class="legend_item" v-for="(item,index) in legend.list" :key="item.id">
							<view class="color_item" :style="`background:${item.strColor}`"></view>
							<text class="size_item">{{item.value}}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 操作栏 -->
			<view class="index_action">
				<!-- 天气实况 -->
				<view class="action_actually">
					<view class="actually_cont">
						<view class="actu_city">
							<view class="actu_title">
								<i class="iconfont icon-dizhi"></i>
								<text>{{userInfo.City}}{{userInfo.District}}</text>
							</view>
							<image class="actu_phe"
								:src="`../../static/images/weather/lan/${this.weather_list.phe}.png`"></image>
							<text class="actu_tem">{{this.weather_list.tem}}℃</text>
						</view>
						<view class="actu_factor">
							<view class="actu_title">
								<i class="iconfont icon-jizhanguanli"></i>
								<text>{{this.weather_cont.Name}}</text>
							</view>
							<view class="actu_fa_cont">
								<view class="fa_cont_list">
									相随湿度：
									<text>{{this.weather_list.hum}}%</text>
								</view>
								<view class="fa_cont_list">
									气 &nbsp;&nbsp;&nbsp; 压：
									<text>{{this.weather_list.pre}}hpa</text>
								</view>
								<view class="fa_cont_list">
									风速风向：
									<text>{{this.weather_list.win_s}}/s {{this.weather_list.win_d}}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="active_title">
						<text>天气实况</text>
					</view>
				</view>

				<!-- 降水分布 -->
				<view class="action_precipitation">
					<view class="precipitation_cont">
						<view class="prec_title">
							<view class="precul">
								<view @tap="Prec_Change(index)"
									:class="prec_active == index ? 'precli active':'precli' "
									v-for="(item,index) in precData" :key="index">
									{{item}}
								</view>
							</view>
						</view>
						<view class="prec_cont">
							<uni-table ref="table" :loading="loading" stripe emptyText="暂无更多数据">
								<!-- 表头行 -->
								<view class="table_head">
									<uni-tr>
										<uni-th align="center">排名</uni-th>
										<uni-th align="center">站名</uni-th>
										<uni-th align="center">地区</uni-th>
										<uni-th sortable align="center">{{precData[prec_active]}}降雨量
										</uni-th>
										<uni-th align="center">站类</uni-th>
									</uni-tr>
								</view>
								<!-- 表格数据行 -->
								<scroll-view :scroll-top="scrollTop" @scroll="scroll" scroll-y="true" class="table_body"
									ref="table_body" :show-scrollbar="false">
									<uni-tr v-for="(item, index) in tableData" :key="index">
										<uni-td align="center">
											<i>{{ index+1 }}</i>
										</uni-td>
										<uni-td align="center">{{ item.Name }}</uni-td>
										<uni-td align="center">{{ item.County }}</uni-td>
										<uni-td align="center">{{ item.Rain }}</uni-td>
										<uni-td align="center">{{ item.StationCategory | getType}}</uni-td>
									</uni-tr>
									<view @click="Table_Loading()" class="table_loading"
										v-if="tableData.length > 0 && tableData_total">
										<text>加载更多</text>
									</view>
								</scroll-view>
							</uni-table>
						</view>
					</view>
					<view class="active_title">
						<text>降水分布</text>
					</view>
				</view>

				<!-- 天气预报 -->
				<view class="action_prediction">
					<view class="prediction_cont">
						<view class="pre_weather" v-if="action_nav_index == 0">
							<view class="pred_cont">
								<view class="pred_ul">
									<view class="pred_li" v-for="(item,index) in weather_pred" :key="index">
										<text>{{item.date | getWeek}}</text>
										<text>{{item.high}}℃</text>
										<image :src="`../../static/images/weather/lan/${item.text_day}.png`">
										</image>
										<view class="zhu_cont">
											<view :style="`height:${item.height}%; top:${item.top}%`" class="zhu_nr">
											</view>
										</view>
										<image :src="`../../static/images/weather/lan/${item.text_day}.png`">
										</image>
										<text>{{item.low}}℃</text>
										<text>{{item.wind_direction}}</text>
										<text>{{item.wind_scale | getWindLevel}}</text>
									</view>
								</view>
							</view>
						</view>
						<view class="pre_roll" v-else>
							<view class="roll_text">
								{{roll.value}}
							</view>
							<view class="roll_img">
								<image :src="`../../static/images/warning/${roll.image}.png`"></image>
							</view>
						</view>
					</view>
					<view class="action_nav">
						<view @tap="Nav_Action(index)" v-for="(item,index) in action_nav" :key="item.id"
							:class="`action_title ${action_nav_index == index ? 'active':''}`">
							<text>{{item.name}}</text>
						</view>
					</view>
				</view>
			</view>
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


		<!-- 服务快到期 -->
		<uni-popup ref="server_on_expire" background-color="#fff" width="550px">
			<view class="popup-content">
				<view class="dialog_title server_on_title">
					<view class="server_nr">
						<text>服务时长预到期提醒</text>
					</view>
				</view>
				<view class="dialog_nr">
					<view class="server_cont">
						<view class="server_list">
							<i>{{userInfo.CustomerName}}</i>
							<text>，您的服务时长于</text>
							<i>{{userInfo.ServerEndTime}}</i>
							<text>到期，为避免影响气象数据查看及推送服务，请及时续费。</text>
						</view>
						<view class="server_list">
							<view class="server_list_title">
								<view class="xian"></view>
								<text>联系方式</text>
							</view>
							<text>贵州云海气象科技服务有限责任公司</text></br>
							<text>18546246057</text>
						</view>
						<view class="server_an">
							<button class="refresh" type="default" @click="Close_Server()">确
								定</button>
						</view>
					</view>

				</view>
			</view>
		</uni-popup>



		<!-- 服务到期 -->
		<uni-popup ref="server_expire" background-color="#fff" width="550px" :is-mask-click="false">
			<view class="popup-content">
				<view class="dialog_title server_title">
					<view class="server_nr">
						<text>服务时长到期提醒</text>
					</view>
				</view>
				<view class="dialog_nr">
					<view class="server_cont">
						<view class="server_list">
							<i>{{userInfo.CustomerName}}</i>
							<text>，您的服务时长于</text>
							<i>{{userInfo.ServerEndTime}}</i>
							<text>到期，为避免影响气象数据查看及推送服务，请及时续费。</text>
						</view>
						<view class="server_list">
							<view class="server_list_title">
								<view class="xian"></view>
								<text>联系方式</text>
							</view>
							<text>贵州云海气象科技服务有限责任公司</text></br>
							<text>18546246057</text>
						</view>
						<view class="server_an">
							<button class="close" type="default" @click="Refresh_UserInfo()">已续费，刷新界面</button>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script>
	import Weather from '@/static/javascript/wrather.js'
	import warning from '@/static/javascript/warning.js'
	import Filter from '@/static/javascript/filter.js'
	import {
		timeOut
	} from '@/static/javascript/timeOut.js'
	import {
		contours
	} from 'd3-contour'
	// 草皮
	import * as turf from '@turf/turf'
	export default {
		data() {
			return {
				// 下载设置
				downLineShow: false,
				percent: '',

				userInfo: {},
				admin: {},
				header: {
					time: '',
					icon: 'login_name.png',
				},

				// 天气实况
				weather_cont: {},
				weather_list: {},


				// 降水分布
				prec_active: 0,
				precData: ['1H', '3H', '6H', '12H', '24H', '48H', '72H'],
				tableData: [],
				tableDatacont: {},
				tableDataIndex: 0,
				tableData_total: true,
				scrollTop: 0,
				oldScrollTop: 0,
				loading: false,

				// 操作栏
				action_nav_index: 0,
				action_nav: [{
					id: 'nav1',
					name: '天气预报'
				}, {
					id: 'nav2',
					name: '滚动预报'
				}],

				// 天气预报
				weather_pred: [],

				// 滚动播报
				roll: {
					value: '贵阳市气象台2022年6月21日17时发布：目前全市阴天有阵雨， 各地气温18~20℃之间，预计今天傍晚到夜间，有阵雨或雷雨',
					image: 'wu',
					scrollTime: 0,
					pWidth: 0,
					cWidth: 0,
					content: ''
				},

				address: [],
				addressR: [],

				// 地图
				map: null,
				marquee: {
					value: '贵阳市气象台2022年6月21日17时发布：目前全市阴天有阵雨， 各地气温18~20℃之间，预计今天傍晚到夜间',
					scrollTime: 50,
					pWidth: 0,
					cWidth: 0,
					content: ''
				},

				map_warning: [],
				map_warning_detail: {},

				map_time: {
					radar: [],
					type: []
				},
				// {
				// 	value: '2021/7/4 14:00——2021/7/4 15:00 累计降水',
				// }, {
				// 	value: '2021/7/4 14:00——2021/7/4 15:00 实时气温',
				// }, {
				// 	value: '2021/7/4 14:00——2021/7/4 15:00 平均风速',
				// }

				map_action_title: '实况',
				map_action: [{
					icon: 'icon-wendu',
					name: '温度',
					type: 8,
				}, {
					icon: 'icon-icon-humidity',
					name: '雨量',
					type: 16,
				}, {
					icon: 'icon-daqishidu',
					name: '湿度',
					type: 32,
				}, {
					icon: 'icon-dafeng',
					name: '风速',
					type: 64,
				}],

				map_prediction_title: '预报',
				map_prediction: [{
					icon: 'icon-wendu',
					name: '温度',
					code: 'TEM_For_03',
					type: 128,
				}, {
					icon: 'icon-icon-humidity',
					name: '雨量',
					code: 'PRE_For_03',
					type: 256,
				}],

				map_action_active: {
					icon: '',
					name: '',
					code: '',
					type: 8,
				},
				map_action_type: 8,
				map_action_data: [],

				rain_action_show: false,
				rain_action_paly: false,
				rain_action: {
					value: 0,
					max: 60,
				},

				prediction_action_show: false,
				prediction_action_paly: false,
				prediction_slider_title: '',
				prediction_slider_type: "",
				prediction_action: {
					value: 0,
					max: 70,
					list: ['3H', '6H', '9H', '12H', '15H', '18H', '21H', '24H'],
					listname: [],
				},

				radar_action_show: false,
				radar_action_paly: false,
				radar_data: [],
				radar_data_list: [],
				radar_action: {
					value: 40,
					max: 40,
				},

				// 阈值
				threshold: [],

				// 色标
				legend_show: false,
				legend: {
					name: '降雨量',
					unit: 'mm',
					list: [{
						id: 10001,
						value: '0.1~20',
						color: '#FFFFFF'
					}, {
						id: 10003,
						value: '2.5~20',
						color: '#DDFF4C'
					}, {
						id: 10004,
						value: '5~20',
						color: '#A4FF4C'
					}, {
						id: 10005,
						value: '10~20',
						color: '#4CFFCB'
					}, {
						id: 10006,
						value: '25~20',
						color: '#4CDDFF'
					}, {
						id: 10007,
						value: '50~20',
						color: '#4CC1FF '
					}, {
						id: 10008,
						value: '100~20',
						color: '#4C9EFF'
					}, {
						id: 10009,
						value: '9999~20',
						color: '#FFDD4C'
					}, ],
				},

				// 格点
				lattice_data: [],
				original_json: [],
				geo_json: [],

				// 时间记录
				lastTime: null, //最后一次点击的时间
				currentTime: null, //当前点击的时间
				timeOut: 10 * 1000, //设置超时时间： 10分钟
				navTime: null,
				navList: [8, 16, 32, 64, 128, 256],

				// 定时器
				navTime: null,
				menuTime: null,
				tabTime: null
			}
		},
		filters: {
			getType(num) {
				var type = '';
				switch (num) {
					case 1:
						type = 'I类'
						break;
					case 2:
						type = 'II类'
						break;
					case 3:
						type = 'III类'
						break;
					case 4:
						type = 'IV类'
						break;
					default:
						type = '自建'
				}
				return type;
			},

			getWindLevel(num) {
				if (num == '-') return '-'
				var level = '';
				if (num < 0.2) {
					level = '无风';
				} else if (num >= 0.2 && num < 1.6) {
					level = '一级';
				} else if (num >= 1.6 && num < 3.4) {
					level = '二级';
				} else if (num >= 3.4 && num < 5.5) {
					level = '三级';
				} else if (num >= 5.5 && num < 8.0) {
					level = '四级';
				} else if (num >= 8.0 && num < 10.8) {
					level = '五级';
				} else if (num >= 10.8 && num < 13.9) {
					level = '六级';
				} else if (num >= 13.9 && num < 17.2) {
					level = '七级';
				} else if (num >= 17.2 && num < 20.8) {
					level = '八级';
				} else if (num >= 20.8 && num < 24.5) {
					level = '九级';
				} else if (num >= 24.5 && num < 28.5) {
					level = '十级';
				} else if (num >= 28.5 && num < 32.7) {
					level = '十一级';
				} else if (num >= 32.7 && num < 37) {
					level = '十二级';
				} else if (num >= 37) {
					level = '>十二级';
				}
				return level;
			},

			getWeek(num) {
				let dt = new Date(num)
				var day = dt.getDay();
				var weeks = new Array(
					"周日",
					"周一",
					"周二",
					"周三",
					"周四",
					"周五",
					"周六"
				);
				var week = weeks[day];
				return week;
			},

			radar_time(time) {
				let date = new Date(time)
				let H = date.getHours() //小时
				let m = date.getMinutes() //分

				return `${H}:${m}`
			}
		},
		components: {

		},
		watch: {
			// 监听无操作 后开启循环定时器
			"$store.state.timeshow": {
				deep: true, //深度监听设置为 true
				handler: function(newVal, oldVal) {
					if (newVal) {
						console.log("超时了开启循环定时器")
						this.$store.commit("TimeShow", false)

						// 循环定时器
						this.addressR = this.address
						setTimeout(() => {
							this.addressR = []
						}, 100)
						this.OpenTimeOut()
						this.OpenNavTimeOut()
						this.OpenTabTimeOut()
					}
				}
			},

			"userInfo": {
				deep: true, //深度监听设置为 true
				handler: function(newVal, oldVal) {
					console.log('用户信息更新');
					this.Determine_Data()
				}
			},
		},
		onShow() {
			timeOut();
		},
		onLoad() {
			this.lastTime = new Date().getTime();
		},
		onReady() {
			// #ifdef APP-PLUS
			// 检查版本更新
			this.getSysVersion()
			// #endif
			this.userInfo = this.$store.state.userInfo
			this.admin = this.$store.state.admin
			this.GetTime()
			// 数据获取
			this.GetInit()
			this.$nextTick(() => {
				this.Determine_Data()
			})
		},
		methods: {

			// #ifdef APP-PLUS
			//更新最新版本
			getSysVersion() {
				const _this = this;
				//获取缓存中，当前app的版本号
				uni.getStorage({
					key: 'GYFZJZ_Code',
					success: (res) => {
						_this.GYFZJZ_Code = res.data;
						this.$http.get('/Admin/CustomerApp/UpdateVersion/true')
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

			// 服务时长判断
			Determine_Data() {

				//let endtime = new Date(this.userInfo.ServerEndTime).getTime() / 1000
				let endtime = new Date(this.userInfo.ServerEndTime).getTime() / 1000
				let time = new Date().getTime() / 1000
				let serve = (endtime - time) < 7 * 24 * 60 * 60

				if (endtime < time) {
					this.$refs.server_expire.open('center')
				} else if (endtime < time || serve) {
					this.$refs.server_expire.close()
					this.$refs.server_on_expire.open('center')
				} else {
					this.$refs.server_expire.close()
				}
			},

			// 更新用户信息
			Refresh_UserInfo() {
				this.$http.get(
						`/api/Customer/GetCustomer?LoginName=${this.admin.name}&Password=${this.admin.pwd}`
					)
					.then(res => {
						this.$store.commit('Login', res.Data)
						this.userInfo = res.Data
					})
			},

			// 关闭提示
			Close_Server() {
				this.$refs.server_on_expire.close()
			},

			// 获取当前时间
			GetTime() {
				var dt = new Date()
				const y = dt.getFullYear() //年
				const m = (dt.getMonth() + 1 + '').toString().padStart(2, '0'); //月
				const d = dt.getDate().toString().padStart(2, '0'); //日
				const h = dt.getHours().toString().padStart(2, '0'); //小时
				const mm = dt.getMinutes().toString().padStart(2, '0'); //分
				const weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
				const day = dt.getDay();

				this.header.time = `${y}年${m}月${d}日 ${weeks[day]} ${h}:${mm}`
			},

			// 获取数据
			GetInit() {
				uni.showLoading({
					title: '加载中',
					mask: true,
				});

				this.GetActually()
				this.GetPrecipitation()
				this.GetSevenWeather()
				this.Get_Current_Location()
				this.GetThresholdData()
				this.Init_Radar()
				this.Marquee()
				this.GetWarning()
				this.Get_Action_Data(8, 1)

				this.RefreshUrl()
				this.RefreshData()

				setTimeout(() => {
					uni.hideLoading();
				}, 1000)
			},

			//一小时刷新界面
			RefreshUrl() {
				this.refreshurl = setTimeout(() => {
					uni.showToast({
						title: '定时刷新',
						duration: 2000
					})

					clearInterval(this.navTime)
					clearInterval(this.menuTime)
					clearInterval(this.tabTime)
					clearTimeout(this.refreshurl)
					clearInterval(this.setInterval)

					uni.redirectTo({
						url: `/pages/index/index`
					})
					clearTimeout(this.refreshurl)
				}, 1000 * 60 * 60)
			},

			// 10分钟刷新数据
			RefreshData() {
				this.refreshdata = setInterval(() => {
					this.GetActually()
					this.GetPrecipitation()
					this.GetSevenWeather()
					this.GetThresholdData()
					this.Init_Radar()
					this.Marquee()
					this.GetWarning()
				}, 1000 * 60 * 10)
			},

			// 获取天气实况
			GetActually() {
				this.$http.get(
						`/api/Customer/GetNowWeatherAndRain?longitude=${this.userInfo.Lng}&latitude=${this.userInfo.Lat}`
					)
					.then(res => {
						this.weather_cont = res.Data
						let phe_code = this.weather_cont.Factor.find(m => m.Factor == 1024)
						this.weather_list.tem = this.weather_cont.Factor.find(m => m.Factor == 8).Value || '暂无数据'
						this.weather_list.phe = Weather.getWeatherCode(phe_code) || Weather.getWeathertem(this
							.weather_list.tem)
						this.weather_list.hum = this.weather_cont.Factor.find(m => m.Factor == 32).Value || '暂无数据'
						this.weather_list.pre = this.weather_cont.Factor.find(m => m.Factor == 256).Value || '暂无数据'
						this.weather_list.win_s = this.weather_cont.Factor.find(m => m.Factor == 64).Value || '暂无数据'
						let wind = this.weather_cont.Factor.find(m => m.Factor == 128).Value || '暂无数据'
						this.weather_list.win_d = Weather.getWinddirection(wind)
					})
			},

			// 获取站点雨量数据
			GetPrecipitation() {
				let Stations = this.userInfo.Stations.join(",")
				Promise.all([
						this.GetRain(Stations, 1),
						this.GetRain(Stations, 3),
						this.GetRain(Stations, 6),
						this.GetRain(Stations, 12),
						this.GetRain(Stations, 24),
						this.GetRain(Stations, 48),
						this.GetRain(Stations, 72)
					])
					.then(res => {
						res.forEach((item, index) => {
							this.tableDatacont[this.precData[index]] = item
						})

						this.tableData = this.tableDatacont[this.precData[this.prec_active]].slice(0, 10)
						// console.log(this.$refs.table_body);
						// this.$refs.table_body.$el.offsetTop = 0
					})
			},

			// 雨量数据请求
			async GetRain(Stations, Hour) {
				let data = {}
				data = await this.$http.get(
						`/api/Customer/GetCustomerRain?Stations=${Stations}&hour=${Hour}`
					)
					.then(res => {
						return res.Data
					})

				return data
			},

			// 站点雨量菜单切换
			Prec_Change(index) {
				this.tableDataIndex = 0 //数据第一页
				this.tableData_total = true //数据按钮加载显示
				this.prec_active = index //当前索引
				this.tableData = this.tableDatacont[this.precData[this.prec_active]].slice(0, 10)
				this.scrollTop = this.oldScrollTop
				this.$nextTick(() => {
					this.scrollTop = 0
				});
			},

			scroll(e) {
				//记录scroll  位置
				this.oldScrollTop = e.detail.scrollTop
			},

			// 加载更多
			Table_Loading() {
				this.tableDataIndex++
				this.tableData = [...this.tableData, ...this.tableDatacont[this.precData[this.prec_active]].slice(this
					.tableDataIndex * 10, (this
						.tableDataIndex + 1) * 10)]
				// 数据全部显示后隐藏加载按钮
				if (this.tableData.length == this.tableDatacont[this.precData[this.prec_active]].length) {
					this.tableData_total = false
				}
			},

			// 获取7天天气预报
			GetSevenWeather() {
				this.$http.get(
						`/api/Weather/GetWeatherDayAndHourByAllSource?longitude=${this.userInfo.Lng}&latitude=${this.userInfo.Lat}`
					)
					.then(res => {
						this.GetBarChart(res.Data.daily)
					})
			},

			// 生成柱状图
			GetBarChart(data) {
				let weather = [...data]
				let zhu_data = weather.map(item => {
					return [item.high, item.low]
				})

				var ta = zhu_data.join(",").split(",");
				var Maxindex = Math.max.apply(null, ta); //最大值
				var Minindex = Math.min.apply(null, ta); //最小
				var Listindex = 100 / (Maxindex - Minindex); //每一度占的百分比
				for (let j = 0; j < zhu_data.length; j++) {
					var Height = (zhu_data[j][0] - zhu_data[j][1]) * Listindex; //每项数据高度的百分比
					var Top = (Maxindex - zhu_data[j][0]) * Listindex; //每项数据向下偏移的百分比
					weather[j].top = Top
					weather[j].height = Height
					weather[j].text_day = Weather.getWeatherIcon(weather[j].text_day)
					weather[j].text_day2 = Weather.getWeatherIcon(weather[j].text_day2)
				}


				this.weather_pred = weather
				// console.log(this.weather_pred);
			},

			// 切换action 菜单
			Nav_Action(index) {
				this.action_nav_index = index
			},

			// 获取用户经纬度
			Get_Current_Location() {
				let that = this
				uni.getLocation({
					type: 'wgs84',
					success: function(res) {
						that.address.push(res)
					}
				});
			},

			// 回位
			Reset_Action() {
				this.addressR = this.address
				setTimeout(() => {
					this.addressR = []
				}, 100)
			},

			// 获取阈值
			GetThresholdData() {
				this.threshold = []
				this.$http.get(
						`/api/Customer/GetCustomerStationWarning?LoginName=${this.admin.name}&Password=${this.admin.pwd}`
					)
					.then(res => {
						this.threshold.push(res.Data)
					})
			},

			// 跑马灯
			Marquee() {
				//计算滚动文字的父控件的宽度，这个宽度在页面渲染完成后就有了
				const query = uni.createSelectorQuery().in(this);
				query.select('#bottom-content').boundingClientRect(data => {
					this.marquee.pWidth = data.width;
				}).exec();

				this.$http.get(
						`/api/Customer/GetCustomerNotice`
					)
					.then(res => {
						//这一句很重要，不然滚动不生效
						this.$nextTick(() => {
							this.marquee.value = res.Data.Content
							this.initScrollTime();
						});
					})
			},

			// 滚动
			initScrollTime() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#bottom-text').boundingClientRect(data => {
						this.marquee.cWidth = data.width;
						if (this.marquee.cWidth > 0 && this.marquee.pWidth < this.marquee.cWidth) {
							this.marquee.scrollTime = (this.marquee.cWidth / 50).toFixed(2); //动画过渡时间
						}
					})
					.exec();
			},

			// 预警
			GetWarning() {
				this.$http.get(
						`/api/Warning/GetWarningListAll?city=${this.userInfo.City}&district=${this.userInfo.District}`
					)
					.then(res => {
						this.map_warning = res.Data
						// 将图标名循环添加
						if (this.map_warning.length > 0) {
							this.map_warning.forEach(item => {
								item.PinYin = Weather.loadPinYinInit.ConvertPinyin(item.WarningType)
							})
						}

						//console.log(this.map_warning);
					})
			},

			// 预警弹窗
			Warning_Detail(index) {
				this.$refs.popup.open('center')
				this.map_warning_detail = this.map_warning[index]
				this.map_warning_detail.guide = warning.Early_Warning(this.map_warning_detail.Type, this.map_warning_detail
					.Color)
			},

			// 关闭预警
			Warning_Detail_Close() {
				this.$refs.popup.close()
			},

			// 地图实况操作栏点击
			Map_Action_Click(item, index) {
				this.prediction_action_show = false
				this.rain_action_show = false
				this.map_action_active = item
				this.map_time.type = []
				this.legend_show = false

				if (item.type == 16) {
					this.rain_action_show = true
					this.Get_Action_Data(item.type, 1)
				} else {
					this.Get_Action_Data(item.type, 0)
				}
			},

			// 获取操作栏点击数据
			async Get_Action_Data(type, hour) {
				let stations = this.userInfo.Stations.join(",")
				let res = await this.$http.get(
					`/api/Customer/GetStationByFactor?factor=${type}&stations=${stations}&hour=${hour}`
				)
				let data = []
				if (this.map_action_active.type == 16) {
					data = res.Data.filter(item => {
						if (item.RainSum > 0) {
							item.RainSum = (item.RainSum).toFixed(1);
							item.map_type = this.map_action_active.type
							return item
						}
					})
				} else {
					data = res.Data.filter(item => {
						if (item.Value > 0) {
							item.map_type = this.map_action_active.type
							return item
						}
					})
				}

				this.map_action_data = [...data]
			},

			// 降雨滑块
			Slider_Change(e) {
				let index = (e.detail.value / 10)
				this.Prec_Change(index)
				let hour = this.precData[index].replace("H", '')
				this.Get_Action_Data(this.map_action_active.type, hour)
			},

			// 降雨滑块自动播放
			Rain_Action_Paly() {
				if (this.rain_action_paly == true) {
					// 销毁计时器
					clearInterval(this.playInterval);
					this.rain_action_paly = false
				} else {
					// 定时器
					this.playInterval = setInterval(() => {
						if (this.rain_action.value / 10 >= this.precData.length - 1) {
							this.rain_action.value = 0
							clearInterval(this.playInterval);
							this.rain_action_paly = false
						} else {
							this.rain_action.value += 10;
						}
						let code = {
							detail: {
								value: this.rain_action.value
							}
						}
						this.Slider_Change(code)
					}, 3500);
					this.rain_action_paly = true
				}
			},

			// 地图预报操作栏点击
			Map_Prediction_Click(item, index) {
				this.rain_action_show = false
				this.map_action_active = item
				this.Get_Lattice_List(item.code, 0)
			},

			// 预报滑块
			Pre_Slider_Change(e) {
				let index = (e.detail.value / 10)
				this.Get_Lattice_List(this.map_action_active.code, index)
			},

			// 预报滑块自动播放
			Pre_Action_Paly() {
				if (this.prediction_action_paly == true) {
					// 销毁计时器
					clearInterval(this.pre_playInterval);
					this.prediction_action_paly = false
				} else {
					// 定时器
					this.pre_playInterval = setInterval(() => {
						if (this.prediction_action.value / 10 >= this.prediction_action.list.length - 1) {
							this.prediction_action.value = 0
							clearInterval(this.pre_playInterval);
							this.prediction_action_paly = false
						} else {
							this.prediction_action.value += 10;
						}
						let code = {
							detail: {
								value: this.prediction_action.value
							}
						}
						this.Pre_Slider_Change(code)
					}, 5000);
					this.prediction_action_paly = true
				}
			},

			// 雷达显示
			Radar_Action_Show() {
				this.radar_action_show = !this.radar_action_show
				this.map_time.radar = []
				if (this.radar_action_show) {
					this.radar_data_list.push(this.radar_data[this.radar_data.length - 1])
					this.map_time.radar = []
					let time = `${this.radar_data[this.radar_data.length - 1].Datetime} 雷达回播图`
					this.map_time.radar.push(time)
				} else {
					this.radar_action_show = false;
					clearInterval(this.radarInterval);
					this.radar_data_list = []
				}
			},

			// 雷达数据
			Init_Radar() {
				let num = 5
				this.$http.get(
						`/api/Radar/GetRadar?num=${num}`
					)
					.then(res => {
						if (res.Data.length == 0) {
							uni.showToast({
								title: '暂无数据！',
							})
							this.radar_data_list = []
							return false
						}
						this.radar_data = res.Data.reverse()
					})
			},

			// 雷达滑块自动播放
			Radar_Play() {
				// console.log(this.radar_action_paly);
				if (this.radar_action_paly == true) {
					// 销毁计时器
					clearInterval(this.radarInterval);
					this.radar_action_paly = false
				} else {
					// 定时器
					this.radarInterval = setInterval(() => {
						if (this.radar_action.value / 10 >= this.radar_data.length - 1) {
							this.radar_action.value = 0

						} else {
							this.radar_action.value += 10;
							if (this.radar_action.value == 40) {
								// 销毁计时器
								clearInterval(this.radarInterval);
								this.radar_action_paly = false
							}
						}

						let code = {
							detail: {
								value: this.radar_action.value
							}
						}
						this.Radar_Change(code)
					}, 5000);
					this.radar_action_paly = true
				}
			},

			// 雷达滑块
			Radar_Change(e) {
				let index = (e.detail.value / 10)
				this.radar_data_list = []
				this.radar_data_list.push(this.radar_data[index])
				this.map_time.radar = []
				let time = `${this.radar_data[index].Datetime} 雷达回播图`
				this.map_time.radar.push(time)
			},

			//获取格点进度条
			Get_Lattice_List(code, index) {
				this.$http.get(
						`/Api/GridForecast/GetGridForecastIndx?TypeCode=${code}`, '', 1)
					.then(res => {
						this.prediction_action_show = true
						this.prediction_action.listname = res.data.map(item => item.forecastIndx)
						this.prediction_action.list = res.data.map(item => item.forecastIndxName)
						this.Get_Lattice_Point(code, this.prediction_action.listname[index])
					})
			},

			// 格点数据
			Get_Lattice_Point(code, index) {
				uni.showLoading({
					title: '叠加格点数据中',
					mask: true,
				});
				this.$http.get(
						`/Api/GridForecast/GetGridForecastData?TypeCode=${code}&ForecastIndex=${index}`, '', 1)
					.then(res => {
						if (res.data.length == 0) {
							uni.showToast({
								title: '暂无数据！',
							})

							this.original_json = []
							this.lattice_data = []
							this.geo_json = []
							return false
						}

						this.map_time.type = []
						this.legend = {
							name: this.map_action_active.name,
							unit: this.map_action_active.name == '温度' ? '℃' : 'mm',
							list: res.data.gridColor
						}
						this.legend_show = true
						let time = `${res.data.gridDataTime} ${this.map_action_active.name}格点预报`
						this.map_time.type.push(time)
						this.original_json = JSON.parse(res.data.gridData)
						setTimeout(() => {
							uni.hideLoading()
						}, 1000)
						this.GetLattice(this.original_json, res.data.gridDescription, res.data.gridColor)
					})
			},

			//格点数据解析
			GetLattice(data, code, color_data) {
				let lon = code.minLon //起始经度
				let lat = code.maxLat //起始纬度
				let xNum = code.latSpan //横向个数
				let yNum = code.lonSpan //纵向个数
				let zx = code.reso
				let zy = -code.reso
				let x_list = []

				let data1 = data

				for (let i = 0; i < yNum; i++) {
					for (let n = 0; n < xNum; n++) {
						let list = {}
						list.lon = (Number(lon) + (n * zx))
						list.lat = (Number(lat) + (i * zy))
						list.data = data1[i][n]
						x_list.push(list)
					}
				}

				this.lattice_data = x_list
				this.GetD3Geojson(code, x_list, color_data)
			},

			// d3渲染geojson
			GetD3Geojson(code, type_data, color_data) {
				let v = type_data.map((item) => {
					return item.data
				})
				let breaks = []
				let colorData = color_data
				colorData.some((lvlItem) => {
					breaks.push(lvlItem.value)
				})

				breaks = breaks.reverse()

				//breaks.push(999999);
				let mx = code.minLon //起始经度
				let my = code.maxLat //起始纬度
				let nx = code.latSpan //横向个数
				let ny = code.lonSpan //纵向个数
				let zx = code.reso
				let zy = code.reso
				let point = [mx, my]

				let transform = ({
					type,
					value,
					coordinates
				}) => {
					return {
						type,
						value,
						coordinates: coordinates.map(rings => {
							return rings.map(points => {
								return points.map(([x, y]) => ([
									parseFloat(point[0]) + zx * x,
									parseFloat(point[1]) - zy * y
								]))
							})
						})
					}
				}

				let con = contours()
					.size([nx, ny])
					.smooth(true)
					.thresholds(breaks)(v)
					.map(transform)

				let fc = new Array()

				con.forEach(function(geometry) {
					let color = colorData.filter((lvl) => {
						return Number(lvl.value) === Number(geometry.value)
					})[0].strColor

					if (geometry.coordinates.length > 0) {
						let g = turf.feature(geometry)
						g.properties = {
							"type": "色斑图",
							"fill": color,
							"fill-opacity": "0.8",
							"stroke": "#ddd",
							"stroke-opacity": "0.5",
							"stroke-width": "1"
						}
						fc.push(g)
					}
				})

				this.geo_json = []
				let geo = turf.featureCollection(fc)
				this.geo_json.push({
					...geo
				})
			},

			// 鼠标操作后
			isDo() {
				console.log('用户触摸！！');
				this.$store.commit('lastTimeUpdata', new Date().getTime())
				clearInterval(this.navTime)
				clearInterval(this.menuTime)
				clearInterval(this.tabTime)

				// console.log(this.navTime);
				// console.log(this.menuTime);
				// console.log(this.tabTime);
				timeOut()
			},

			// 循环定时器
			OpenTimeOut() {
				let index = 0
				this.navTime = setInterval(() => {
					if (index < 5) {
						index = index + 1
						if (index < 4) {
							this.Map_Action_Click(this.map_action[index], index)
						} else {
							this.Map_Prediction_Click(this.map_prediction[index - 4], index - 4)
						}
					} else {
						index = 0
						this.Map_Action_Click(this.map_action[index], index)
						clearInterval(this.navTime)
						this.OpenTimeRdar()
					}
				}, 8000)
			},

			// 打开雷达自动播放
			OpenTimeRdar() {
				this.Radar_Action_Show()
				this.Radar_Play()

				// 雷达播放完毕 播放循环定时器
				let xunhuan = setTimeout(() => {
					this.radar_action_show = !this.radar_action_show
					this.map_time.radar = []
					this.radar_data_list = []
					this.OpenTimeOut()
				}, 30000)
			},

			// 菜单播放
			OpenNavTimeOut() {
				let index1 = 0
				this.menuTime = setInterval(() => {
					if (index1 < 6) {
						index1 = index1 + 1
						this.Prec_Change(index1)
					} else {
						index1 = 0
						this.Prec_Change(index1)
					}
				}, 7000)
			},
			// 菜单播放
			OpenTabTimeOut() {
				let index2 = 0
				this.tabTime = setInterval(() => {
					if (index2 < 1) {
						index2 = index2 + 1
						this.action_nav_index = index2
					} else {
						index2 = 0
						this.action_nav_index = index2
					}
				}, 10000)
			}
		},
	}
</script>

<script module="leaflet" lang="renderjs">
	import 'leaflet/dist/leaflet.css'
	import L from 'leaflet'
	// 草皮
	import * as turf from '@turf/turf'
	// 裁剪
	import '@/static/javascript/L.clipGeojson.js'
	import('leaflet-canvas-marker-xrr2021')
	import Data from "../index/modules/data.json"
	import Data1 from "../index/modules/data_all.json"
	let tileUrl = {
		//wxt: 'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=2b099c9887b09b91afa10d392031f842',
		//wxt: "http://172.18.73.118:8001/Engine/tiles/wx/{z}/{x}/{y}.png",
		wxt: "http://t0.tianditu.gov.cn/img_c/wmts?tk=f3a8dfb080c2c250a6926904f8825c08&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
		//dzt: "http://172.18.73.118:8001/Engine/tiles/dz/{z}/{x}/{y}.png",
		dzt: "http://t0.tianditu.gov.cn/vec_c/wmts?tk=f3a8dfb080c2c250a6926904f8825c08&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
		//dxt: "http://172.18.73.118:8001/Engine/tiles/dx/{z}/{x}/{y}.png",
		dxt: "http://t0.tianditu.gov.cn/ter_c/wmts?tk=f3a8dfb080c2c250a6926904f8825c08&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
		jd: "/lib/images/voidGrid.png",
		dzt_mark: "http://t0.tianditu.gov.cn/cva_c/wmts?tk=f3a8dfb080c2c250a6926904f8825c08&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
	}
	export default {
		data() {
			return {
				GisLayerLoaded: [], //地图图层管理
				GisLayerPane: [], //地图图层对象
				GisMap: null,

				Threshold: {
					"Tem": [

					],
					"Rain1": [

					],
					"Rain3": [

					],
					"Rain6": [

					],
					"WindLv6": [

					],
					"WindLv7": [

					],
					"WindLv9": [

					]
				},
			};
		},
		components: {},
		created() {},
		mounted() {
			this.InitMap()
			this.InitMapPanel()
			this.InitTiles()
			this.InitFatherBoundary1(Data1, "市边界")
			this.InitFatherBoundary(Data, "县边界")
		},
		computed: {},
		methods: {
			// 初始化地图
			InitMap: function() {
				this.GisMap = L.map('map', {
					crs: L.CRS.EPSG3857,
					center: [26.57357, 106.72099],
					zoom: 12.5, //缩放比列
					minZoom: 3,
					maxZoom: 18,
					zoomControl: false, //禁用 + - 按钮
					doubleClickZoom: false, // 禁用双击放大
					attributionControl: false, // 移除右下角leaflet标识
					// //使用Canvas渲染 而不是SVG方式
					preferCanvas: true,
				});

				let that = this
				this.GisMap.on("zoomend", function(e) {
					var u = e.target.getZoom() // 获取当前地图缩放等级的变量
					if (u >= 10) {
						that.GisMap.getPane("网格值").style.display = "inline"
					} else {
						that.GisMap.getPane("网格值").style.display = "none"
					}
				})
			},

			// 地图瓦片
			InitTiles: function() {
				let GisImg = new Array()
				GisImg.name = "地图瓦片"
				GisImg.Layers = L.tileLayer(
					"http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
						attribution: '&copy; 高德地图',
						pane: "地图瓦片",
						maxZoom: 18,
						minZoom: 3,
						zoom: 3,
						subdomains: "1234",
					})

				this.GisLayerPane.push(GisImg)
				this.GisMap.addLayer(GisImg.Layers)
			},

			//初始化地图图层
			InitMapPanel: function() {
				this.GisLayerLoaded = [
					"预报值Popup",
					"地图要素",
					"雷达图",
					"网格值",
					"定位",
					"县名",
					"县边界",
					"市边界",
					"色斑图",
					"市名",
					"地图标注",
					"地图瓦片",
				]

				this.GisLayerLoaded.reverse().some((pane, index) => {
					if (pane === null) pane = "index" + index
					if (typeof(this.GisMap.getPane(pane)) == "undefined") {
						this.GisMap.createPane(pane)
						this.GisMap.getPane(pane).style.zIndex = index
					}
				})
			},

			// 加载边界
			AddGeoBoundary: function(geojsonData, mapLayer, option) {
				let polygon = L.geoJSON(geojsonData, {
					style: function(feature) {
						return option
					}
				})
				mapLayer.Layers.addLayer(polygon)
			},

			// 叠加父边界
			InitFatherBoundary: function(data, name) {
				let innerGeojsonData = data
				let FatherInner = new Array()
				FatherInner.name = name
				FatherInner.Layers = new L.layerGroup()
				this.AddGeoBoundary(innerGeojsonData, FatherInner, {
					color: "#434343", //线颜色
					opacity: 0.8, //线透明度
					weight: 1, //线宽
					fill: true, //需要填充内部
					fillColor: "#f94141",
					fillOpacity: 0.1,
					dashArray: '5,10',
					pane: name
				})
				this.GisLayerPane.push(FatherInner)
				this.GisMap.addLayer(FatherInner.Layers)
				this.InitMarkerName('县边界', '县名')
				//根据所有外边界定位视野区域
				// let allOutBoundary = L.geoJSON(innerGeojsonData)
				// this.GisMap.fitBounds(allOutBoundary.getBounds())
			},

			// 叠加父边界
			InitFatherBoundary1: function(data, name) {
				let innerGeojsonData = data
				let FatherInner = new Array()
				FatherInner.name = name
				FatherInner.Layers = new L.layerGroup()
				this.AddGeoBoundary(innerGeojsonData, FatherInner, {
					color: "#fff771", //线颜色
					opacity: 0, //线透明度
					weight: 1, //线宽
					fill: true, //需要填充内部
					fillColor: "#f94141",
					fillOpacity: 0,
					dashArray: '5,10',
					pane: name
				})
				this.GisLayerPane.push(FatherInner)
				this.GisMap.addLayer(FatherInner.Layers)
				//根据所有外边界定位视野区域
				// let allOutBoundary = L.geoJSON(innerGeojsonData)
				// this.GisMap.fitBounds(allOutBoundary.getBounds())
			},

			// 设置区县名字
			InitMarkerName: function(data, name) {
				let SonName = this.GetMarkerLayer(data)
				let BoundaryName = new Array()
				BoundaryName.name = name
				BoundaryName.Layers = new L.layerGroup()
				let city_name
				if (name == '县名') {
					city_name = 'county_name'
				} else {
					city_name = 'town_name'
				}
				for (var i = 0; i < SonName.length; i++) {
					// 设置多个marker
					let marker = L.marker([SonName[i].center.lat, SonName[i].center.lng], {
						pane: name,
						interactive: true, //该Marker是否可以拥有事件
						icon: L.divIcon({
							className: "city-name",
							html: `<div class="${city_name}"> ${SonName[i].name} </div>`,
						}),
					}).addTo(this.GisMap)

					BoundaryName.Layers.addLayer(marker)
				}
				this.GisLayerPane.push(BoundaryName)
				this.GisMap.addLayer(BoundaryName.Layers)
				//Map_Leaflet_Index.GisLayerLoaded.push(BoundaryName);
			},

			//获取中心点
			GetMarkerLayer: function(name) {
				let bound_center = []
				let bjLayers = this.GetLayer(name).getLayers()[0]
				//遍历边界
				let layerIndex = Object.keys(bjLayers._layers)
				for (let j = 0; j < layerIndex.length; j++) {
					let polyline = bjLayers._layers[layerIndex[j]]
					if (polyline.feature.properties.name) {
						let center = null
						let center_data = {}
						if (polyline.hasOwnProperty('_layers')) {
							center = polyline.getLayers()[0].getCenter()
						} else {
							center = polyline.getCenter()
						}

						center_data.name = polyline.feature.properties.name
						center_data.center = center

						bound_center.push(center_data)
					}
				}

				return bound_center
			},

			//获取图层
			GetLayer: function(menuName) {
				let result = null
				for (var i = 0; i < this.GisLayerPane.length; i++) {
					if (this.GisLayerPane[i] !== null && this.GisLayerPane[i].name === menuName) {
						result = this.GisLayerPane[i]
						break
					}
				}

				return result === null ? null : result.Layers
			},

			// 叠加当前定位
			InitAddress(newValue, oldValue, ownerInstance, instance) {
				if (newValue.length == 0) return false
				let data = newValue
				let AddressName = new Array()
				AddressName.name = "定位"
				AddressName.Layers = new L.layerGroup()

				var marker = L.marker([data[0].latitude, data[0].longitude], {
					pane: "定位",
					interactive: true, //该Marker是否可以拥有事件
					icon: L.divIcon({
						className: "map_address",
						html: `<div class="map_address">
							<i class="iconfont icon-weibiaoti1"></i>
						</div>`
					}),
				})

				AddressName.Layers.addLayer(marker)

				this.GisMap.addLayer(AddressName.Layers)
				this.GisLayerPane.push(AddressName)
			},

			//是否包含该图层
			HasLayer: function(menuName) {
				for (let i = 0; i < this.GisLayerPane.length; i++) {
					if (this.GisLayerPane[i].name === menuName) {
						return true
					}
				}
				return false
			},

			//移除图层
			RemoveLayer: function(layerName) {
				for (var i = 0; i < this.GisLayerPane.length; i++) {
					if (this.GisLayerPane[i].name === layerName) {
						if (this.GisLayerPane[i].Layers != undefined) {
							this.GisMap.removeLayer(this.GisLayerPane[i].Layers)
							this.GisLayerPane.splice(i, 1)
							break
						}
					}
				}
			},

			// 叠加要素数据
			InitTypeMarker(newValue, oldValue, ownerInstance, instance) {
				console.log(222);
				if (this.HasLayer("地图要素")) {
					this.RemoveLayer("地图要素")
				}
				if (this.HasLayer("网格值")) {
					this.RemoveLayer("网格值")
				}
				if (this.HasLayer("色斑图")) {
					this.RemoveLayer("色斑图")
				}
				if (newValue.length == 0) return false
				let data = newValue
				let BoundaryName = new Array()
				BoundaryName.name = "地图要素"
				BoundaryName.Layers = new L.layerGroup()

				let className = ''
				let unit = ''
				let html = ``
				switch (data[0].map_type) {
					case 8:
						className = 'map_lv'
						unit = '℃'
						break;
					case 16:
						className = 'map_lv'
						unit = 'mm'
						break;
					case 32:
						className = 'map_lv'
						unit = '%'
						break;
					case 64:
						className = 'map_lv'
						unit = 'm/s'
						break;
					default:
						break;
				}

				for (var i = 0; i < data.length; i++) {
					className = this.InitThreshold(data[i].map_type, data[i].Id)
					if (data[0].map_type == 16) {
						html = `<div class="map_station ${className}">
							<span>${data[i].RainSum}</span>
							<i>${unit}</i>
						</div>`
					} else {
						html = `<div class="map_station ${className}">
							<span>${data[i].Value}</span>
							<i>${unit}</i>
						</div>`
					}

					var marker = L.marker([data[i].Lat, data[i].Lon], {
						pane: "地图要素",
						interactive: true, //该Marker是否可以拥有事件
						icon: L.divIcon({
							className: "map_station",
							html: html
						}),
					})

					BoundaryName.Layers.addLayer(marker)
				}

				this.GisMap.addLayer(BoundaryName.Layers)
				this.GisLayerPane.push(BoundaryName)
			},

			// 接受阈值
			GetThreshold(newValue, oldValue, ownerInstance, instance) {
				if (newValue.length == 0) return false
				this.Threshold = newValue[0]
			},

			// 判断阈值
			InitThreshold(type, id) {
				let color = ''
				switch (type) {
					case 8:
						if (this.Threshold.Tem.findIndex(item => item.StationId === id) != -1) {
							color = 'map_hong'
						} else {
							color = 'map_lv'
						}
						break;
					case 16:
						if (this.Threshold.Rain1.findIndex(item => item.StationId === id) != -1) {
							color = 'map_lan'
							if (this.Threshold.Rain3.findIndex(item => item.StationId === id) != -1) {
								color = 'map_cheng'
								if (this.Threshold.Rain6.findIndex(item => item.StationId === id) != -1) {
									color = 'map_hong'
								}
							}
						} else {
							color = 'map_lv'
						}
						break;
					case 64:
						if (this.Threshold.WindLv6.findIndex(item => item.StationId === id) != -1) {
							color = 'map_lan'
							if (this.Threshold.WindLv7.findIndex(item => item.StationId === id) != -1) {
								color = 'map_cheng'
								if (this.Threshold.WindLv9.findIndex(item => item.StationId === id) != -1) {
									color = 'map_hong'
								}
							}
						} else {
							color = 'map_lv'
						}
						break;
					default:
						color = 'map_lv'
						break;
				}
				return color
			},

			// 回到默认位置
			Init_Reset(newValue, oldValue, ownerInstance, instance) {
				if (newValue.length == 0) return false
				this.GisMap.setView([newValue[0].latitude, newValue[0].longitude], 12.5)
			},

			// 叠加雷达
			InitRadar(newValue, oldValue, ownerInstance, instance) {
				if (this.HasLayer("雷达图")) {
					this.RemoveLayer("雷达图")
				}
				if (newValue.length == 0) return false
				let data = newValue
				if (data.length > 0) {
					let RadarName = new Array()
					RadarName.name = "雷达图"
					RadarName.Layers = new L.layerGroup()

					var img = L.imageOverlay(data[0].Name, [
						[data[0].StartLat, data[0].StartLon],
						[data[0].EndLat, data[0].EndLon]
					], {
						pane: "雷达图",
						opacity: 0.6
					});

					RadarName.Layers.addLayer(img);

					this.GisMap.addLayer(RadarName.Layers)
					this.GisLayerPane.push(RadarName)
				}
			},

			// 原始格点数据
			GetOriginal(newValue, oldValue, ownerInstance, instance) {
				if (newValue.length == 0) return false
				this.original_data = newValue
			},

			// 叠加网格
			GetGridOpen(newValue, oldValue, ownerInstance, instance) {
				if (this.HasLayer("网格值")) {
					this.RemoveLayer("网格值")
				}
				if (this.HasLayer("地图要素")) {
					this.RemoveLayer("地图要素")
				}

				if (newValue.length == 0) return false
				let GridName = new Array()
				GridName.name = "网格值"
				let ciLayer = L.canvasIconLayer({
					pane: "网格值"
				}).addTo(this.GisMap)
				let data = newValue
				let layers = []

				for (var i = 0; i < data.length; i++) {
					// 设置多个marker
					var iconName = L.icon({
						iconUrl: "",
						iconSize: [40, 20],
						iconAnchor: [0, 0],
						text: data[i].data.toFixed(1),
						textAnchor: [-5, -5],
						textFont: "13px '微软雅黑'", //设置字体大小和样式
						textFillStyle: "#000000", //设置字体颜色
						strokeStyle: "#fff",
					})
					var marker = L.marker([data[i].lat, data[i].lon], {
						icon: iconName,
					})

					layers.push(marker)
				}
				ciLayer.addMarkers(layers)
				GridName.Layers = ciLayer
				this.GisLayerPane.push(GridName)
				this.GisMap.setZoom(this.GisMap.getZoom() + 0.01)
			},

			// 叠加色斑图
			GetColorPattern(newValue, oldValue, ownerInstance, instance) {
				if (this.HasLayer("色斑图")) {
					this.RemoveLayer("色斑图")
				}
				if (newValue.length == 0) return false
				let geo = newValue[0]
				let clipCoords = turf.getCoords(Data1.features[0])
				let mapLayer_geo = new Array()
				mapLayer_geo.name = "色斑图"
				mapLayer_geo.Layers = new L.layerGroup()

				let geojsonInMap = L.clipGeoJSON(geo, clipCoords, {
					interactive: false,
					pane: '色斑图',
					style: function(feature) {
						return {
							stroke: true,
							weight: feature.properties["stroke-width"],
							color: feature.properties.stroke,
							opacity: feature.properties["stroke-opacity"],
							fillColor: feature.properties.fill,
							fillOpacity: feature.properties["fill-opacity"]
						}
					}
				})

				mapLayer_geo.Layers.addLayer(geojsonInMap)
				this.GisMap.addLayer(mapLayer_geo.Layers)
				this.GisLayerPane.push(mapLayer_geo)
			}
		}
	};
</script>

<style scoped>
	@import url('@/static/css/index.css');
</style>