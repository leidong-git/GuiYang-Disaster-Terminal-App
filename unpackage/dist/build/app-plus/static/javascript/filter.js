//格点数据解析
const GetLattice = function(data, code, color_data) {
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
	/*
	for (let i = yNum-1; i >= 0; i--) {
	    for (let n = 0; n < xNum; n++) {
	        let list = {}
	        list.lon = (Number(lon) + (n * zx))
	        list.lat = (Number(lat) + (n * zy))
	        list.data = data1[i][n]
	        x_list.push(list)
	    }
	} 
	*/

	let geojson = GetD3Geojson(code, x_list, color_data)
	let geo_data = {
		analysis_json: x_list,
		geo_json: geojson
	}
	return geo_data
}

// d3渲染geojson
const GetD3Geojson = function(code, type_data, color_data) {
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
						parseFloat(point[1]) + zy * y
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
			let g = $turf.feature(geometry)
			g.properties = {
				"type": "色斑图",
				"fill": color,
				"fill-opacity": "1",
				"stroke": "#ddd",
				"stroke-opacity": "0.5",
				"stroke-width": "1"
			}
			fc.push(g)
		}
	})

	let geo = $turf.featureCollection(fc)
	return geo
}

// 地图时间筛选
const ScreenTime = function(time, value, TimeIndex, index) {
	let nowDate = new Date(time).getTime()
	var date = new Date(nowDate + (parseInt(TimeIndex) * index * 3600 * 1000))
	var date1 = new Date(nowDate + (parseInt(TimeIndex) * 3600 * 1000) + (parseInt(TimeIndex) * index * 3600 *
		1000))
	let prev_date = DateFormat(date, 'yyyy-MM-dd HH:mm:ss')
	let next_date = DateFormat(date1, 'yyyy-MM-dd HH:mm:ss')
	return prev_date + ' 至 ' + next_date + ' ' + value
}


export default {
	GetLattice,
	GetD3Geojson,
	ScreenTime,
}