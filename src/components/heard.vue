<template>
	<div class="header">
		<el-form :inline="true" class="form-inline no-margin" size="mini" style="padding: 5px 0;">
			<el-form-item>
				<el-date-picker :type="isMonth?'monthrange':'daterange'" :readonly="readOnly" v-model="date_" :picker-options="isMonth?pickerOptions:''" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 230px;" > </el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button-group>
					<el-button @click="changeYM(-1)" type="primary" icon="el-icon-arrow-left" title="上个月"></el-button>
					<el-button @click="changeYM(1)" type="primary" icon="el-icon-arrow-right" title="下个月"></el-button>
				</el-button-group>
			</el-form-item>
			<slot></slot>
			<!-- <el-form-item style="float: right; padding: 0 20px;">
				<el-button type="danger" ><i class="el-icon-circle-close"></i>退出登录</el-button>
			</el-form-item> -->
		</el-form>
	</div>
</template>

<script>
export default {
	name: "heard",
	data() {
		return {
			menu:{'/':'组员管理','/pb':'班次信息','/count':'排班统计'},
			date_:[],
			pickerOptions: {
				shortcuts: [{
					text: '本月',
					onClick(picker) {
						picker.$emit('pick', [new Date(), new Date()]);
					}
				}, {
					text: '今年至今',
					onClick(picker) {
						const end = new Date();
						const start = new Date(new Date().getFullYear(), 0);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '最近六个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setMonth(start.getMonth() - 6);
						picker.$emit('pick', [start, end]);
					}
				},{
					text: '最近12个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setMonth(start.getMonth() - 12);
						picker.$emit('pick', [start, end]);
					}
				}]
			},
		};
	},
	props:{
		readOnly:{
			type:Boolean,
			default:false,
		},
		isMonth:{
			type:Boolean,
			default:false,
		}
	},
	async created() {
		let nowYM = {y:new Date().getFullYear(),m:new Date().getMonth()+1};
		let ym = `${nowYM.y}/${nowYM.m}`;
		this.date_ = [new Date(ym+'/1'),new Date(ym+`/${new Date(nowYM.y, nowYM.m, 0).getDate()}`)];
	},
	watch:{
		date_(n){
			this.$emit("setDate", n);
		}
	},
	methods: {
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
	.header{position: fixed;left: 155px; right: 5px;background: #fff;z-index: 10;}
	.menu.el-menu--horizontal>.el-submenu .el-submenu__title {height: 40px;line-height: 40px;}
	.no-margin .el-form-item--mini.el-form-item{margin-bottom: 0;}
</style>
