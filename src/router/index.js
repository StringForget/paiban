import Vue from 'vue'
import Router from 'vue-router'

import Pb from '@/pages/pb.vue'
import Count from '@/pages/count.vue'
import Login from '@/pages/login.vue'
import Application from '@/pages/application.vue'

Vue.use(Router);

export default new Router({
	beforeEach(to, from, next){
		console.log(to, from, next)
	},
  routes: [
		{ path: '/login', component: Login ,meta:{title:'排班管理登录'}},
		{ path: '/count', component: Count ,meta:{title:'排班情况统计'}},
		{ path: '/application', component: Application ,meta:{title:'组员信息管理'}},
		{ path: '/', component: Pb ,meta:{title:'排班管理系统'}}//根路径重定向
	]
})