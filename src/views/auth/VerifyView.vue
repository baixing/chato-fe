<template>
  <div class="title">
    {{ $t('内测名额有限，排队人数众多，即将完成审核，请稍后...') }}
  </div>

  <el-progress type="circle" :percentage="progress" color="#409EFF">
    <template #default="{ percentage }">
      <span class="percentage-value">{{ (100 - percentage) / 10 }}</span>
    </template>
  </el-progress>
</template>
<script setup>
import { ElNotification as Notification } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const progress = ref(0)
const router = useRouter()

const timer = setInterval(() => {
  progress.value += 10
  if (progress.value >= 100) {
    timer && clearInterval(timer)
    Notification.success(t('审核通过'))
    router.replace(`/resource`)
  }
}, 1000)
</script>
<style lang="scss" scoped>
.title {
  font-size: 14px;
  font-weight: 400;
  color: #3d3d3d;
  margin-top: 150px;
  margin-bottom: 216px;
}
</style>
