<template>
	<div id="app">
		<h-eard @setDate="date_=$event" :readOnly="true">
			<el-form-item>
				<el-select size="mini" v-if="!nowSpm&&!isAdmin"
					v-model="selSpm"
					style="width: 100px;"
					placeholder="选择绑定">
					<el-option v-for="item,i in spms" :key="i" :label="item.spm" :value="item._id"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="!nowSpm&&!isAdmin">
				<el-button size="mini" @click="bindSpm()">{{'绑定'}}</el-button>
			</el-form-item>
			<el-form-item>
				<el-select size="mini" v-if="nowSpm||isAdmin"
					v-model="selSpms"
					multiple
					collapse-tags
					style="width: 150px;"
					placeholder="spm组长">
					<el-option v-for="item,i in outherSpms" :key="'_'+i" :label="item.spm" :value="item.spm"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="outherUsers.length>0">
				<el-popover placement="right" width="481" trigger="click">
				  <el-table :data="outherUsers" size="mini" border>
				    <el-table-column width="80" align="center" property="name" label="姓名"></el-table-column>
						<el-table-column prop="isJob" align="center" width="80" label="在职状态">
							<template slot-scope="scope">
								<el-tag v-if="scope.row.isJob" size="small" type="success" >在职</el-tag>
								<el-tooltip v-else-if="isAdmin" effect="dark" :content="scope.row.outDate+'离职，点击删除'" placement="top">
									<el-button size="mini" @click="deleteUser(scope.row._id)">删除</el-button>
								</el-tooltip>
								<el-tag v-else size="small" type="info">已离职</el-tag>
							</template>
						</el-table-column>
				    <el-table-column prop="pName" align="center" width="100" label="p账号"> </el-table-column>
						<el-table-column prop="joinDate" align="center" width="120" label="入职时间"> </el-table-column>
						<el-table-column align="center"  width="100" label="操作">
							<template slot-scope="scope">
								<el-tooltip class="item" effect="dark" content="将该员工认领为自己的组员。" placement="left">
									<el-button @click="addUser(scope.row._id)" type="primary" round plain size="mini">添加</el-button>
								</el-tooltip>
							</template>
						</el-table-column>
				  </el-table>
					<el-tooltip slot="reference" class="item" effect="dark" content="组长认领未被分配到组长的员工" placement="bottom">
						<el-button size="mini" >添加组员</el-button>
					</el-tooltip>
				</el-popover>
			</el-form-item>
			<el-form-item>
				<el-button size="mini" @click="dialogInfoFormVisible=true;copyObj(infoForm,{spm:nowSpm,isJob:true,zdyPb:{}})">新员工入职</el-button>
			</el-form-item>
			<el-form-item>
				<el-tooltip effect="dark" content="修改后的排班无法被安灯排班覆盖, 请谨慎操作" placement="bottom">
					<el-button type="danger" plain size="mini" @click="dialogPbsFormVisible=true;pbsForm=[];">批量排班调整</el-button>
				</el-tooltip>
			</el-form-item>
			<el-form-item v-if="isAdmin">
				<el-upload action="/" :show-file-list="false" :auto-upload="false" :on-change="importJb">
					<el-button size="mini" type="primary">导入加班</el-button>
				</el-upload>
			</el-form-item>
		</h-eard>
		<div class="content">
			<el-table :data="datas" size="mini" border style="width: 100%">
				<el-table-column prop="name" align="center" width="80" label="姓名">
					<template slot-scope="scope">
						<el-tooltip effect="dark" :content="'组长：'+scope.row.spm" placement="top">
							<span >{{scope.row.name}}</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="phone" align="center" width="120" label="电话"> </el-table-column>
				<el-table-column prop="pName" align="center" width="120" label="p账号"> </el-table-column>
				<!-- <el-table-column prop="isAdon" align="center" width="100" label="安灯排班时间"> </el-table-column> -->
				<el-table-column prop="isJob" align="center" width="80" label="在职状态">
					<template slot-scope="scope">
						<el-tooltip effect="dark" :content="`${scope.row.joinDate}${scope.row.outDate?'至'+scope.row.outDate:'入职'}`" placement="top">
							<el-tag size="small" type="success" v-if="scope.row.isJob">在职</el-tag>
							<el-tag size="small" type="info" v-else-if="new Date()>new Date(scope.row.outDate+' 23:59:59')">已离职</el-tag>
							<el-tag size="small" v-else >离职中</el-tag>
						</el-tooltip>
					</template>
				</el-table-column>
				
				<!-- <el-table-column prop="jbNum" align="center" width="80" label="加班">
					<template slot-scope="scope"> {{scope.row.jbNum?scope.row.jbNum+'天':''}} </template>
				</el-table-column>
				<el-table-column prop="qjNum" align="center" width="80" label="请假">
					<template slot-scope="scope"> {{scope.row.qjNum?scope.row.qjNum+'天':''}} </template>
				</el-table-column> -->
				<el-table-column prop="ycqNum" align="center" width="80" label="计薪">
					<template slot-scope="scope">
						<el-tooltip effect="dark" placement="top" :content="`${'加班：'+scope.row.jbNum+'天'},${'请假：'+scope.row.qjNum+'天'}，${'夜班：'+scope.row.ybDays+'天'}`">
							<el-tag size="small">{{scope.row.zcqNum+'天'}}</el-tag>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="sum" align="center" width="120" label="需补班/可提加班">
					<template slot-scope="scope">
						<el-tag size="small" type="success" v-if="scope.row.sum-scope.row.ybDays/4 >= 1">可提加班{{scope.row.sum-scope.row.ybDays/4}}天</el-tag>
						<el-tag size="small" type="danger" v-else-if="scope.row.sum<0">需补班{{scope.row.sum*-1}}天</el-tag>
					</template>
				</el-table-column>
				<el-table-column fixed="right" min-width="310" align="left" label="操作">
					<template slot-scope="scope" v-if="isAdmin || scope.row.spm == nowSpm">
						<el-tooltip class="item" effect="dark" content="可以单独查看该组员的排班情况。" placement="top">
							<el-link @click="dialogPbListVisible=true;copyObj(pbData,scope.row)" :underline="false"><i class="el-icon-date"></i>查排班</el-link>
						</el-tooltip>
						<el-tooltip style="margin-left: 10px;" class="item" effect="dark" content="组员开始安灯排班、取消安灯排班、信息调整时,进行此操作。" placement="top">
							<el-link @click="dialogInfoFormVisible=true;copyObj(infoForm,{...scope.row,zdyPb:(scope.row.zdyPb||{})})" type="primary" :underline="false"><i class="el-icon-date"></i>员工信息</el-link>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="修改后的排班无法被安灯排班覆盖, 请谨慎操作。" placement="top">
							<el-link style="margin-left: 10px;" @click="dialogPbFormVisible=true;copyObj(pbForm,{...scope.row,datas:[]})" type="warning" :underline="false"><i class="el-icon-edit"></i>调整排班</el-link>
						</el-tooltip>
						<el-popconfirm v-if="scope.row.name != nowSpm" :title="`确定要将组员${scope.row.name}移出本组吗？`" @confirm="outUser(scope.row._id)" >
							<el-tooltip slot="reference" class="item" effect="dark" content="已离职或者分配到别组以及误认领的组员,进行此操作。" placement="top">
								<el-link style="margin-left: 10px;" type="danger" :underline="false"><i class="el-icon-delete"></i>移出</el-link>
							</el-tooltip>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog :title="`${pbForm.name}排班调整`" width="800px" :visible.sync="dialogPbFormVisible">
			<el-form v-for="form,index in pbForm.datas" :ref="'pbForm'+index" :key="index" :inline="true" :model="form" size="mini">
				<el-form-item prop="date" label="调整日期" :rules="[{ required: true, message: '调整日期不能为空'}]">
					<el-date-picker style="width: 140px;" v-model="form.date" value-format="yyyy-MM-dd" type="date" placeholder="选择日期">
					</el-date-picker>
				</el-form-item>
				<el-form-item prop="mode" label="调整类型" :rules="[{ required: true, message: '调整类型不能为空'}]">
					<el-select style="width: 130px;" v-model="form.mode" placeholder="请选择调整班次" filterable >
						<el-option label="清理班次" value="清理"></el-option>
						<el-option label="请假/调休" value="事"></el-option>
						<!-- <el-option label="加班" value="加班"></el-option> -->
						<el-option label="申请不打卡" value="不打卡"></el-option>
						<template v-for="item in codes">
							<el-option v-if="item.name!='不打卡'&&item.name!='事'" :key="item.name" :value="item.name">
								<el-tooltip effect="dark" :content="item.dateStr" placement="right">
									<span style="display: block;">{{item.name}}</span>
								</el-tooltip>
							</el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item prop="overtime" label="强制设定加班班次" v-if="form.date&&form.mode=='加班'&&pbForm.pbData[form.date].indexOf('休')>-1" :rules="[{ required: true, message: '加班日期班次为休，请修改为正常班次。'}]" >
					<el-select style="width: 130px;" v-model="form.overtime" placeholder="请选择加班班次" filterable >
						<template v-for="item in codes">
							<el-option v-if="item.name!='不打卡'&&item.name!='事'&&item.name!='休'" :key="item.name" :value="item.name">
								<el-tooltip effect="dark" :content="item.dateStr" placement="right">
									<span style="display: block;">{{item.name}}</span>
								</el-tooltip>
							</el-option>
						</template>
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="* 所选日期当前班次" v-if="form.mode!='加班' || pbForm.pbData[form.date].indexOf('休')==-1" >
					<el-input style="width: 130px;" :value="pbForm.pbData[form.date]&&pbForm.pbData[form.date].replace(/\*/g,'')" readonly ></el-input>
				</el-form-item> -->
				<el-form-item label="">
					<el-button type="danger" icon="el-icon-minus" @click="pbForm.datas.splice(index,1)" circle ></el-button>
				</el-form-item>
			</el-form>
			<el-button size="mini" @click="pbForm.datas.push({date:'',mode:'事',overtime:''})" icon="el-icon-circle-plus-outline" style="width: 100%;text-align: center;">增加</el-button>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogPbFormVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="savePbChange">提 交</el-button>
			</div>
		</el-dialog>
		<el-dialog title="批量排班调整" width="900px" :visible.sync="dialogPbsFormVisible">
			<el-form v-for="form,index in pbsForm" :ref="'pbsForm'+index" :key="index" :inline="true" :model="form" size="mini">
				<el-form-item prop="_ids" label="调整员工" :rules="[{ required: true, message: '调整员工不能为空'}]">
					<el-select v-model="form._ids" placeholder="请选择调整员工" filterable multiple collapse-tags style="width: 200px;" >
						<template v-for="item,i in dbDatas">
							<el-option  v-if="isAdmin||item.spm==nowSpm" :key="i" :label="item.name" :value="item._id"> </el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item prop="dates" label="调整日期" :rules="[{ required: true, message: '调整日期不能为空'}]">
					<el-date-picker v-model="form.dates" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 230px;"></el-date-picker>
				</el-form-item>
				<el-form-item prop="value" label="调整班次" :rules="[{ required: true, message: '调整班次不能为空'}]">
					<el-select v-model="form.value" placeholder="请选择调整班次" filterable style="width: 120px;" >
						<el-option label="清理班次" value="清理"></el-option>
						<el-option label="请假/调休" value="事"></el-option>
						<!-- <el-option label="加班" value="加班"></el-option> 批量排班调整暂不支持加班-->
						<template v-for="item in codes">
							<el-option v-if="item.name!='不打卡'&&item.name!='事'" :key="item.name" :value="item.name">
								<el-tooltip effect="dark" :content="item.dateStr" placement="right">
									<span style="display: block;">{{item.name}}</span>
								</el-tooltip>
							</el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="">
					<el-button type="danger" icon="el-icon-minus" @click="pbsForm.splice(index,1)" circle ></el-button>
				</el-form-item>
			</el-form>
			<el-button size="mini" @click="pbsForm.push({_ids:[],dates:[],value:''})" icon="el-icon-circle-plus-outline" style="width: 100%;text-align: center;">增加</el-button>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogPbsFormVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="savePbsChange">提 交</el-button>
			</div>
		</el-dialog>
		<el-dialog :title="infoForm._id?`【${infoForm.name}】信息调整`:'新员工入职'" :visible.sync="dialogInfoFormVisible">
			<el-form ref="infoForm" :model="infoForm" size="mini" label-width="100px">
				<el-form-item prop="name" label="姓名" :rules="[{ required: true, message: '必填'}]">
					<el-col :span="11">
						<el-input v-model="infoForm.name" :readonly="infoForm._id?true:false" ></el-input>
					</el-col>
					<el-col class="line" :span="2" style="text-align: center;">组长</el-col>
					<el-col :span="11">
						<el-select size="mini"
							v-model="infoForm.spm"
							:disabled="!isAdmin&&infoForm._id"
							style="width: 100%;"
							placeholder="选择组长">
							<el-option label="特殊(不归属组)" value="特殊"></el-option>
							<el-option v-for="item,i in outherSpms" :key="'-'+i" :label="item.spm" :value="item.spm"> </el-option>
						</el-select>
					</el-col>
				</el-form-item>
				<el-form-item prop="phone" label="电话号码" :rules="[{ required: true, message: '必填'}]">
					<el-input v-model="infoForm.phone"></el-input>
				</el-form-item>
				<el-form-item prop="joinDate" label="入职日期" :rules="[{ required: true, message: '必填'}]">
					<el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd" v-model="infoForm.joinDate" style="width: 100%;"></el-date-picker>
				</el-form-item>
				<el-form-item prop="isAdon" v-if="infoForm._id" label="p账号" :rules="[{ required: infoForm.isAdon, message: '安灯开始排班时间不为空则必填'}]">
					<el-input v-model="infoForm.pName"></el-input>
				</el-form-item>
				<el-form-item v-if="infoForm._id" label="安灯排班时间">
					<el-col :span="11">
						<el-date-picker type="date" placeholder="开始日期(无排班请留空)" value-format="yyyy-MM-dd" v-model="infoForm.isAdon" style="width: 100%;"></el-date-picker>
					</el-col>
					<el-col class="line" :span="2" style="text-align: center;">至</el-col>
					<el-col :span="11">
						<el-date-picker type="date" placeholder="结束日期(可留空)" value-format="yyyy-MM-dd" v-model="infoForm.andonDateOut" style="width: 100%;"></el-date-picker>
					</el-col>
				</el-form-item>
				<el-form-item v-if="infoForm._id" label="在职状态">
					<el-radio-group v-model="infoForm.isJob">
						<el-radio :label="true">正常在职</el-radio>
						<el-radio :label="false">已离职或已确定离职日期</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="离职日期" prop="outDate" :rules="[{ required: true, message: '必填'}]" v-if="!infoForm.isJob">
					<el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd" v-model="infoForm.outDate" style="width: 100%;"></el-date-picker>
				</el-form-item>
				<el-form-item label="自定义排班" v-if="isAdmin||nowSpm=='尚晨'">
					<el-col :span="7">
						<el-date-picker type="date" placeholder="开始日期(不用则留空)" value-format="yyyy-MM-dd" v-model="infoForm.zdyPb.start" style="width: 100%;"></el-date-picker>
					</el-col>
					<el-col class="line" :span="1" style="text-align: center;">至</el-col>
					<el-col :span="7">
						<el-date-picker type="date" placeholder="结束日期(可留空)" value-format="yyyy-MM-dd" v-model="infoForm.zdyPb.end" style="width: 100%;"></el-date-picker>
					</el-col>
					<el-col class="line" :span="2" style="text-align: center;">班次</el-col>
					<el-col :span="7">
						<el-select v-model="infoForm.zdyPb.value" placeholder="自定义班次">
							<el-option v-for="item in codes" :key="item.name" :label="item.name" :value="item.name"></el-option>
						</el-select>
					</el-col>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogInfoFormVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="saveInfoChange">提 交</el-button>
			</div>
		</el-dialog>
		
		<el-dialog :title="`【${pbData.name}】的排班信息`" width="700px" :visible.sync="dialogPbListVisible">
			<el-calendar class="pb-list-calendar" style="margin-top: -30px;margin-bottom: -30px;">
				<template
					slot="dateCell"
					slot-scope="{date, data}">
					<div class="pb-list-cell">
						<p class="cell-date">{{date.format('DD')}}</p>
						<p v-if="pbData.pbData[data.day]" :style="getStyle(pbData,data.day)">{{pbData.pbData[data.day].replace(/\*/g,'')}} <span v-if="pbData.visaFree&&pbData.visaFree[data.day]" style="color: #009688;font-size: 12px;">(免签)</span></p>
					</div>
				</template>
			</el-calendar>
		</el-dialog>
		
		<el-dialog title="加班数据导入确认" :visible.sync="jbSaveData">
			<el-form ref="infoForm" :model="infoForm" size="mini" label-width="100px" style="max-height: 300px;overflow: auto;">
				<el-form-item v-for="obj,key in jbSaveData" :key="key" :label="obj.name" style="margin-bottom: 3px;">
					<el-tag size="mini" style="margin-right: 5px;" v-for="val,date in obj.isOvertime" :key="date">{{date}}</el-tag>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="jbSaveData = null">取 消</el-button>
				<el-button size="mini" type="primary" @click="updatePbData(jbSaveData);jbSaveData = null">提 交</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Heard from '../components/heard.vue'
import XLSX from 'xlsx'
export default {
	name: 'count',
	components:{'h-eard':Heard},
	data(){
		return {
			isAdmin:false,//是否管理员
			codes:[],
			date_:[],//查询日期范围
			spms:[],
			outherSpms:[],
			selSpm:'',
			selSpms:[],
			dbDatas:[],
			normWork:[],
			nowSpm:'',//当前spm组长
			userid:'',//当前登录用户id
			qjDate:new Date(),//请假日期
			dialogPbFormVisible:false,//排班调整弹出组件是否显示
			pbForm:{_id:'',name:'',sum:0,pbData:{},datas:[]},//排班调整表单
			dialogInfoFormVisible:false,//排班调整弹出组件是否显示
			infoForm:{_id:'',name:'',spm:'',phone:'',pName:'',isAdon:'',andonDateOut:'',isJob:'',joinDate:'',outDate:'',zdyPb:{}},//组员信息调整表单
			dialogPbsFormVisible:false,
			pbsForm:[],//批量修改排班数据
			dialogPbListVisible:false,//组员排班数据是否显示
			pbData:{name:'',pbData:{},isOvertime:{},visaFree:{}},//组员排班数据
			jbSaveData:null,//加班导入确认数据
		}
	},
	async created() {
		let load = this.$loading();
		
		let pow = await this.$getUser();
		this.isAdmin = pow.isAdmin;
		this.nowSpm = pow.spm||'';
		pow.spm&&this.selSpms.push(pow.spm);
		this.userid = pow.user.user.uid;
		this.$db = this.$tcb.database();
		
		this.codes = (await this.$db.collection('cms-gyy-pbcode').limit(100).orderBy('name','asc').get()).data;
		await this.getPbDate();
		
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
		datas(){//实时计算的数据
			let list = [];
			for(let index in this.dbDatas) {
				let user = this.dbDatas[index];
				if((!user.spm && !this.isAdmin) || (this.selSpms.length!=0 && !this.selSpms.includes(user.spm))) continue;
				let obj = {
					...user,
					index:index-0+1,
					noun:user.noun||0,
					reason:user.reason||[],
					sum:(user.noun||0),//修正值，默认0
					isOvertime:user.isOvertime||{},//加班日期对象
					visaFree:user.visaFree||{},
					night:0,
					ybDays:0,//夜班总天数
					ycqNum:0,//应出勤
					zcqNum:0,//总出勤
					jbNum:0,//加班
					qjNum:0,//请假
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
							t = 1.25;
							obj.night++;
							obj.noun += 0.25;
						}
						if(val == '事') obj.qjNum++;
						if((user.isOvertime||{})[ymd]){
							obj.jbNum++;
							t = 0;//加班不算出勤
						}
						let cqObj = {//出勤判断
							cq:(val!='休'?t:0),//出勤
							zj:(normVal=='不打卡'?1:0),//标准
							cz:(normVal=='不打卡'?(val!='休'?(t-1):-1):(val!='休'?t:0))
						}
						for(let key in cqObj){
							obj[ym+key] = obj[ym+key]?(obj[ym+key]+cqObj[key]):cqObj[key];
							if(key == 'cq')obj.zcqNum += cqObj[key];//总实际出勤
							if(key == 'cz')obj.sum += cqObj[key];//计算总计差值
							if(key == 'zj')obj.ycqNum += cqObj[key];//总计出勤天数（计薪天数）
						}
					}
				}
				list.push(obj);
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
		},
		phoneObj(){
			let obj = {};
			this.dbDatas.map(user=>{
				obj[user.phone] = user._id;
			});
			return obj;
		},
		outherUsers(){
			let list = [];
			for(let user of this.dbDatas) {
				if(!user.spm && user.name!='李晓利')list.push(user);
			}
			return list;
		}
	},
	watch: {
		'infoForm.isJob':function(n){
			if(n) this.infoForm.outDate = '';
		}
	},
	methods: {
		async getPbDate(){
			let user = await this.$db.collection('cms-gyy-user').limit(1000).get();
			this.dbDatas = user.data;
			for (let u of user.data) {
				if(u.spm == u.name && !u.userid) this.spms.push(u);
				if(u.spm == u.name) this.outherSpms.push(u);
				if(u.name == '李晓利'){this.normWork = u.pbData;}
			}
		},
		async bindSpm(){
			if(this.selSpm){
				this.$confirm('绑定账号后暂时无法解绑，需谨慎操作。继续请确认。').then(async () => {
					await this.$db.collection('cms-gyy-user').doc(this.selSpm).update({userid:this.userid});
					this.$router.go(0);
				});
			}else{
				this.$message({message: `请先选择需要绑定的人员`,type: 'error'});
			}
		},
		setPbObj(obj,value,ymd){//写入单个排班对象
			if(value=='加班'){//加班
				obj.isOvertime[ymd] = true;
			}else if(value=='不打卡'){//免签到
				obj.visaFree[ymd] = true;
			}else if(value=='清理'){//清理
				obj.pbData[ymd] = '';
				obj.isOvertime[ymd] = this.$db.command.remove();
				obj.visaFree[ymd] = this.$db.command.remove();
			}else{//强制修改排班
				obj.pbData[ymd] = `*${value}*`;//写入更改排班
			}
			obj.updateTime = new Date();//更新时间
		},
		async updatePbData(saveObj){//更新数据库对象
			let load = this.$loading(),promiseArr = [];
			for(let key in saveObj){
				promiseArr.push(this.$db.collection('cms-gyy-user').doc(key).update(saveObj[key]));
			}
			let res = await Promise.all(promiseArr);//等待全部处理成功
			console.log(res);
			await this.getPbDate();//刷新数据
			load.close();
			this.$message({
				message: '排班信息调整成功',
				type: 'success',
			});
		},
		async savePbChange(){//保存排班信息修改
			if(this.pbForm.datas.length==0) return;
			for (let index in this.pbForm.datas) {
				if(!await this.$refs['pbForm'+index][0].validate().catch(()=>{1;})) return this.$message({message: `请检查必填项`,type: 'error'});
			}
			let obj = {pbData:{},isOvertime:{},visaFree:{}};
			for (let item of this.pbForm.datas) {
				//if(item.mode=='加班'&&this.pbForm.pbData[item.date]=='休') obj.pbData[item.date] = `*${item.overtime}*`;//休息日加班需强制调整。
				this.setPbObj(obj,item.mode,item.date);//写入单个排班到obj
			}
			await this.updatePbData({[this.pbForm._id]:obj});
			this.dialogPbFormVisible = false;
		},
		async savePbsChange(){//批量修改排班
			if(this.pbsForm.length==0) return;
			let saveData = {};
			for (let index in this.pbsForm) {
				let form = this.pbsForm[index]
				if(!await this.$refs['pbsForm'+index][0].validate().catch(()=>{1;})) return this.$message({message: `请检查必填项`,type: 'error'});
				
				let obj = {pbData:{},isOvertime:{}},nowDate = new Date(form.dates[0]);//new一个新的时间对象，避免数据跟着变
				while(nowDate <= form.dates[1]){//对日期进行循环
					this.setPbObj(obj,form.value,nowDate.format());//写入单个排班到obj
					nowDate.setDate(nowDate.getDate()+1);//加一天
				}
				for (let _id of form._ids) {//遍历用户写入日期班次情况
					if(saveData[_id]){//已存在的用户，需要合并
						for (let key in obj) {//对pbData和isOvertime进行叠加合并操作
							Object.assign(saveData[_id][key],obj[key]);
						}
					}else{//否则直接赋值即可
						saveData[_id] = obj;
					}
				}
			}
			await this.updatePbData(saveData);//批量保存到数据库
			this.dialogPbsFormVisible = false;
		},
		async saveInfoChange(){//保存组员基本信息修改
			if(!await this.$refs.infoForm.validate().catch(()=>{1;})) return this.$message({message: `请检查必填项`,type: 'error'});
			let {_id,...obj} = this.infoForm;
			let load = this.$loading();
			let result;
			if(_id){//修改
				result = await this.$db.collection('cms-gyy-user').doc(_id).update(obj);
			}else{//新增
				let pbData = {};
				for (let date of this.sDateList) {//新员工当月默认早班
					if(new Date(obj.joinDate) <= new Date(date)){//入职日期之后的日期
						pbData[date] = (this.normWork[date].replace(/\*/g,'') == '休'?'休':'早');
					}
				}
				result = await this.$db.collection('cms-gyy-user').add({...obj,pbData,visaFree:{[obj.joinDate]:true}});
			}
			console.log(result);
			await this.getPbDate();//刷新数据
			load.close();
			this.$message({
				message: '信息处理成功',
				type: 'success',
			});
			this.dialogInfoFormVisible = false;
		},
		async outUser(_id){
			let load = this.$loading();
			await this.$db.collection('cms-gyy-user').doc(_id).update({spm:''});
			await this.getPbDate();//刷新数据
			load.close();
			this.$message({
				message: '组员已离组',
				type: 'success'
			});
		},
		async addUser(_id){
			let load = this.$loading();
			await this.$db.collection('cms-gyy-user').doc(_id).update({spm:this.nowSpm});
			await this.getPbDate();//刷新数据
			load.close();
			this.$message({
				message: '认领组员成功',
				type: 'success'
			});
		},
		async deleteUser(_id){//删除用户
			let load = this.$loading();
			await this.$db.collection('cms-gyy-user').doc(_id).remove();
			await this.getPbDate();//刷新数据
			load.close();
			this.$message({
				message: '用户已删除',
				type: 'success'
			});
		},
		async importJb(file){
			let _this = this;
			readWorkbookFromLocalFile(file.raw,async function(e){
				let jbDatas = XLSX.utils.sheet_to_json(e.Sheets[e.SheetNames[0]]);
				let saveData = {},nowMonth = new Date(_this.date_[0]).getMonth()+1;
				for(let obj of jbDatas){
					let oldDate = new Date(obj['加班日期']);
					oldDate.setDate(oldDate.getDate()+1)
					let _id = _this.phoneObj[obj['手机']], date = oldDate.format();
					if(_id && nowMonth == new Date(date).getMonth()+1){//只导入手机号存在且属于当前月份的
						if(saveData[_id]){
							saveData[_id].isOvertime[date] = true;
						}else{
							saveData[_id] = {isOvertime:{[date]:true},name:obj['姓名']};
						}
					}
				}
				_this.jbSaveData = saveData;
			})
			function readWorkbookFromLocalFile(file, callback) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {type: 'binary',cellDates: true});
					if(callback) callback(workbook);
				};
				reader.readAsBinaryString(file);
			}
		},
		copyObj(obj,formObj){
			for (let key in obj) {
				obj[key] = formObj[key]==undefined?'':formObj[key];
			}
			return obj;
		},
		getStyle(d,date){
			let bc_obj = {};
			if(d.isOvertime[date]){//加班
				bc_obj = {color:'#FF9800'};
			}else{
				bc_obj = {
					'休':{color:'#8bc34a'},
					'事':{color:'#2196f3'},
					'夜班':{color:'red'}
				}[d.pbData[date].replace(/\*/g,'')]
			}
			return bc_obj;
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.content{padding-top: 40px;}
	.el-table{z-index: 11;}
	.pb-list-cell>p {text-align: center;margin: 0;}
	.pb-list-cell .cell-date {margin: 0;font-size: 20px;}
</style>
<style>
	.pb-list-calendar .el-calendar__body {padding-top: 0;}
	.pb-list-calendar .el-calendar-table .el-calendar-day {height: 60px;}
</style>
