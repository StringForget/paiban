<template>
	<div class="header">
		<el-form :inline="true" class="form-inline" style="margin-bottom: 5px;">
			<el-form-item>
				<el-menu mode="horizontal" class="menu" index="1" @select="handleSelect">
					<el-submenu index="1-1">
						<template slot="title">{{menu[$route.path]}}</template>
						<el-menu-item v-for="title,path in menu" :key="path" :index="path">{{title}}</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-form-item>
			<el-form-item>
				<el-date-picker
					:readonly="readOnly"
					size="mini"
					v-model="date_"
					type="daterange"
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					style="width: 230px;"
					>
				</el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button-group>
					<el-button @click="changeYM(-1)" size="mini" type="primary" icon="el-icon-arrow-left" title="上个月"></el-button>
					<el-button @click="changeYM(1)" size="mini" type="primary" icon="el-icon-arrow-right" title="下个月"></el-button>
				</el-button-group>
			</el-form-item>
			<slot></slot>
			<el-form-item style="float: right; padding: 0 20px;">
				<el-button size="mini" type="danger" @click="outLogin()"><i class="el-icon-circle-close"></i>退出登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
export default {
	name: "heard",
	data() {
		return {
			menu:{'/':'首页','/count':'统计页','/application':'组员信息/排班管理'},
			date_:[],
		};
	},
	props:{
		readOnly:{
			type:Boolean,
			default:false,
		}
	},
	async created() {
		// if((await this.$getUser()).isAdmin){//管理员专属菜单
		// 	this.menu['/code'] = '班次维护';
		// }
		let nowYM = {y:new Date().getFullYear(),m:new Date().getMonth()+1};
		this.date_ = [new Date(`${nowYM.y}/${nowYM.m}/1`),new Date(`${nowYM.y}/${nowYM.m}/${new Date(nowYM.y, nowYM.m, 0).getDate()}`)];
	},
	watch:{
		date_(n){
			this.$emit("setDate", n);
		}
	},
	methods: {
		async outLogin() {//退出登录
			let load = this.$loading();
			await this.$auth.signOut();
			load.close();
			this.$router.push('/login');
		},
		changeYM(mode){//改变年月
			let nowYM = {y:this.date_[0].getFullYear(),m:this.date_[0].getMonth()+1};
			let days = new Date(nowYM.y, nowYM.m, 0);
			days = days.getDate(); //获取当前日期中月的天数
			let now = new Date(`${nowYM.y}/${nowYM.m}/${mode==1?days:1}`);
			now.setDate(now.getDate() + mode);
			nowYM = {y:now.getFullYear(),m:now.getMonth()+1};
			this.date_ = [new Date(`${nowYM.y}/${nowYM.m}/1`),new Date(`${nowYM.y}/${nowYM.m}/${new Date(nowYM.y, nowYM.m, 0).getDate()}`)];
		},
		handleSelect(key){
			this.$router.history.current.path!=key && this.$router.push(key);
		}
	},
};
</script>

<style>
	.header{position: fixed;left: 5px;width: 100%;background: #fff;z-index: 10;}
	.menu.el-menu--horizontal>.el-submenu .el-submenu__title {height: 40px;line-height: 40px;}
</style>
