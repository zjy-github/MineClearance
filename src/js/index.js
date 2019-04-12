/* 
	初级：9*9 10
	中级：16*16 40
	高级： 16*30  99
	
	点击开始游戏  => 获取游戏数据生成游戏界面
	leftClick  没有雷 => 显示数字（代表当前小格为中心周围8个小格的雷数）
						扩散（当雷数为0时向周围扩散）
				有雷 => game over
	rightClick  没有标记并且没有数字 => 进行标记
				有标记 =>取消标记
				已有数字 => 无效果
 */

var oStart = document.getElementsByClassName('start')[0];
var oSelect = document.getElementsByTagName('select')[0];
var oSet = document.getElementsByClassName('set');
var oBox = document.getElementById('box');
var oResult = document.getElementById('result');
var oClose = document.getElementsByClassName('close')[0];
var oMines = document.getElementsByClassName('mines')[0];
var row,//行数
	col,//列数
	leiNum,//雷数
	mineMap = [],//记录每个格的是否有雷
	surp,//剩余格数
	stratGameBool = true,//开始游戏锁
	viewFlag = false;//游戏结束，界面锁

//初始化函数
function init(){
	bindEvent();
}

//事件处理函数汇总
function bindEvent() {
	//开启自定义设置
	oSelect.onchange = function() {
		if(this.value == 4) {
			for(var i = 0; i < oSet.length; i++){
				oSet[i].removeAttribute('disabled')
			}
		}
	}
	//开始按钮
	oStart.onclick = function() {
		if(stratGameBool){
			switch (oSelect.value){
				case '1':
					row = col = 9;
					leiNum = 10;
					break;
				case '2':
					row = col = 16;
					leiNum = 40;
					break;
				case '3':
					row = 16;
					col = 30;
					leiNum = 99;
					break;
				case '4':
					row = oSet[0].value;
					col = oSet[1].value;
					leiNum = oSet[2].value;
					break;
			}
			createGame(row, col, leiNum);
			document.getElementsByTagName('select')[0].setAttribute('disabled','false');
			stratGameBool = false;
		}
		
	}
	
	//取消游戏区域右键默认函数
	oBox.oncontextmenu = function() {
		return false;
	}
	
	//判断鼠标左右键点击
	oBox.onmousedown = function(e) {
		var event = e.target;
		if(e.which == 1){
			leftClick(event)
		}else if(e.which == 3){
			rightClick(event)
		}
	}
	
	//关闭结果页面
	oClose.onclick = function() {
		oResult.style.display = 'none';
		oBox.innerHTML = '';
		stratGameBool = true;
		oMines.innerHTML = 0;
		viewFlag = false;;
		document.getElementsByTagName('select')[0].removeAttribute('disabled');
	}
}

//创建游戏界面
function createGame(row, col, minesNum) {
	oBox.innerHTML = '';
	oMines.innerHTML = minesNum;
	surp = row * col;
	if(row < 9 || row > 24 || col < 9 || col > 30 || minesNum < 10 || minesNum > 668){
		confirm("输入超范围请重新输入");
		return;
	}
	var width = row > 16? 20 : 25;
	oBox.style.width = col * width + 'px';
	oBox.style.height = row * width + 'px';
	oBox.style.top = 'calc(50% - ' + row * width / 2 + 'px)';
	for (var i = 0; i < row ; i++) {
		for (var j = 0; j < col; j++) {
			var oDiv = document.createElement('div');
			oDiv.classList.add('block');
			oDiv.style.width = width + 'px';
			oDiv.style.height = width + 'px';
			oDiv.setAttribute('id', i + '-' + j);
			oBox.appendChild(oDiv)
			mineMap.push({mine:0});
		}
	}
	
	var block = document.getElementsByClassName('block');
	while(minesNum){
		var mineIndex = Math.floor(Math.random() * row * col);
		if(mineMap[mineIndex].mine == 0){
			block[mineIndex].classList.add('isLei');
			mineMap[mineIndex].mine = 1;
			minesNum--;
		}
	}
}

//右键点击事件
function leftClick(dom) {
	if(dom.classList.contains('flag') || dom.classList.contains('num') || viewFlag){
		return;
	}
	//点到雷
	if(dom && dom.classList.contains('isLei')) {
		var isLei = document.getElementsByClassName('isLei');
		var flag = document.getElementsByClassName('flag');
		for(var i = 0; i < isLei.length; i++){
			if(!isLei[i].classList.contains('flag')){
				isLei[i].classList.add('bomb');
			}
		}
		for(var i = 0; i < flag.length; i++){
			if(!flag[i].classList.contains('isLei')){
				flag[i].classList.add('bomb-w');
			}
		}
		showResult('fail');
	}else{
		var n = 0;
		var posArr = dom && dom.getAttribute('id').split('-');
		var posX = posArr && +posArr[0];
		var posY = posArr && +posArr[1];
		dom && dom.classList.add('num');
		for(var i = posX - 1; i <= posX + 1; i++){
			for(var j = posY - 1; j <= posY + 1; j++){
				var aroundBox = document.getElementById(i + '-' + j);
				if(aroundBox && aroundBox.classList.contains('isLei')) {
					n++;
				}
			}
		}
		if(dom){
			dom.innerHTML = n == 0 ? '' : n;
			dom.style.background = '#fff';
			dom.style.lineHeight = dom.style.height;
		}
		if(n == 0){
			for(var i = posX - 1; i <= posX + 1; i++){
				for(var j = posY - 1; j <= posY + 1; j++){
					var nearBox = document.getElementById(i + '-' + j);
					if(nearBox && nearBox.length != 0){
						if(!nearBox.classList.contains('num')){
							leftClick(nearBox);
						}
					}
				}
			}
		}
		judgeGame();
	}
}

//右键点击事件
function rightClick(dom) {
	if(dom.classList.contains('num') || viewFlag){
		return;
	}
	dom.classList.toggle('flag');
	if(dom.classList.contains('flag')){
		oMines.innerHTML--;
	}else{
		oMines.innerHTML++;
	}
	judgeGame();
}

//判断游戏是否结束
function judgeGame(){
	var oNum = document.getElementsByClassName('num');
	var oFlag = document.getElementsByClassName('flag');
	console.log(oNum);
	var currectNum = 0;
	surp = row * col - oNum.length;
	if(surp == leiNum){
		showResult('success');
	}
	if(oFlag && oFlag.length == leiNum) {
		for(var i = 0; i < oFlag.length; i++) {
			if(oFlag[i].classList.contains('isLei')) {
				currectNum++;
			}
		}
		if(currectNum == leiNum){
			showResult('success');
		}
	}
}

//显示结束界面
function showResult(result) {
	viewFlag = true;
	setTimeout(function(){
		oResult.style.display = 'block';
		oResult.style.background = 'url(./src/img/' + result + '.jpg)';
		oResult.style.backgroundSize = '100% 100%'; 
	},800)
}

init();