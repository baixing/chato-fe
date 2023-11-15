<template>
  <div class="overflow-y-auto h-full bg-gray-100">
    <Topbar :title="t('小红书')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <div class="p-4 max-w-7xl mx-auto">
        <h1 v-if="!isLogin">请先安装插件，并且网页登陆小红书</h1>
        <div v-if="isLogin">
          <img :src="accountInfo.avatar" />
          <h2>{{ accountInfo.title }}</h2>
        </div>
        <el-select v-model="selectedDomainSlug" class="m-2" placeholder="Select" size="large">
          <el-option
            v-for="item in domainList"
            :key="item.id"
            :label="item.name"
            :value="item.slug"
          />
        </el-select>
        <div class="flex flex-row">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            class="mb-4 w-full lg:w-1/3"
            @input="handleSearch"
          />
          <el-button class="ml-2" type="primary" @click="handleCommentButtonClick">评论</el-button>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="tag in tags"
            :key="tag"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150',
              selectedTag === tag
                ? 'bg-blue-500 text-white'
                : 'text-blue-500 bg-white hover:bg-blue-100'
            ]"
            @click="handleTagSelection(tag)"
          >
            {{ tag }}
          </button>
        </div>
        <div class="flex flex-wrap -mx-2 overflow-hidden">
          <div v-for="card in cards" :key="card.id" class="my-2 px-2 w-1/2 overflow-hidden">
            <div class="relative">
              <div
                v-if="card.selected"
                class="absolute inset-0 bg-black bg-opacity-25 z-10"
                @click="toggleSelection(card)"
              ></div>
              <img
                :src="proxyImageUrl(card.image)"
                alt="Card image"
                class="w-full h-48 object-cover cursor-pointer"
                @click="toggleSelection(card)"
              />
            </div>
            <div class="p-4">
              <div class="flex items-center mb-2">
                <img :src="card.avatar" alt="Avatar" class="w-10 h-10 rounded-full mr-2" />
                <div>
                  <h3 class="text-lg font-semibold">{{ card.title }}</h3>
                  <p class="text-gray-500 text-sm">{{ card.accountName }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  </div>
</template>

<script setup lang="ts">
import { currentEnvConfig } from '@/config'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ContentLayout from '../../layout/ContentLayout.vue'
import request from '../../utils/request'

const domainStoreI = useDomainStore()

const { t } = useI18n()
const searchQuery = ref('')
const selectedTag = ref('推荐')
const selectedDomainSlug = ref('')
const isLogin = ref(false)
const accountInfo = ref({
  avatar: '',
  title: ''
})
const { domainList } = storeToRefs(domainStoreI)

const tags = ['推荐', '美食', '穿搭', '彩妆', '影视', '职场', '家装', '游戏', '旅游']

const cards = ref([])

function toggleSelection(card) {
  card.selected = !card.selected
}

async function getNoteByKeyword(keyword: string) {
  const res = await request({
    url: `/chato/api/v1/xhs/get_note_by_keyword?keyword=${keyword}`,
    method: 'GET'
  })
  return res.data
}

async function _handleSearch(keyword: string) {
  const res = await getNoteByKeyword(keyword)
  cards.value = []
  for (const d of res.items) {
    cards.value.push({
      id: d.id,
      title: d.note_card?.display_title,
      image: d.note_card?.image_list[0].url,
      avatar: d.note_card?.user.avatar,
      accountName: d.note_card?.user.nickname,
      userID: d.note_card?.user.user_id
    })
  }
}

async function handleSearch() {
  await _handleSearch(searchQuery.value)
}

async function handleTagSelection(tag) {
  selectedTag.value = tag
  await _handleSearch(tag)
}

async function handleCommentButtonClick() {
  if (selectedDomainSlug.value == '') {
    return
  }
  const ids = cards.value
    .filter((card) => card.selected)
    .map((card) => {
      card.selected = !card.selected
      return card.id
    })
  await request({
    url: '/chato/api/v1/xhs/comment_notes',
    method: 'POST',
    data: {
      note_ids: ids,
      domain_slug: selectedDomainSlug.value
    }
  })
}

async function getHomeFeed() {
  try {
    const res = await request({
      url: '/chato/api/v1/xhs/get_home_feed',
      method: 'GET'
    })
    for (const item of res.data.items) {
      cards.value.push({
        id: item.id,
        title: item.note_card.display_title,
        image: item.note_card.cover.info_list[0].url,
        avatar: item.note_card.user.avatar,
        accountName: item.note_card.user.nickname,
        userID: item.note_card.user.user_id
      })
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error)
  }
}

async function init() {
  getHomeFeed()
  let res = await request({
    url: '/chato/api/v1/xhs/is_login',
    method: 'GET'
  })
  isLogin.value = res.data.data.is_login
  if (isLogin.value) {
    res = await request({
      url: '/chato/api/v1/xhs/get_self_info'
    })
    console.log(111, res.data)
    let avatar = res.data.basic_info.imageb
    let title = res.data.basic_info.nickname
    accountInfo.value = {
      avatar,
      title
    }
  }
}

function proxyImageUrl(originalUrl) {
  return `${currentEnvConfig.baseURL}/chato/api/v1/xhs/image-proxy?url=${originalUrl}`
}

onMounted(() => {
  init()
})
</script>

<style scoped></style>
