<template>
  <div id="app">
		<h-eard @setDate="date_=$event">
			<el-form-item>
				<el-switch size="mini"
					v-model="isNightMode"
					active-text=""
					inactive-text="夜班统计模式">
				</el-switch>
			</el-form-item>
			<el-form-item>
				<el-select size="mini"
					v-model="selSpm"
					multiple
					collapse-tags
					placeholder="spm组长">
					<el-option
						v-for="item in spms"
						:key="item.spm"
						:label="item.spm"
						:value="item.spm">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-show="!isNightMode">
				<el-switch size="mini" 
					v-model="isNight"
					active-text=""
					inactive-text="大夜修正">
				</el-switch>
			</el-form-item>
			<el-form-item v-show="!isNightMode">
				<el-checkbox-group class="sles-div" size="mini" v-model="showTypes">
					<el-checkbox label="<0">小于0</el-checkbox>
					<el-checkbox label=">0">大于0</el-checkbox>
					<el-checkbox label="==0">等于0</el-checkbox>
				</el-checkbox-group>
			</el-form-item>
			<el-form-item>
				<el-button size="mini" @click="selTable()">复制</el-button>
			</el-form-item>
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
							@click="isAdmin&&changeCell(d,key.prop)"
							:class="['is-center',key.className]"
							:style="{position: (key.fixed?'sticky':''),left:(key.left||''),'z-index':key.fixed?'9':'',left:key.left||''}"
							:key="key.prop"
							>
  							<div class="cell" :style="{width:key.width}">
  								<div>{{d[key.prop]&&d[key.prop].push?d[key.prop].join('、'):d[key.prop]}}</div>
  							</div>
  						</td>
  					</tr>
  				</tbody>
  			</table>
  		</div>
  	</div>
  	<el-dialog :title="`【${nowCell.row.name}】排班差值修正，含夜班修正【${nowCell.row.night*0.25}】天`" class="dialog-pb" :visible.sync="dialogFormVisible">
  		<el-form :inline="true" :model="nowCell" >
  			<el-form-item
  				size="mini"
  				label="本次修正值(天)"
  				prop="value"
  				:rules="[ { required: true, message: '修正值不能为空'}, { type: 'number', message: '修正值必须为数字值'} ]"
  			>
  				<el-input size="mini" type="value" style="width: 100px;" v-model.number="nowCell.value" autocomplete="off"></el-input>
  			</el-form-item>
  			<el-form-item
  				size="mini"
  				label="本次修正原因"
  				prop="reason"
  				:rules="[ { required: true, message: '修正原因不能为空'} ]"
  			>
  				<el-input size="mini" type="reason" style="width: 300px;" v-model="nowCell.reason" autocomplete="off" placeholder="请输入本次修正原因"></el-input>
  			</el-form-item>
  		</el-form>
  		<span v-for="r,index in nowCell.row.reason" :key="index">
  			<span>修正值：{{r.value}}，修正原因：{{r.text}}</span>
  			<el-divider></el-divider>
  		</span>
  		<span slot="footer" class="dialog-footer">
  			<el-button size="mini" type="button" @click="changeVal()">确 定</el-button>
  		</span>
  	</el-dialog>
  </div>
</template>

<script>
import Heard from '../components/heard.vue'
export default {
	name: 'count',
	components:{'h-eard':Heard},
	data(){
		return {
			weeks: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
			isNight:false,//夜班修正
			isNightMode:false,//夜班统计模式
			showTypes:['<0','>0','==0'],
			date_:[],//查询日期范围
			spms:[],
			selSpm:'',
			dbDatas:[],
			codes:[],
			//datas:[],
			normWork:[],
			//fields:[],
			nowCell:{
				row:{reason:[]},
				reasonList:[{value:-1,text:'测试'}]
			},
			dialogFormVisible:false,
			isAdmin:false,//是否管理员
		}
	},
	async created() {
		let load = this.$loading();
		
		let pow = await this.$getUser();
		this.isAdmin = pow.isAdmin;
		this.$db = this.$tcb.database();
		
		let user = await this.$db.collection('cms-gyy-user').limit(1000).get();
		this.dbDatas = user.data;
		for (let u of user.data) {
			if(u.spm == u.name) this.spms.push(u);
			if(u.name == '李晓利'){this.normWork = u.pbData;break;}
		}
		
		load.close();
	},
	computed:{
		sDateList(){//实时计算的查询日期数组
			let date_ = this.date_, list = [];
			if(date_[0] && date_[1]){
				let nowDate = new Date(date_[0]);
				while(nowDate <= date_[1]){//对日期进行循环
					list.push(nowDate.format());
					nowDate.setDate(nowDate.getDate()+1);//加一天
				}
			}
			return list;
		},
		fields(){//实时计算的表头
			let list = [
				{label: '序',prop:'listNum',width:'40px',left:'0px',fixed:true},
				{label: '日期',width:'130px',left:'41px',fixed:true,child:[
					{prop: 'name',fixed:true,width:'60px',left:'41px',label: '姓名'},
					{prop: 'isJob',fixed:true,width:'70px',left:'102px',label: '是否在职'},
				]},
			];
			let ym;
			for (let ymd of this.sDateList) {
				let new_ym = ymd.substr(0,7);
				if(ym != new_ym){
					ym = new_ym;
					let child = [
						{prop:ym+"cq",label:"实出勤"},
						{prop:ym+"zj",label:"应出勤"},
						{prop:ym+"cz",label:"差值"},
						{prop:ym+"ybDays",label:"夜班"}
					];
					if(this.isNightMode){
						child = [
							{prop:ym+"ybList",label:"夜班日期"},
							{prop:ym+"ybDays",label:"夜班天数"}
						]
					}
					list.push({label:ym.replace('-','年')+'月',child});
				}
			}
			if(this.isNightMode){//夜班统计模式
				list.push({prop:'ybDays',label:'总计夜班数'});
			}else{
				if(this.isNight) list.push({prop:'night',label:'夜班'});
				list.push({prop:'noun',label:'修正值',className:this.isAdmin?'pb-val':''});
				list.push({prop:'sum',label:'总计差值'});
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
			for(let index in this.dbDatas) {
				let user = this.dbDatas[index];
				if(!user.isJob) continue;
				let obj = {
					_id:user._id,
					name:user.name,
					phone:user.phone,
					isJob:user.isJob?'在职':'离职',
					index:index-0+1,
					noun:user.noun||0,
					reason:user.reason||[],
					sum:(user.noun||0),//修正值，默认0
					isOvertime:user.isOvertime||{},//加班日期对象
					night:0,
					ybDays:0,//夜班总天数
				};
				for (let ymd of this.sDateList) {
					let val = user.pbData[ymd];
					if(val){//存在值才进行写值和判断
						val = val.replace(/\*/g,'');//去除*号
						let normVal = this.normWork[ymd].replace(/\*/g,'');
						let ym = ymd.substr(0,7);
						let t = 1;
						if(val.indexOf('夜') == 0){
							if(!obj[ym+'ybDays']) obj[ym+'ybDays'] = 1;
							else obj[ym+'ybDays'] += 1;
							obj.ybDays += 1;
							if(this.isNight){//夜班修正
								t = 1.25;
								obj.night++;
								obj.noun += 0.25;
							}
							if(this.isNightMode){//夜班统计模式
								let mdStr = new Date(ymd).format('M月DD日');
								if(obj[ym+'ybList']){
									obj[ym+'ybList'].push(mdStr);
								}else{
									obj[ym+'ybList'] = [mdStr];
								}
							}
						}
						if((user.isOvertime||{})[ymd]) t = 0;//加班不算出勤
						let cqObj = {//出勤判断
							cq:(val!='休'?t:0),//出勤
							zj:(normVal=='不打卡'?1:0),//标准
							cz:(normVal=='不打卡'?(val!='休'?(t-1):-1):(val!='休'?t:0))
						}
						for(let key in cqObj){
							obj[ym+key] = obj[ym+key]?(obj[ym+key]+cqObj[key]):cqObj[key];
							if(key == 'cz')obj.sum += cqObj[key];//计算总计差值
						}
					}
				}
				if(this.isNightMode){
					if(obj.ybDays<=0) continue;//
				}else{
					let isShow = '';
					for(let i in this.showTypes){
						isShow += obj.sum+this.showTypes[i]+'||';
					}
					isShow = isShow.substr(0,isShow.length-2);
					if(!eval(isShow)) continue;
				}
				if(this.selSpm.length==0 || this.selSpm.includes(user.spm)) list.push(obj);
			}
			
			list.sort((a,b)=>{
				if(this.isNightMode){//夜班统计模式
					return b.ybDays - a.ybDays;
				}else{
					return a.sum - b.sum;
				}
			});
			list.map((e,i)=>{e.listNum = i+1;});
			return list;
		}
	},
	watch: {
		
	},
	methods: {
		changeCell(row, key){
			if('noun' == key){
				this.nowCell = {
					row,key,
					value:0,
					reason:''
				}
				this.dialogFormVisible = true;
			}
		},
		changeVal() {
			//console.log(e,date,id)
			const {row,value,reason} = this.nowCell;
			
			row.noun += value; row.sum += value;
			row.reason.push({value,text:reason});
			this.dbDatas[row.index-1].noun += value;
			this.dbDatas[row.index-1].reason = row.reason;
			
			const _ = this.$db.command;
			this.$db.collection("cms-gyy-user").doc(row._id).update({
				noun: _.inc(value),
				reason: _.push({value,text:reason})
			}).then(() => {
				this.$message({
					message: '信息修正修改成功',
					type: 'success'
				});
			});
			this.dialogFormVisible = false;
		},
		getColor(d,key){
			let color = '';
			if(key.indexOf('cz')>-1||key=='sum'){
				if(d[key]<0){
					color = 'red';
				}else if(d[key]>0){
					color = '#8bc34a';
				}
			}
			return color;
		},
		selTable() {
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(this.$refs.table1);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  td.pb-val:hover {cursor: pointer;background: #03A9F4!important;color: #fff;}
  .pb-list .el-radio {margin-right: 20px;margin-bottom: 20px;margin-left: 0!important;width: 80px;}
  .header{position: fixed;left: 5px;width: 100%;background: #fff;z-index: 10;padding-top: 5px;margin-top: -5px;}
  .content{padding-top: 39px;}
  .dialog-pb .el-dialog__body {padding: 5px 20px;padding-bottom: 0;}
  .dialog-pb .el-dialog__footer {padding-top: 0;padding-bottom: 10px;}
  .dialog-pb .el-divider--horizontal{margin: 5px 0;}
  .el-table th{user-select: auto;}
  .sles-div{display: inline-flex;}
  .sles-div .el-checkbox{margin-right: 15px;}
  td{background: #fff;}
</style>
