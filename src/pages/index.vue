<template>
	<el-container>
	  <el-aside width="150px">
			<el-menu style="height: 100vh;" :router="true" :default-active="$router.currentRoute.path">
				<div><h4 style="text-align: center;margin-bottom: 0;">员工信息管理系统</h4></div>
				<el-menu mode="horizontal">
				  <el-submenu style="width: 100%;text-align: center;" index="-1">
						<template slot="title">{{power.spm||'管理员'}}</template>
						<el-menu-item @click="outLogin()" index="-1">退出登录</el-menu-item>
					</el-submenu>
				</el-menu>
				<el-menu-item v-for="menu in menus" :key="menu.path" :index="menu.path">
					<i :class="menu.icon"></i>
					<span slot="title">{{menu.name}}</span>
				</el-menu-item>
			</el-menu>
		</el-aside>
	  <el-main style="height: 100vh;padding: 0px 5px;">
			<router-view/>
		</el-main>
	</el-container>
</template>

<script>
	export default {
		name: 'index',
		data () {
			return {
				menus:[
					{path:'/application',name:'组员管理',icon:'el-icon-user-solid'},
					{path:'/pb',name:'班次信息',icon:'el-icon-date'},
					{path:'/count',name:'排班统计',icon:'el-icon-s-order'}
				],
				power:{}
			}
		},
		async created(){
			this.power = await this.$getUser();
			if(this.power.isSAdmin){//超级管理员专属菜单
				this.menus.push({path:'/countAndon',name:'工单指标',icon:'el-icon-s-marketing'});
			}
		},
		methods:{
			async outLogin() {//退出登录
				let load = this.$loading();
				await this.$auth.signOut();
				load.close();
				this.$router.push('/login');
			}
		}
	}
</script>

<style>
	body{
		width: 100%;
		overflow-x: hidden;
	}
</style>
