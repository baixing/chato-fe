<template>
  <div class="page-container">
    <div class="logoContainer">
      <img src="@/assets/img/logo-header.png" alt="" class="logo" />
    </div>
    <el-card class="card" shadow="never">
      <h1>{{ $t('即将离开当前网站') }}</h1>
      <p class="info">
        {{ $t('您即将离开当前网站，请确认您的帐号和财产安全。') }}
      </p>
      <a class="link" :href="target">{{ target }}</a>
      <el-divider></el-divider>
      <a :href="target" style="display: flex; justify-content: flex-end">
        <el-button type="primary">{{ $t(' 继续访问 ') }}</el-button>
      </a>
    </el-card>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const target = route.query.target || '/'
</script>
<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: 100px;
}

.card {
  min-width: 300px;
  max-width: 600px;
  width: 80%;
  border-radius: 10px;
  padding: 12px;

  .info {
    font-size: 15px;
    color: #222;
    line-height: 1.5;
    margin-top: 10px;
    margin-bottom: 12px;
  }

  .link {
    font-size: 15px;
    color: #222;
    line-height: 1.5;
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
}

.logoContainer {
  display: flex;
  flex-direction: row;
  min-width: 300px;
  max-width: 600px;
  width: 80%;
}

.logo {
  width: 100px;
  margin-bottom: 15px;
}
</style>
