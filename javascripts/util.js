/*
	author: alex2wong 
	utils for dom operating
*/

var utils = {}

$ = function(ele){
	return document.querySelector(ele);
}

gall = function(ele){
	return document.querySelectorAll(ele);
}

utils.events = {
	// 事件绑定兼容
	addEvent: function(ele,evt,handler){
		if (ele.addEventListener){
			ele.addEventListener(evt,handler,false);
		} else if (ele.attachEvent){
			ele.attachEvent("on" + evt, handler);
		} else {
			ele["on" + evt] = handler;
		}
	}
}

utils.regs = {
	// 正则表达
	split: function(){
		// 通用的分割函数
		var inputArray = str.trim().split(/[,，;； /s]/);
		return inputArray;
	}
}
