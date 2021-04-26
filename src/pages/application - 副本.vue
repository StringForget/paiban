<template>
  <div id="app">
		<h-eard @setDate="date_=$event">
			<el-form-item>
				<el-select size="mini" v-if="!nowSpm"
					v-model="selSpm"
					placeholder="选择绑定">
					<el-option
						v-for="item in spms"
						:key="item._id"
						:label="item.spm"
						:value="item._id">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button size="mini" @click="!nowSpm&&bindSpm()">{{nowSpm?nowSpm:'绑定'}}</el-button>
			</el-form-item>
		</h-eard>
  	<div class="content">
  		<el-container>
				<!-- <el-aside width="600px">
					<el-table
					    :data="tableData"
					    border
					    style="width: 100%">
					    <el-table-column
					      prop="date"
					      label="日期"
					      width="180">
					    </el-table-column>
					    <el-table-column
					      prop="name"
					      label="姓名"
					      width="180">
					    </el-table-column>
					    <el-table-column
					      prop="remark"
					      label="备注">
					    </el-table-column>
					  </el-table>
				</el-aside> -->
				<el-main>
					<el-form v-for="obj,index in forms" :key="index" :inline="true">
						<el-form-item :label="index+1+''">
						</el-form-item>
						<el-form-item label="组员">
							<el-select v-model="obj.userid" placeholder="请选择组员">
								<el-option v-for="u in userList" :key="u.id" :label="u.name" :value="u._id"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="日期">
							<el-date-picker
								v-model="obj.date"
								type="date"
								placeholder="选择日期">
							</el-date-picker>
						</el-form-item>
						<el-form-item label="操作">
							<el-select v-model="obj.mode" placeholder="操作">
								<el-option label="请假/调休" value="事"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="">
							<el-button v-if="forms.length-1==index" type="primary" icon="el-icon-plus" @click="forms.push({userid:'',date:'',mode:'事'})" circle></el-button>
							<el-button v-else type="danger" icon="el-icon-minus" @click="forms.splice(index,1)" circle ></el-button>
						</el-form-item>
					</el-form>
					<el-form :inline="true">
						<el-form-item label="">
							<el-button type="primary" @click="isSubmit()&&updateUserPb()">批量提交请假排班修改</el-button>
						</el-form-item>
					</el-form>
				</el-main>
			</el-container>
  	</div>
  </div>
</template>

<script>
import Heard from '../components/heard.vue'
export default {
	name: 'application',
	components:{'h-eard':Heard},
	data(){
		return {
			tableData:[],
			userList:[],//组员
			spms:[],
			selSpm:'',
			nowSpm:'',
			userid:'',
			forms:[{userid:'',date:'',mode:'事'}]
		}
	},
	async created() {
		let load = this.$loading();
		this.$db = this.$tcb.database();
		let pow = await this.$getUser();
		this.nowSpm = pow.spm;
		this.userid = pow.user.user.uid;
		let user = await this.$db.collection('cms-gyy-user').limit(1000).orderBy('isAdon','desc').get();
		for(let u of user.data){
			if(u.spm == u.name) this.spms.push(u);
			if(u.spm == pow.spm)this.userList.push(u);
		}
		load.close();
	},
	computed:{
		
	},
	watch: {
		
	},
	methods: {
		isSubmit(){//是否可以提交
			for (let user of this.forms) {
				for(let key in user){
					if(!user[key]){
						this.$message({
							showClose: true,
							message: '请检查你填写的参数',
							type: 'error'
						});
						return false;
					}
				}
			}
			return true;
		},
		updateUserPb(){
			let newData = {};
			for (let user of this.forms) {
				let dateStr = user.date.toLocaleDateString().replace(/\//g, '-').replace(/-(\d)\b/g, '-0$1');
				newData[user.userid] = {[dateStr]:`*${user.mode}*`};
			}
			console.log(newData);
			this.$tcb.callFunction({name:'set-pb-data',data:{userData:newData}}).then(()=>{
				this.$message({
					message: `成功修改${Object.keys(newData).length}条数据`,
					type: 'success'
				});
				this.forms = [{userid:'',date:'',mode:'事'}];
			});
		},
		async bindSpm(){
			if(this.selSpm){
				this.$confirm('绑定账号后暂时无法解绑，需谨慎操作。继续请确认。').then(async () => {
					await this.$db.collection('cms-gyy-user').doc(this.selSpm).update({userid:this.userid});
					this.$router.go(0);
				});
			}else{
				this.$message({
					message: `请先选择需要绑定的人员`,
					type: 'error'
				});
			}
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .content{padding-top: 60px;}
</style>
