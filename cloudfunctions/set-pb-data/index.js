'use strict';
const tcb = require('@cloudbase/node-sdk');//引用SDK
const app = tcb.init({env: 'env-capibjba'});//初始化
const db = app.database();//获取数据库对象
let _ = db.command;
exports.main = async (event, context) => {
	if(event.body) event = JSON.parse(event.body);
	let promiseArr = [];
	for(let id in event.userData){
		promiseArr.push(
			db.collection('cms-gyy-user').doc(id).update({
				pbData:event.userData[id],
				updateTime:new Date()
			})
		);
	}
	await Promise.all(promiseArr);
	return {msg:'成功'};
};
