<template>
  <div id="app">
		<h-eard @setDate="date_=$event" :isMonth="true">
			<!-- <el-form-item>
				<el-select size="mini" v-model="selProduct" multiple collapse-tags placeholder="负责产品">
					<el-option v-for="v,key in products" :key="key" :label="key" :value="key"> </el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item>
				<el-button size="mini" @click="selTable()">复制</el-button>
			</el-form-item>
			<el-form-item v-if="isAdmin">
				<el-upload action="/" :show-file-list="false" :auto-upload="false" :on-change="importJb">
					<el-button size="mini" type="primary">导入安灯数据</el-button>
				</el-upload>
			</el-form-item>
		</h-eard>
		<div class="content">
			<el-tabs v-model="activeName" @tab-click="handleClick">
				<el-tab-pane label="详情分析" name="tab1">
					<div  class="el-table el-table--fit el-table--border el-table--scrollable-y el-table--enable-row-transition el-table--mini" >
						<table ref="table1" cellspacing="0" cellpadding="0" border="0" class="el-table__header">
							<thead class="is-group">
								<tr class="">
									<th class="is-center" > <div class="cell" >序号</div> </th>
									<th class="is-center" > <div class="cell" >负责产品</div> </th>
									<th class="is-center" > <div class="cell" >姓名</div> </th>
									<th v-for="col,index in cols" :key="index" class=" is-center is-leaf">
										<div class="cell">{{col}}</div>
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="d,index in datas" class="el-table__row" :key="index">
									<td class="is-center"> <div class="cell" > {{index++}} </div> </td>
									<td class="is-center"> <div class="cell" > {{d.product||''}} </div> </td>
									<td class="is-center"> <div class="cell" > {{d.name}} </div> </td>
									<td v-for="col,index in cols" class="is-center" :key="index" >
										<div class="cell" >
											{{/.*[率|比|度].*/.test(col)?(d[col]*100).toFixed(2)+'%':Math.round(d[col] * 100)/100}}
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</el-tab-pane>
				<el-tab-pane label="图表分析" name="tab2">
					<div>
						<el-row>
							<el-col :span="24"><div ref="echats1" style="height: 600px;"></div></el-col>
						</el-row>
						<el-row>
							<el-col :span="24"><div ref="echats2" style="height: 500px;"></div></el-col>
						</el-row>
					</div>
					<el-row>
						<el-col :span="12"><div ref="echats3" style="height: 500px; width: 100%;"></div></el-col>
						<el-col :span="12"><div ref="echats4" style="height: 500px; width: 100%;"></div></el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="工单TOP榜" name="tab3">
					<el-row :gutter="20">
						<el-col v-for="(item,index) in topCols" :key="index" :span="8">
							<el-card class="box-card" style="margin-bottom: 20px;">
								<div slot="header" class="clearfix">
								    <span style="font-weight: 800;">{{item}}</span>
								    <label style="float: right; color: #888;">工单量前50%数据</label>
								  </div>
								<div v-for="user,i in getDataByTitle(item)" :key="i" class="top-card">
									<p><span class="ranking">{{i+1}}</span><span class="name">{{user.name}}</span><span class="value">{{/.*[率|比|度].*/.test(item)?(user[item]*100).toFixed(2)+'%':Math.round(user[item] * 100)/100}}</span></p>
								</div>
							</el-card>
						</el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="员工分析" name="tab4">
					有待开发...
				</el-tab-pane>
			</el-tabs>
		</div>
		<el-dialog title="安灯数据导入确认" :visible.sync="andonData">
			<el-form size="mini" label-width="100px" style="max-height: 300px;overflow: auto;">
				<el-form-item label="数据导入月份">
					<el-date-picker type="month" placeholder="选择月份" value-format="yyyy-MM" v-model="saveMonth" style="width: 100%;"></el-date-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="andonData = null">取 消</el-button>
				<el-button size="mini" type="primary" @click="updateAndonData(andonData);andonData = null">提 交</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>
import Heard from '../components/heard.vue'
import XLSX from 'xlsx'
import * as echarts from 'echarts'
export default {
	name: 'count',
	components:{'h-eard':Heard},
	data(){
		return {
			activeName:'tab1',
			cols:["服务差评率","反馈率","服务态度差占比","技术能力弱占比","解决时效差占比","工单12h闭环率","80分位工单总时长(h)","结单量","满意度(汇总)","满意度(MC)","满意度(KA)","工单总时长(h)","90分位总对外回复次数","专项处理时长(MC)","专项处理时长(KA)","专项处理时长(汇总)","透传量","透传率","透传拒绝率"],
			topCols:["服务差评率","反馈率","工单12h闭环率","80分位工单总时长(h)","结单量","满意度(汇总)","工单总时长(h)","90分位总对外回复次数","专项处理时长(汇总)"],
			date_:[],//查询日期范围
			spms:[],
			selSpm:'',
			dbDatas:[],
			andonDatas:{},
			isAdmin:false,//是否管理员
			andonData:null,//加班导入确认数据
			saveMonth:'',
			products:{},
			selProduct:[],
			echatsObj:{},//echats
		}
	},
	async created() {
		
		let load = this.$loading();
		
		let pow = await this.$getUser();
		if(!pow.isAdmin){
			this.$message({message: '你没有权限',type: 'error',});
		}
		this.isAdmin = pow.isAdmin;
		this.$db = this.$tcb.database();
		
		let user = await this.$db.collection('user-andon-data').limit(1000).get();
		this.dbDatas = user.data;
		user.data.map(v=>{this.products[v.product||'其它产品'] = true;});
		
		load.close();
	},
	computed:{
		ym_ym:{
			get(){
				return this._date&&this._date[0]?[this._date[0].substr(0,7),this._date[1].substr(0,7)]:[];
			},
			set(v){
				this._date = [v[0]+'01',v[1]+'01'];
			}
		},
		sDateList(){//实时计算的查询月份数组
			let date_ = this.date_, list = [];
			if(!date_) return [];
			if(date_[0] && date_[1]){
				let nowDate = new Date(date_[0]);
				while(nowDate <= date_[1]){//对日期进行循环
					let ym = nowDate.format('YYYY-MM');
					if(list[list.length-1] != ym) list.push(ym);
					nowDate.setDate(nowDate.getDate()+1);//加一天
				}
			}
			return list;
		},
		datas(){//实时计算的数据
			let list = [];
			for(let index in this.dbDatas) {
				let user = this.dbDatas[index];
				let obj = {
					_id:user._id,
					name:user.name,
					pName:user.pName,
					phone:user.phone,
					product:user.product,
				};
				for (let ym of this.sDateList) {
					if(!user.andonData) break;
					let val = user.andonData[ym];
					if(val){//存在值才进行写值和判断
						for (let s of this.cols) {
							if(obj[s]){
								obj[s] += val[s]||0;
							}else{
								obj[s] = val[s]||0;
							}
						}
					}
				}
				for (let s of this.cols) {
					if(obj[s]){
						if(s.indexOf('量') == -1){
							obj[s] = obj[s]/this.sDateList.length;
						}
					}
				}
				if(obj['结单量'])list.push(obj);
			}
			list.sort((a,b)=>{
				return b['结单量'] - a['结单量']
			});
			//this.echatsData();
			return list;
		},
		pNameObj(){
			let obj = {};
			this.dbDatas.map(user=>{
				obj[user.pName] = user._id;
			});
			return obj;
		}
	},
	watch: {
		sDateList(){
			this.echatsData();//
		}
	},
	methods: {
		getDataByTitle(title){
			let data = this.datas.slice(1,parseInt(this.datas.length/2));
			let type = /.*[差|弱|时长|透传].*/.test(title)?-1:1;
			data.sort((a,b)=>{
				return (b[title] - a[title])*type
			});
			return data.slice(0,5);
		},
		handleClick(tab, event) {
			if(tab.name == 'tab2'){//需要加载图表
				this.$nextTick(()=>{
					for (let mycharts in this.echatsObj) {
						this.echatsObj[mycharts].resize();
					}
				})
			}
		},
		async importJb(file){
			let _this = this;
			readWorkbookFromLocalFile(file.raw,async function(e){
				let andonDatas = XLSX.utils.sheet_to_json(e.Sheets[e.SheetNames[0]]);
				let saveData = {};
				for(let obj of andonDatas){
					let _id = _this.pNameObj[obj['接单人']];
					if(_id){
						saveData[_id] = obj;
					}
				}
				_this.andonData = saveData;
			})
			function readWorkbookFromLocalFile(file, callback) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {type: 'binary'});
					if(callback) callback(workbook);
				};
				reader.readAsBinaryString(file);
			}
		},
		async updateAndonData(){//导入安灯数据
			console.log(this.andonData,this.saveMonth,{andonData:{[this.saveMonth]:this.andonData}});
			let load = this.$loading(),promiseArr = [];
			for(let key in this.andonData){
				promiseArr.push(this.$db.collection('user-andon-data').doc(key).update({andonData:{[this.saveMonth]:this.andonData[key]}}));
			}
			let res = await Promise.all(promiseArr);//等待全部处理成功
			console.log(res);
			let user = await this.$db.collection('user-andon-data').limit(1000).get();
			this.dbDatas = user.data;
			load.close();
			this.$message({
				message: '数据导入成功',
				type: 'success',
			});
		},
		selTable() {//选中table复制
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(this.$refs.table1);
			selection.removeAllRanges();
			selection.addRange(range);
		},
		getTableEchatsData(title,cpList,data,type){
			let dimensions = ['ym'], source = [], series = [];
			for (let cp in cpList){
				dimensions.push(cp);//写入产品
				series.push({
					type: type||'bar',
					stack: type?'':'total',
					label: {show: true},
					emphasis: {focus: 'series'},
					markPoint: type?{data: [{type: 'max', name: '最大值'},{type: 'min', name: '最小值'}]}:{},
				})
			}
			for (let key in data) {
				source.push(data[key]);
			}
			return {
				title:{text:title},
				tooltip: {trigger: 'axis',axisPointer: {type: 'shadow'}},
				legend: {},//data: legend
				dataset:{dimensions,source},
				grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
				xAxis: {type: 'category'},
				yAxis: {type: 'value'},
				series:series
			};
		},
		getPicEchatsData(title,cpList,name,data){
			let _series = [];
			for (let cp in cpList){
				let obj = {name:cp,value:0};
				for(let key in data){
					obj.value += data[key][cp]||0;
				}
				_series.push(obj);
			}
			_series.sort((a,b)=>{
				return b.value - a.value
			});
			return {
				title: {text: title,left: 'center'},
				tooltip: {trigger: 'item',formatter: '{a} <br/>{b} : {c} ({d}%)'},
				legend: {orient: 'vertical',left: 'left',},
				series: [{
					name: name,
					type: 'pie',
					radius: '50%',
					data: _series,
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}]
			}
		},
		echatsData(){
			if(!this.$refs.echats1) return;
			let cpObj = {},//产品数据
				ppObj = {},//人员数据
				cpList = {};//产品列表
			for (let ym of this.sDateList) {//循环月份
				if(!cpObj[ym]) cpObj[ym] = {ym:ym};
				if(!ppObj[ym]) ppObj[ym] = {ym:ym};
				for(let user of this.dbDatas){//循环数据
					if(!user.andonData) continue;
					let product = user.product||'其它';
					let val = user.andonData[ym];
					if(val && val['结单量']){
						cpObj[ym][product] = cpObj[ym][product]?(cpObj[ym][product]+val['结单量']):val['结单量'];
						ppObj[ym][product] = ppObj[ym][product]?(ppObj[ym][product]+1):1;
						cpList[product] = true;
					}
				}
			}
			this.echatsObj.echats1 = echarts.init(this.$refs.echats1);
			this.echatsObj.echats1.setOption(this.getTableEchatsData('产品工单量分布图',cpList,cpObj));
			
			this.echatsObj.echats2 = echarts.init(this.$refs.echats2);
			this.echatsObj.echats2.setOption(this.getTableEchatsData('产品人数折线图',cpList,ppObj,'line'));
			
			this.echatsObj.echats3 = echarts.init(this.$refs.echats3);
			this.echatsObj.echats3.setOption(this.getPicEchatsData('产品工单分布图(总)',cpList,'工单量',cpObj));
			
			this.echatsObj.echats4 = echarts.init(this.$refs.echats4);
			this.echatsObj.echats4.setOption(this.getPicEchatsData('处理人数分布图(总)',cpList,'处理人',ppObj));
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	td.pb-val:hover {cursor: pointer;background: #03A9F4!important;color: #fff;}
	.pb-list .el-radio {margin-right: 20px;margin-bottom: 20px;margin-left: 0!important;width: 80px;}
	.header{position: fixed;left: 5px;width: 100%;background: #fff;z-index: 10;height: 40px;overflow: hidden;}
	.content{padding: 40px 10px 10px;}
	.dialog-pb .el-dialog__body {padding: 5px 20px;padding-bottom: 0;}
	.dialog-pb .el-dialog__footer {padding-top: 0;padding-bottom: 10px;}
	.dialog-pb .el-divider--horizontal{margin: 5px 0;}
	.el-table th{user-select: auto;}
	.sles-div{display: inline-flex;}
	.sles-div .el-radio{margin-right: 15px;}
	td{background: #fff;}
	.el-form-item{margin-bottom: 0;}
	.top-card .ranking {display: inline-block;background: #ff9800;border-radius: 50%;text-align: center;width: 22px;margin-right: 10px;}
	.top-card .value {float: right;}
</style>
