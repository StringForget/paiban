<template>
	<div class="login-back">
		<div class="login-div">
			<el-form ref="form" :model="form" label-width="80px">
			  <el-form-item label="账号" :rules="[{ required: true, message: '账号不能为空'}]">
			    <el-input v-model="form.username"></el-input>
			  </el-form-item>
			  <el-form-item label="密码" :rules="[{ required: true, message: '密码不能为空'}]">
					<el-input v-model="form.password" type="password" @keyup.enter.native="onSubmit"></el-input>
			  </el-form-item>
			  <el-form-item>
			    <el-button type="primary" @click="onSubmit">立即登录</el-button>
			  </el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	
export default {
  name: 'login',
  data () {
    return {
			form:{
				username :'',
				password :''
			}
    }
  },
	methods:{
		async onSubmit(){
			if(await this.$refs['form'].validate()){
				let {username,password} = this.form;
				let state = '';
				try{
					state = await this.$auth.signInWithUsernameAndPassword(username, password);
				}catch(e){
					console.log(e);
				}
				if(state.user){
					this.$router.push('/');
				}else{
					this.$message.error('登录失败请检查用户名密码是否正确');
				}
			}
		}
	}
}
</script>

<style scoped>
.login-div {
    max-width: 500px;
    margin: 0 auto;
    margin-top: 100px;
    padding: 20px;
    background: #fff;
    box-shadow: 2px 2px 10px #9e9e9e;
    border-radius: 5px;
}
.login-back{
	box-sizing: border-box;
	background-image: url(../assets/login-back.png);
	padding: 5px;
	height: 100vh;
}
</style>
