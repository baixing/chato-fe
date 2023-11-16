<template>
  <div class="overflow-y-auto h-full bg-gray-100">
    <Topbar :title="t('小红书')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <div class="p-4 max-w-7xl mx-auto">
        <h1 v-if="!isLogin">请先安装插件，并且网页登陆小红书</h1>

        <div
          class="grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
        >
          <div
            data-script="Chato-createBot"
            class="bg-white rounded-lg min-h-[200px] leading-5 flex flex-col items-center justify-center gap-4 transition cursor-pointer h-full hover:shadow-lg hover:-translate-y-2 lg:p-4 lg:gap-3 lg:h-auto lg:hover:-translate-y-0"
            @click="openCreateDialog"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-[#F2F3F5] lg:w-10 lg:h-10"
            >
              <el-icon :size="20" class="text-[#596780]">
                <Plus />
              </el-icon>
            </div>
            <p class="font-medium text-sm text-[#7C5CFC]">{{ t('添加评论机器人') }}</p>
          </div>

          <div
            class="bg-white rounded-lg min-h-[200px] leading-5 flex flex-col items-center justify-center gap-4 transition cursor-pointer h-full hover:shadow-lg hover:-translate-y-2 lg:p-4 lg:gap-3 lg:h-auto lg:hover:-translate-y-0"
            v-for="rb in robots"
            :key="rb.slug"
            @click="selectRobot(rb.slug)"
            :class="{ highlight: selectedDomainSlug === rb.slug }"
          >
            <img :src="rb.avatar" alt="Robot Avatar" class="w-24 h-24 rounded-full" />
            <div class="font-bold">{{ rb.name }}</div>
            <div>{{ rb.system_prompt }}</div>
            <div class="flex items-center">
              <p
                @click="editRobot(rb.slug)"
                class="text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                编辑
              </p>
            </div>
          </div>
        </div>

        <!-- Menu -->
        <div class="flex justify-between mt-5">
          <div v-if="isLogin" class="flex flex-col items-center">
            <div class="flex items-center space-x-4">
              <img :src="accountInfo.avatar || DefaultAvatar" class="w-10 h-10 rounded-full" />
              <h2 class="text-xl font-semibold">{{ accountInfo.title }}</h2>
            </div>
          </div>

          <div class="flex space-x-4 justify-center items-center">
            <h1
              :class="{ 'bg-blue-500 text-white': selectedMenu === 'posts' }"
              @click="selectMenu('posts')"
              class="cursor-pointer px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition-colors"
            >
              帖子列表
            </h1>
            <h1
              :class="{ 'bg-blue-500 text-white': selectedMenu === 'history' }"
              @click="selectMenu('history')"
              class="cursor-pointer px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition-colors"
            >
              评论列表
            </h1>
          </div>
        </div>

        <!-- History -->
        <div v-if="selectedMenu == 'history'" class="mt-4">
          <div v-for="h in history" :key="h.domain_slug" class="mb-4 p-4 border rounded shadow-sm">
            <div class="flex items-center space-x-2 mb-2">
              <img :src="h.avatar || DefaultAvatar" class="w-6 h-6 rounded-full" />
              <p class="font-semibold">{{ h.name }}</p>
            </div>
            <p class="text-gray-600 text-sm">{{ h.comment }}</p>
            <p class="text-gray-500 text-xs mt-4">
              {{ formatDate(h.created) }}
            </p>
          </div>
        </div>

        <!-- Posts -->
        <div v-if="selectedMenu == 'posts'">
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
            <el-button class="ml-2" type="primary" @click="handleCommentButtonClick"
              >评论</el-button
            >
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
      </div>
    </ContentLayout>
    <el-dialog v-model="showDialog" title="评论机器人">
      <el-form>
        <el-form-item label="机器人名字">
          <el-input v-model="robotInfo.name"></el-input>
        </el-form-item>
        <el-form-item label="角色设定">
          <el-input type="textarea" v-model="robotInfo.system_prompt"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancleDialog">取消</el-button>
          <el-button type="primary" @click="confirmDialog"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
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
const showDialog = ref(false)
const selectedMenu = ref('history')
const isUpdateRobot = ref(false)

const robots = ref([
  {
    name: '',
    system_prompt: '',
    avatar: '',
    slug: ''
  }
])
const robotInfo = ref({
  name: '',
  system_prompt: ''
})
const accountInfo = ref({
  avatar: '',
  title: ''
})
const history = ref([
  {
    name: '',
    domain_slug: '',
    org_id: '',
    comment: '',
    avatar: '',
    created: ''
  }
])
const { domainList } = storeToRefs(domainStoreI)

const tags = ['推荐', '美食', '穿搭', '彩妆', '影视', '职场', '家装', '游戏', '旅游']

const cards = ref([])

function selectRobot(slug) {
  selectedDomainSlug.value = slug
}

function editRobot(slug) {
  selectedDomainSlug.value = slug
  let r = robots.value.find((r) => r.slug == slug)
  if (!r) return
  robotInfo.value = {
    name: r.name,
    system_prompt: r.system_prompt
  }
  isUpdateRobot.value = true
  showDialog.value = true
}

function toggleSelection(card) {
  card.selected = !card.selected
}

function selectMenu(typ: string) {
  selectedMenu.value = typ
  if (typ === 'history') {
    getHistory()
  }
}

function cancleDialog() {
  showDialog.value = false
  isUpdateRobot.value = true
}

function openCreateDialog() {
  showDialog.value = true
  isUpdateRobot.value = false
  robotInfo.value = {
    name: '',
    system_prompt: ''
  }
}

async function confirmDialog() {
  console.log(isUpdateRobot.value)
  if (isUpdateRobot.value) {
    await request({
      url: `/chato/api/v1/domains/update_xhs_bot/${selectedDomainSlug.value}`,
      method: 'PATCH',
      data: robotInfo.value
    })
  } else {
    await request({
      url: '/chato/api/v1/domains/create_xhs_bot',
      method: 'POST',
      data: robotInfo.value
    })
  }
  getRobots()
  showDialog.value = false
  isUpdateRobot.value = false
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

async function getHistory() {
  let res = await request({
    url: '/chato/api/v1/xhs/history',
    method: 'GET'
  })
  history.value = res.data.data.history
}

async function getRobots() {
  let res = await request({
    url: '/chato/api/v1/domains/xhs_bots',
    method: 'GET'
  })
  robots.value = res.data.data
}

async function init() {
  getHomeFeed()
  let res = await request({
    url: '/chato/api/v1/xhs/is_login',
    method: 'GET'
  })
  isLogin.value = res.data.data.is_login
  getHistory()
  getRobots()
  if (isLogin.value) {
    res = await request({
      url: '/chato/api/v1/xhs/get_self_info',
      method: 'GET'
    })
    let avatar = res.data.basic_info.imageb
    let title = res.data.basic_info.nickname
    accountInfo.value = {
      avatar,
      title
    }
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function proxyImageUrl(originalUrl) {
  return `${currentEnvConfig.baseURL}/chato/api/v1/xhs/image-proxy?url=${originalUrl}`
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.highlight {
  border: 2px solid #f00; /* Change this to your preferred highlight color */
}
</style>
