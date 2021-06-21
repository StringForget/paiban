<template>
	<div>
		<h-eard @setDate="date_=$event">
			<el-form-item>
				<el-switch size="mini" v-if="isAdmin" v-model="isCopy" active-text="查看" inactive-text="维护"> </el-switch>
			</el-form-item>
			<el-form-item>
				<el-select style="width: 150px;" size="mini" v-model="selSpm" multiple collapse-tags placeholder="spm组长">
					<el-option v-for="item in spms" :key="item.spm" :label="item.spm" :value="item.spm"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select style="width: 150px;" size="mini" v-model="selCode" multiple collapse-tags placeholder="班次">
					<el-option v-for="item in codes" :key="item.name" :label="item.name" :value="item.name"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-input style="width: 150px;" size="mini" v-model="likeName" placeholder="姓名"></el-input>
			</el-form-item>
			<el-form-item v-show="isCopy">
				<el-button size="mini" @click="selTable()">复制</el-button>
			</el-form-item>
			<el-form-item>
				<el-tag size="small" >上次更新：{{updateTime}}</el-tag>
			</el-form-item>
			<!-- <el-form-item v-show="isAdmin&&!isCopy">
				<el-button size="mini" @click="changeCells()">无排班批量修改</el-button>
			</el-form-item> -->
		</h-eard>
		<div class="content">
			<div style="overflow: visible;width: max-content;width: max-content;max-width: max-content;" class="el-table el-table--fit el-table--border el-table--scrollable-y el-table--enable-row-transition el-table--mini" >
				<table ref="table1" cellspacing="0" cellpadding="0" border="0" class="el-table__header">
					<thead class="is-group">
						<tr class="">
							<th v-for="f,index in fields" :key="index" :style="{position:'sticky','z-index':f.left?'11':'10',top:'40px',left:(f.left||'')}" :colspan="f.child?f.child.length:1" :rowspan="f.child?1:2" class=" is-center is-leaf">
								<div class="cell">{{f.label}}</div>
							</th>
						</tr>
						<tr class="">
							<th v-for="c,index in fieldsObj.row2" :key="index" :style="{position:'sticky','z-index':c.left?'11':'10',top:'74.5px',left:(c.left||'')}" colspan="1" rowspan="1" class=" is-center is-leaf">
								<div class="cell">{{c.label}}</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="d in datas" class="el-table__row" :key="d._id">
							<td v-for="key in fieldsObj.cells" rowspan="1" colspan="1"
							@click="!isCopy&&changeCell(d,key.prop)"
							:class="['is-center',key.className,key.fixed?'fixed':'']"
							:style="getStyle(d,key)"
							:key="key.prop"
							>
								<div class="cell" :style="{width:key.width}">
									<div v-if="d.isOvertime[key.prop]" :title="d[key.prop]">休</div>
									<div v-else-if="d.visaFree[key.prop]" :title="d[key.prop]">不打卡</div>
									<div v-else>{{d[key.prop]}}</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<el-dialog :title="(isChangeMut?'批量':'')+'修改排班数据'" class="dialog-pb" :visible.sync="dialogFormVisible">
			<el-form :model="nowCell" class="pb-list">
				<el-radio-group v-model="nowCell.value" size="mini">
					<el-radio label="" border>无排班</el-radio>
					<el-tooltip v-for="code in codes" :key="code.name" effect="dark" :content="code.dateStr" placement="top">
						<el-radio :label="code.name" border>{{code.name}}</el-radio>
					</el-tooltip>
				</el-radio-group>
				<el-form-item label="是否加班" v-show="nowCell.value">
					<el-switch v-model="nowCell.isOvertime"></el-switch>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="changeVal()">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import Heard from '../components/heard.vue'
export default {
	name: 'pb',
	components:{'h-eard':Heard},
	data(){
		return {
			weeks: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
			tableHeight:document.body.clientHeight - 53,
			date_:[],//查询日期范围
			dbDatas:[],
			spms:[],
			codes:[],
			selSpm:[],
			selCode:[],
			likeName:'',
			//datas:[],
			normWork:[],
			//fields:[],
			nowCell:{},
			isCopy:true,
			dialogFormVisible:false,
			isChangeMut:false,//是否批量修改
			isAdmin:false,//是否管理员
			updateTime:''//上次更新时间
		}
	},
	async created() {
		let load = this.$loading();
		
		this.$db = this.$tcb.database();
		
		let pow = await this.$getUser();
		this.isAdmin = pow.isAdmin;
		if(!pow.isAdmin && pow.spm) this.selSpm.push(pow.spm);
		
		let user = await this.$db.collection('cms-gyy-user').limit(1000).orderBy('isAdon','desc').get();
		let codes = await this.$db.collection('cms-gyy-pbcode').limit(100).orderBy('name','asc').get();
		let maxDateTime = new Date('2020-01-01');
		for(let u of user.data){
			if(u.spm == u.name) this.spms.push(u);//写入组长信息
			if(new Date(u.updateTime) > maxDateTime) maxDateTime = new Date(u.updateTime);
		}
		this.updateTime = maxDateTime.format('YYYY-MM-DD hh:mm:ss')
		this.dbDatas = user.data;
		this.codes = codes.data;
		
		load.close();
	},
	computed:{
		sDateList(){//实时计算的查询日期数组
			let date_ = this.date_, list = [];
			if(date_[0] && date_[1]){
				let nowDate = new Date(date_[0]);//new一个新的时间对象，避免数据跟着变
				while(nowDate <= date_[1]){//对日期进行循环
					list.push(nowDate.format());
					nowDate.setDate(nowDate.getDate()+1);//加一天
				}
			}
			return list;
		},
		fields(){//实时计算的表头
			let list = [{
				label: '日期',width:'250px',left:'0px',fixed:true,child:[
					{prop: 'phone',label: '手机',fixed:true,width:'110px',left:'0px'},
					{prop: 'name',label: '姓名',fixed:true,width:'80px',left:'111.5px'},
					{prop: 'isJob',label: '在职状态',fixed:true,width:'70px',left:'193px'},
				]},{
				label: '',child:[
					{prop: 'userNo',label: '工号',width:'80px'},
					{prop: 'department',label: '部门',width:'150px'},
					{prop: 'post',label: '岗位',width:'120px'},
					{prop: 'joinDate',label: '入职时间',width:'100px'},
				]}
			];
			for (let ymd of this.sDateList) {
				list.push({label: this.isCopy?ymd:ymd.substr(5),child:[{prop: ymd,width:this.isCopy?'':'60px',className:this.isCopy?'':'pb-val',label:this.weeks[new Date(ymd.replace(/-/g,'/')).getDay()]}]});
			}
			for(let code of this.selCode){
				list.push({label:code,prop:code,width:'60px'});
			}
			return list;
		},
		fieldsObj(){
			let row2 = [],cells=[];
			for (let f of this.fields) {
				if(f.prop)cells.push(f);
				if(f.child){
					for (let c of f.child) {
						row2.push(c);
						cells.push(c);
					}
				}
			}
			return {row2,cells};
		},
		datas(){//实时计算的数据
			let list = [];
			let {selSpm,selCode,likeName} = this;
			for(let index in this.dbDatas) {
				let user = this.dbDatas[index];
				if((
					new Date(user.joinDate) <= new Date(this.date_[1].format())//入职时间小于等于查询结束时间
				)&&(
					user.isJob || new Date(user.outDate) >= new Date(this.date_[0].format()) //在职，或者离职日期大于等于查询开始日期
				)){
					let obj = {
						_id:user._id,
						name:user.name,
						phone:user.phone,
						pName:user.pName,
						isJob:user.isJob?'在职':'离职',
						userNo:user.userNo,
						department:user.department,
						post:user.post,
						joinDate:user.joinDate,
						index:index-0+1,
						isOvertime:user.isOvertime||{},
						visaFree:user.visaFree||{}
					};
					for(let code of this.selCode){
						obj[code] = 0;
					}
					let isCode = false,isSpm = selSpm.includes(user.spm);//是否包含所选组长或班次
					for (let ymd of this.sDateList) {
						let val = user.pbData[ymd];
						if(val){
							obj[ymd] = val.replace(/\*/g,'');
						}else{
							obj[ymd] = "";
						}
						if(selCode.includes(obj[ymd])){
							obj[obj[ymd]]++;
							isCode = true;
						}
					}
					if(
						(selCode.length==0 || isCode) &&
						(selSpm.length==0 || isSpm) &&
						(!likeName || user.name.indexOf(likeName) > -1)
					){
						list.push(obj);
					}
				}else{
					console.log(user,user.joinDate,this.date_[1],new Date(user.joinDate) <= new Date(this.date_[1].format()))
				}
			}
			return list;
		}
	},
	watch: {
		//isCopy(n){
		//	if(n) this.selTable();
		//},
		'nowCell.value':function(n){
			if(!n) this.nowCell.isOvertime = false;
		}
	},
	methods: {
		changeCell(row, key){//单个值修改
			if({name:1,phone:1,isJob:1}[key]) return;//跳过不能编辑的
			this.isChangeMut = false;//不是批量修改
			this.nowCell = {row,key,value:row[key],isOvertime:row.isOvertime[key]};
			this.dialogFormVisible = true;
		},
		changeCells(){//批量修改触发
			this.isChangeMut = true;//批量修改
			this.dialogFormVisible = true;
		},
		changeVal() {
			if(this.isChangeMut){//批量修改
				let newData = {},that = this;
				let val = this.nowCell.value?`*${this.nowCell.value}*`:'';
				this.dbDatas.forEach(e=>{
					if(e.isJob && !e.isAdon){//在职且无排班才更新
						let obj = {};
						that.sDateList.forEach(ymd=>{
							obj[ymd] = val;
						})
						newData[e._id] = obj;
					}
				});
				this.$tcb.callFunction({name:'set-pb-data',data:{userData:newData}}).then(()=>{
					alert(`成功修改${Object.keys(newData).length}条数据`);
				});
			}else{//单个修改
				const {row,key,value,isOvertime} = this.nowCell;
				row[key] = value;row.isOvertime[key] = isOvertime;
				this.dbDatas[row.index-1].pbData[key] = value;//
				this.dbDatas[row.index-1].isOvertime = row.isOvertime;
				
				this.$db.collection("cms-gyy-user").doc(row._id).update({
					pbData: {
						[key]: value?`*${value}*`:''
					},
					isOvertime:{
						[key]:isOvertime
					}
				}).then(() => {
					this.$message({
						message: '排班信息修改成功',
						type: 'success'
					});
				});
			}
			this.dialogFormVisible = false;
		},
		selTable() {//选中table复制
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(this.$refs.table1);
			selection.removeAllRanges();
			selection.addRange(range);
		},
		getStyle(d,key){
			let dw_obj = {position: (key.fixed?'sticky':''),left:(key.left||''),'z-index':key.fixed?'9':''};
			let bc_obj = {};
			if(d.isOvertime[key.prop]){//加班
				bc_obj = {color:'#FF9800','font-weight':600};
			}else{
				bc_obj = {
					'休':{color:'#8bc34a','font-weight':600},
					'事':{color:'#2196f3','font-weight':600},
					'夜班':{color:'red','font-weight':600}
				}[d[key.prop]]
			}
			return {...dw_obj,...bc_obj};
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	td.pb-val:hover {cursor: pointer;background: #03A9F4!important;color: #fff;}
	.pb-list .el-radio {margin-right: 20px;margin-bottom: 20px;margin-left: 0!important;width: 80px;}
	.header{position: fixed;left: 5px;width: 100%;background: #fff;z-index: 10;}
	.content{padding-top: 39px;}
	.dialog-pb .el-dialog__body {padding: 5px 20px;padding-bottom: 0;}
	.dialog-pb .el-dialog__footer {padding-top: 0;padding-bottom: 10px;}
	.dialog-pb .el-divider--horizontal{margin: 5px 0;}
	.el-table th{user-select: auto;}
	.sles-div{display: inline-flex;}
	.sles-div .el-radio{margin-right: 15px;}
	td{background: #fff;}
	.el-form-item{margin-bottom: 0;}
</style>
