<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
	name: 'App',
	async created(){
	}
}
</script>
<style>
	html,body{
		margin: 0;
		padding: 0;
	}
	::-webkit-scrollbar {width: 5px;height: 10px;}
	::-webkit-scrollbar-thumb {border-radius: 5px;-webkit-box-shadow: inset005pxrgba(0, 0, 0, 0.2);background: rgba(0, 0, 0, 0.2);}
	::-webkit-scrollbar-track {-webkit-box-shadow: inset005pxrgba(0, 0, 0, 0.2);border-radius: 0;background: rgba(0, 0, 0, 0.1);}
</style>