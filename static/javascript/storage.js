	// 写入
	function changeData(path, writeData) { //参数1：上传路径，参数2：seek方法可设置文件操作指定位置，参数3：写入的json数据
		return new Promise(resolve => {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
				fs.root.getFile(path, {
						create: true
					}, fileEntry => {
						fileEntry.file(file => {
							fileEntry.createWriter(writer => {
									writer.write(JSON.stringify(writeData)); // 整个文件重写
									writer.onerror = function() {
										plus.nativeUI.closeWaiting();
										return;
									};
									writer.onsuccess = function() { //填写文件成功
										plus.nativeUI.closeWaiting();
										resolve("1");
									};
								},
								error => {
									console.log("3创建creactWriter失败", error);
									return;
								});
						});
					},
					error => {
						console.log("2获取文件失败", error);
						return;
					}
				);
			}, e => {
				//console.log("1请求文件系统失败", e.message);
				plus.nativeUI.toast("请求系统失败,请重新操作", {
					background: "#ffa38c",
				});
				return;
			});
		});
	};

	// 读取
	function getJsonData(path) { //path:路径
		return new Promise(resolve => {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => { //请求文件系统
					fs.root.getFile(
						path, {
							create: true //当文件不存在时创建
						}, fileEntry => {
							fileEntry.file(function(file) {
								let fileReader = new plus.io
									.FileReader(); //new一个可以用来读取文件的对象fileReader
								fileReader.readAsText(file, "utf-8"); //读文件的格式
								fileReader.onerror = e => { //读文件失败
									// console.log("获取文件失败", fileReader.error);
									return;
								};
								fileReader.onload = e => { //读文件成功
									let txtData = e.target.result;
									resolve(txtData);
									// 回调函数内的值想返回到函数外部  就用promise+resolve来返回出去
								};
							});
						}, error => {
							console.log("2新建获取文件失败", error);
							return;
						});
				},
				e => {
					console.log("1请求文件系统失败", e.message);
					return;
				}
			);
		});
	}

	export {
		getJsonData,
		changeData
	}