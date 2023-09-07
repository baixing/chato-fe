<template>
  <Topbar :title="$t(`空间权益`)" />
  <div class="page-body-container">
    <div class="page-center-container page-content-container">
      <el-tabs v-model="activeTab" class="chato-tab">
        <el-tab-pane v-for="item in tabsList" :key="item.key" :label="item.label" :name="item.key">
          <component :is="item.component" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import Topbar from '@/components/Topbar/index.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SpaceRights from './components/SpaceRights.vue'
import personalSpace from './personalSpace.vue'

const { t } = useI18n()
const tabsList = [
  { label: t('版本权益'), key: 'rights', component: SpaceRights },
  { label: t('成员设置'), key: 'users', component: personalSpace }
]

const activeTab = ref('rights')
</script>
