'use strict';
const tcb = require('@cloudbase/node-sdk');//引用SDK
const app = tcb.init({env: 'env-capibjba'});//初始化
const db = app.database();//获取数据库对象
let _ = db.command;
Date.prototype.format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份
			"d+": this.getDate() //日
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (let k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
		return fmt;
	}
exports.main = async (event, context) => {
    if(event.body) event = JSON.parse(event.body);
    else if(event.queryStringParameters) event = event.queryStringParameters;
    console.log(event)
    let param = _.or([//要么在职,要么离职日期是当前年月
        {isJob:true},
        {outDate:new RegExp(new Date().format('yyyy-MM')+'.*')}
    ]);
    let {data} = await db.collection('cms-gyy-user').where(event.param||param).limit(100).orderBy("isJob", "desc").orderBy("isAdon", "desc").get();
    let code = await db.collection('cms-gyy-pbcode').limit(100).get();
    let result = {user:data,code:{}};
    for(let d of code.data){
        for(let c of d.code){
            result.code[c] = d.name;
        }
    }
    return result
};
