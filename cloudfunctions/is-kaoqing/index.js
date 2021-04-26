const cloud = require("@cloudbase/node-sdk");
const app = cloud.init({
	env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const auth = app.auth();

exports.main = async (event, context) => {
	const {uid,customUserId} = auth.getUserInfo();
	console.log(uid,customUserId);
	let {data} = await db.collection('tcb-ext-cms-users').where({
		uuid:uid,
		roles: _.in(['administrator', '79550af2601be08f02993ade4b523ea3'])
	}).get();
	
	let user = await db.collection('tcb-ext-cms-users').where({
		userid:uid
	}).get();
	let spm = user.data[0]?user.data[0].name:'';
	return {
		isAdmin:(data.length > 0),
		spm
	};
};
