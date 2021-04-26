import Vue from 'vue'
import cloudbase from '@cloudbase/js-sdk'
import App from './App'
import router from './router'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

const tcb = cloudbase.init({env:'env-capibjba'});
Vue.prototype.$tcb = tcb;
const auth = tcb.auth({persistence:'local'});
Vue.prototype.$auth = auth;
Vue.config.productionTip = false;

Date.prototype.format = function dateFormat(fmt = 'YYYY-MM-DD') {
	let ret,date = this;
	const opt = {
		"Y+": date.getFullYear().toString(),        // 年
		"M+": (date.getMonth() + 1).toString(),     // 月
		"D+": date.getDate().toString(),            // 日
		"h+": date.getHours().toString(),           // 时
		"m+": date.getMinutes().toString(),         // 分
		"s+": date.getSeconds().toString()          // 秒
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
				fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
		}
	}
	return fmt;
}

let admin;
const getUser = async function(){
	if(admin) return admin;
	const loginState = await auth.getLoginState();
	if(loginState){
		let {result} = await this.$tcb.callFunction({name:'is-kaoqing'});
		result.user = loginState;
		admin = result;
		return result;
	}
	return {};
}

Vue.prototype.$getUser = getUser;
router.beforeEach(async function(to,form,next){
	if(to.meta.title) document.title = to.meta.title;
	
	const loginState = await auth.getLoginState();
	if(to.path != '/login' && !loginState){//不是登录页且未登录
		next({path:'/login'});
	}else if(to.path == '/login' && loginState){//是登录页但是登录了
		next({path:'/'});
	}else{
		next();
	}
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
