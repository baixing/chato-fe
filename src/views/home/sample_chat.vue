<template>
  <div class="centered-div">测试页面</div>
</template>
<style lang="scss" scoped>
.centered-div {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background-color: #f134;
}
</style>
<script setup lang="ts">
const blockDivs = document.querySelectorAll('.block')
blockDivs.forEach((div) => (div.style.display = 'none'))

const url = window.location.pathname
let number = url.substring('/sample_chat'.length)
const seoDiv = document.getElementById('block' + number)
seoDiv.style.display = ''
</script>
