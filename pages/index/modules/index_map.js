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

const Map_Leaflet = {
	GisLayerLoaded: [], //地图图层管理
	GisLayerPane: [], //地图图层对象
	GisMap: null,

	// 创建地图
	InitMap(map) {
		Map_Leaflet.GisMap = null
		Map_Leaflet.GisMap = L.map(map, {
			crs: L.CRS.EPSG3857,
			center: [25.77, 106.67],
			zoom: 10, //缩放比列
			minZoom: 1,
			maxZoom: 18,
			zoomControl: false, //禁用 + - 按钮
			doubleClickZoom: false, // 禁用双击放大
			attributionControl: false, // 移除右下角leaflet标识
			// //使用Canvas渲染 而不是SVG方式
			preferCanvas: true,
			dragging: true
		})

		Map_Leaflet.GisMap.on('click', function(e) {
			alert(e.latlng);
		});
	},

	//初始化地图图层
	InitMapPanel: function() {
		Map_Leaflet.GisLayerLoaded = [
			"县名",
			"县边界",
			"市名",
			"地图瓦片标注",
			"地图瓦片",
		]

		Map_Leaflet.GisLayerLoaded.reverse().some((pane, index) => {
			if (pane === null) pane = "index" + index
			if (typeof(Map_Leaflet.GisMap.getPane(pane)) == "undefined") {
				Map_Leaflet.GisMap.createPane(pane)
				Map_Leaflet.GisMap.getPane(pane).style.zIndex = index
			}
		})
	},


	// 地图瓦片数据叠加
	InitTiles: function() {
		let GisImg = new Array()
		GisImg.name = "地图瓦片"
		GisImg.Layers = L.tileLayer(tileUrl.dzt, {
			pane: "地图瓦片",
			// zoomOffset: 1,
		})
		Map_Leaflet.GisLayerPane.push(GisImg)
		Map_Leaflet.GisMap.addLayer(GisImg.Layers)
	},

	// 地图瓦片数据叠加
	// InitTilesMark: function() {
	// 	let GisImg = new Array()
	// 	GisImg.name = "地图瓦片标注"
	// 	GisImg.Layers = L.tileLayer(tileUrl.dzt_mark, {
	// 		pane: "地图瓦片标注",
	// 		zoomOffset: 1,
	// 	})
	// 	Map_Leaflet.GisLayerPane.push(GisImg)
	// 	Map_Leaflet.GisMap.addLayer(GisImg.Layers)
	// },

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
		Map_Leaflet.AddGeoBoundary(innerGeojsonData, FatherInner, {
			color: "#fff771", //线颜色
			opacity: 1, //线透明度
			weight: 1, //线宽
			fill: true, //需要填充内部
			fillColor: "#3269e7",
			fillOpacity: 1,
			dashArray: '5,10',
			pane: name
		})
		Map_Leaflet.GisLayerPane.push(FatherInner)
		Map_Leaflet.GisMap.addLayer(FatherInner.Layers)

		//根据所有外边界定位视野区域
		let allOutBoundary = L.geoJSON(innerGeojsonData)
		// console.log(allOutBoundary)
		Map_Leaflet.GisMap.fitBounds(allOutBoundary.getBounds())
		// var center = Map_Leaflet.GetMarkerLayer(name)[0].center
		// Map_Leaflet.GisMap.setView([center.lat - 0.1, center.lng - 0.2], 9)
	},

	// 父边界阴影边界
	Init_outArea_Boundary: function(data, name) {
		let innerGeojsonData = data
		let OutFatherInner = new Array()
		OutFatherInner.name = name
		OutFatherInner.Layers = new L.layerGroup()
		// let translatedOuterGeojsonData = $turf.transformTranslate(innerGeojsonData, -10, 300, { mutate: true })
		Map_Leaflet.AddGeoBoundary(innerGeojsonData, OutFatherInner, {
			color: "#180f58", //线颜色
			opacity: 1, //线透明度
			weight: 10, //线宽
			fill: true, //不需要填充内部
			fillColor: "#180f58",
			fillOpacity: 0.8,
			pane: name
		})

		Map_Leaflet.GisLayerPane.push(OutFatherInner)
		Map_Leaflet.GisMap.addLayer(OutFatherInner.Layers)
	},

	// 叠加子边界
	InitSonBoundary: function(data, name) {
		let innerGeojsonData = data
		let SonInner = new Array()
		SonInner.name = name
		SonInner.Layers = new L.layerGroup()
		Map_Leaflet.AddGeoBoundary(innerGeojsonData, SonInner, {
			color: "#180f58", //线颜色
			opacity: 0.5, //线透明度
			weight: 1, //线宽
			fill: false, //不需要填充内部
			fillColor: "#3269e7",
			fillOpacity: 1,
			pane: name
		})
		Map_Leaflet.GisLayerPane.push(SonInner)
		Map_Leaflet.GisMap.addLayer(SonInner.Layers)
	},

	// 设置区县名字
	InitMarkerName: function(F_name, name) {
		let SonName = Map_Leaflet.GetMarkerLayer(F_name)
		let BoundaryName = new Array()
		BoundaryName.name = name
		BoundaryName.Layers = new L.layerGroup()
		for (var i = 0; i < SonName.length; i++) {
			// 设置多个marker
			let marker = L.marker([SonName[i].center.lat, SonName[i].center.lng], {
				pane: name,
				interactive: true, //该Marker是否可以拥有事件
				icon: L.divIcon({
					className: 'city-name',
					html: '<div class="town_name">' + SonName[i].name + '</div>'
				})
			}).addTo(Map_Leaflet.GisMap)

			BoundaryName.Layers.addLayer(marker)

		}
		Map_Leaflet.GisMap.addLayer(BoundaryName.Layers)
		Map_Leaflet.GisLayerPane.push(BoundaryName)
	},

	// 工区叠加
	InitRailwayMarker: function(data) {
		let BoundaryName = new Array()
		BoundaryName.name = "工区"
		BoundaryName.Layers = new L.layerGroup()
		for (var i = 0; i < data.length; i++) {
			// 设置多个marker
			let icon = 'icon-shigong'
			var marker = L.marker([data[i].Lat, data[i].Lon], {
				pane: "工区",
				interactive: true, //该Marker是否可以拥有事件
				icon: L.divIcon({
					className: "railway-name",
					html: `<div class="railway_name_div"><i class="iconfont ${icon}"></i></div>`
				}),
			})



			let dataList = data[i]
			marker.on("click", e => {
				var content = `<div class="map_del_popup" style="width:300px">
                                    <div class="map_del_title">
                                        <i class="iconfont ${icon}"></i>
                                        <span title="${dataList.ShigongaArea}">${dataList.ShigongaArea}</span>
                                    </div>
                                    <div class="map_del_nr">
                                        <span>标段：${dataList.Biaoduan}</span>
                                        <span>单位：${dataList.ShigongUnit}</span>
                                        <span>海拔:${dataList.Height == null ? "暂无" : dataList.Height}</span>
                                    </div>
                                </div>`
				var popup = new L.popup({
					pane: "工区Popup",
				})
				popup.setLatLng(e.latlng)
				popup.setContent(content)
				popup.addTo(Map_Leaflet.GisMap)
			})

			BoundaryName.Layers.addLayer(marker)
		}

		Map_Leaflet.GisMap.addLayer(BoundaryName.Layers)
		Map_Leaflet.GisLayerPane.push(BoundaryName)
	},

	// 地灾点叠加
	InitDisasterMarker: function(data) {
		Map_Leaflet.RemoveLayer('地灾点')
		let BoundaryName = new Array()
		BoundaryName.name = "地灾点"
		let ciLayer = L.canvasIconLayer({
			pane: '地灾点'
		}).addTo(Map_Leaflet.GisMap)
		let layers = []
		for (var i = 0; i < data.length; i++) {
			// 设置多个marker
			var iconName = L.icon({
				iconUrl: "../images/Map/6.png",
				iconSize: [13, 13],
				iconAnchor: [6.5, 6.5],
				text: '',
				textAnchor: [0, 0],
				textFont: "bold 14px '微软雅黑'", //设置字体大小和样式
				textFillStyle: "#000000", //设置字体颜色
				strokeStyle: "#444444",
			})
			var marker = L.marker([data[i].Lat, data[i].Lon], {
				icon: iconName,
			}).bindPopup(`<div class="map_del_popup">
                                    <div class="map_del_title">
                                        <span>${data[i].Name}</span>
                                    </div>
                                    <div class="map_del_nr">
                                        <span>经度：${data[i].Lon}</span>
                                        <span>纬度：${data[i].Lat}</span>
                                    </div>
                                </div>`)

			layers.push(marker)


		}
		ciLayer.addMarkers(layers)
		// 适配地图中心
		console.log(ciLayer);
		var center = Map_Leaflet.GetMarkerLayer("铁路区域")[0].center
		Map_Leaflet.GisMap.setView([center.lat - 0.05, center.lng - 0.05])

		BoundaryName.Layers = ciLayer
		Map_Leaflet.GisLayerPane.push(BoundaryName)
	},

	// 色斑图
	GetColorPattern(geo, kml) {
		if (Map_Leaflet.HasLayer("色斑图")) {
			Map_Leaflet.RemoveLayer("色斑图")
		}

		let clipCoords = $turf.getCoords(kml.features[0])
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

		Map_Leaflet.GisLayerPane.push(mapLayer_geo)
		Map_Leaflet.GisMap.addLayer(mapLayer_geo.Layers)
	},

	// 叠加网格
	GetGridOpen(lattice_data, unit) {
		if (Map_Leaflet.HasLayer("网格值")) {
			Map_Leaflet.RemoveLayer("网格值")
		}
		let GridName = new Array()
		GridName.name = "网格值"
		let ciLayer = L.canvasIconLayer({
			pane: "网格值"
		}).addTo(Map_Leaflet.GisMap)
		let data = lattice_data.analysis_json
		let layers = []
		for (var i = 0; i < data.length; i++) {
			// 设置多个marker
			var iconName = L.icon({
				iconUrl: "",
				iconSize: [40, 20],
				iconAnchor: [0, 0],
				text: "",
				textAnchor: [-5, -5],
				textFont: "bold 14px '微软雅黑'", //设置字体大小和样式
				textFillStyle: "#000000", //设置字体颜色
				strokeStyle: "#444444",
			})
			var marker = L.marker([data[i].lat, data[i].lon], {
				icon: iconName,
			})
			layers.push(marker)
		}

		ciLayer.addMarkers(layers)
		// 适配地图中心和层级
		var center = Map_Leaflet.GetMarkerLayer("铁路区域")[0].center
		Map_Leaflet.GisMap.setView([center.lat, center.lng - 0.3], 9.2)

		GridName.Layers = ciLayer
		Map_Leaflet.GisLayerPane.push(GridName)

		// mousemove显示格点值
		let org_data = lattice_data.original_json
		Map_Leaflet.GisMap.on("mousemove", function(e) {
			var lat_lng = e.latlng
			const MinLat = org_data.StartLat
			const MaxLat = org_data.StartLat + (org_data.YNum * org_data.YReso)
			const MinLon = org_data.StartLon
			const MaxLon = org_data.StartLon + ((org_data.XNum - 1) * org_data.XReso)

			if (
				lat_lng.lat < MaxLat &&
				lat_lng.lat > MinLat &&
				lat_lng.lng < MaxLon &&
				lat_lng.lng > MinLon
			) {
				var y1 = Math.floor((lat_lng.lng - MinLon) / 0.05)
				var x1 = Math.floor((lat_lng.lat - MinLat) / 0.05)


				var v1 = (lat_lng.lng - y1 * 0.05 - MinLon) / 0.05
				var v2 = (lat_lng.lat - x1 * 0.05 - MinLat) / 0.05

				var val = (
					(1 - v2) * (1 - v1) * org_data.FData[x1][y1] +
					(1 - v1) * v2 * org_data.FData[x1 + 1][y1] +
					(1 - v2) * v1 * org_data.FData[x1][y1 + 1] +
					v1 * v2 * org_data.FData[x1 + 1][y1 + 1]
				).toFixed(2)

				var content = `<div class="map_popup">
                                    <div class="map_popup_nr">
                                        <span class="">${val}</span>
                                        <i>${unit}</i>
                                    </div>    
                                </div>`
				var popup = new L.popup({
					pane: "预报值Popup",
				})
				popup.setLatLng(lat_lng)
				popup.setContent(content)
				popup.openOn(Map_Leaflet.GisMap)
			}
		})
	},

	//是否包含该图层
	HasLayer: function(menuName) {
		for (let i = 0; i < Map_Leaflet.GisLayerPane.length; i++) {
			if (Map_Leaflet.GisLayerPane[i].name === menuName) {
				return true
			}
		}
		return false
	},

	//移除图层
	RemoveLayer: function(layerName) {
		for (var i = 0; i < Map_Leaflet.GisLayerPane.length; i++) {
			if (Map_Leaflet.GisLayerPane[i].name === layerName) {
				if (Map_Leaflet.GisLayerPane[i].Layers != undefined) {
					Map_Leaflet.GisMap.removeLayer(Map_Leaflet.GisLayerPane[i].Layers)
					Map_Leaflet.GisLayerPane.splice(i, 1)
					break
				}
			}
		}
	},

	//移除图层
	OperateLayer: function(layerName, code) {
		if (code) {
			document.getElementsByClassName(`leaflet-${layerName}-pane`)[0].style.display = 'block'
		} else {
			document.getElementsByClassName(`leaflet-${layerName}-pane`)[0].style.display = 'none'
		}
	},

	// 清除所有图层
	RemoveAllLayer: function() {
		Map_Leaflet.GisLayerPane.map(item => {
			Map_Leaflet.GisMap.removeLayer(item.Layers)
		})
		Map_Leaflet.GisLayerPane = []
	},

	//获取图层
	GetLayer: function(menuName) {
		let result = null
		for (var i = 0; i < Map_Leaflet.GisLayerPane.length; i++) {
			if (Map_Leaflet.GisLayerPane[i] !== null && Map_Leaflet.GisLayerPane[i].name === menuName) {
				result = Map_Leaflet.GisLayerPane[i]
				break
			}
		}

		return result === null ? null : result.Layers
	},

	//获取中心点
	GetMarkerLayer: function(name) {
		let bound_center = []
		let bjLayers = Map_Leaflet.GetLayer(name).getLayers()[0]
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

	// 地图图层hover效果 
	AddLayerHover: function(panName) {

		let bjLayers = Map_Leaflet.GetLayer(panName, Map_Leaflet.GisLayerLoaded).getLayers()[0]

		//遍历边界
		let layerIndex = Object.keys(bjLayers._layers)
		for (let j = 0; j < layerIndex.length; j++) {
			let polyline = bjLayers._layers[layerIndex[j]]

			if (polyline.feature.properties.name) {
				let center = null
				if (polyline.hasOwnProperty('_layers')) {
					center = polyline.getLayers()[0].getCenter()
				} else {
					center = polyline.getCenter()
				}


				polyline.on('mouseover', function() {
					this.setStyle({
						fillColor: '#1cc5da'
					})
				})
				polyline.on('mouseout', function() {
					this.setStyle({
						fillColor: '#3269e7'
					})
				})
			}
		}
	}
}


// 导出该组件
export default Map_Leaflet
