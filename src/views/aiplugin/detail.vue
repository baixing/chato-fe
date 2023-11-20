<template>
  <div class="overflow-y-auto h-full bg-gray-100">
    <Topbar :title="t('小红书')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <div class="p-4 max-w-7xl mx-auto">
        <div class="flex flex-row justify-between">
          <div class="flex flex-row items-center space-x-4">
            <img :src="accountInfo.avatar || DefaultAvatar" class="w-10 h-10 rounded-full" />
            <h2 class="text-xl font-semibold" v-html="accountInfo.title"></h2>
          </div>
          <div class="flex items-center">
            <img :src="XHSLogo" class="w-[67px] h-[24px]" />
          </div>
        </div>

        <h1 class="mt-10">评论机器人</h1>

        <div
          class="grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mt-4"
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
            class="bg-white rounded-lg min-h-[150px] leading-5 flex flex-col gap-4 transition cursor-pointer h-full hover:shadow-lg hover:-translate-y-2 lg:p-4 lg:gap-3 lg:h-auto lg:hover:-translate-y-0"
            v-for="rb in robots"
            :key="rb.slug"
            @click="selectRobot(rb.slug)"
            :class="{ highlight: selectedDomainSlug === rb.slug }"
          >
            <div class="flex flex-row gap-4 items-center ml-5 mt-5">
              <img :src="rb.avatar" alt="Robot Avatar" class="w-10 h-10 rounded-full" />
              <div class="font-bold">{{ rb.name }}</div>
            </div>

            <div
              class="ml-5 text-lg leading-5 line-clamp-2 break-all whitespace-pre-wrap h-10 lg:h-auto"
              style="color: #b5bed0"
            >
              {{ rb.system_prompt }}
            </div>

            <div class="flex items-center justify-between ml-5">
              <p
                @click="editRobot(rb.slug)"
                class="text-sm text-[#B5BED0] hover:text-blue-700 focus:outline-none"
              >
                编辑
              </p>
            </div>
          </div>
        </div>

        <!-- Menu -->
        <div class="flex justify-between mt-10">
          <div class="flex space-x-4 justify-center items-center">
            <h1
              :class="{ ' text-[#7C5CFC] ': selectedMenu === 'posts' }"
              @click="selectMenu('posts')"
              class="cursor-pointer rounded transition-colors"
            >
              帖子列表
            </h1>
            <h1
              :class="{ 'text-[#7C5CFC]': selectedMenu === 'history' }"
              @click="selectMenu('history')"
              class="cursor-pointer rounded transition-colors"
            >
              评论列表
            </h1>
          </div>
        </div>

        <!-- History -->
        <div v-if="selectedMenu == 'history'" class="mt-4">
          <div
            v-for="h in history"
            :key="h.domain_slug"
            class="flex flex-row mb-4 p-4 border rounded shadow-sm"
          >
            <div class="my-2 px-2 min-h-[190px] max-w-[140px] w-1/4 overflow-hidden">
              <div class="relative">
                <img
                  :src="proxyImageUrl(h.image)"
                  alt="Card image"
                  class="w-full h-48 object-cover cursor-pointer rounded-xl"
                />
              </div>
              <div class="cursor-pointer" @click="openXHSNote(h.note_id)">
                <div class="flex items-center mb-2 mt-2">
                  <img :src="h.created_avatar" alt="Avatar" class="w-10 h-10 rounded-full mr-2" />
                  <div class="flex flex-row justify-between w-full items-center text-xs">
                    <p class="text-gray-500">{{ h.created_nickname }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col ml-2">
              <div class="flex items-center space-x-2 mb-2">
                <img :src="h.avatar || DefaultAvatar" class="w-6 h-6 rounded-full" />
                <p class="font-semibold">
                  {{ h.name }}
                </p>
              </div>
              <p class="text-gray-600 text-sm">
                <a
                  :href="`https://www.xiaohongshu.com/explore/${h.note_id}`"
                  target="_blank"
                  class="text-inherit no-underline"
                >
                  {{ h.comment }}
                </a>
              </p>
              <p class="text-gray-500 text-xs mt-4">
                {{ formatDate(h.created) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div v-if="selectedMenu == 'posts'">
          <div class="flex flex-row items-center w-1/2">
            <el-input
              v-model="searchQuery"
              placeholder="探索更多内容"
              class="mb-4 mt-4 text-[#9DA3AF]"
              style="border-radius: 9999px"
              @input="handleSearch"
            />
            <el-button class="ml-2" type="primary" @click="handleCommentButtonClick"
              >评论</el-button
            >
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
            <p
              v-for="tag in tags"
              :key="tag"
              :class="[
                'px-4 py-2  font-medium transition-colors duration-150  rounded-full',
                selectedTag === tag ? 'bg-white text-black' : 'bg-gray-100 hover:bg-blue-100'
              ]"
              @click="handleTagSelection(tag)"
            >
              {{ tag }}
            </p>
          </div>
          <div class="flex flex-wrap -mx-2 overflow-hidden">
            <div v-for="card in cards" :key="card.id" class="my-2 px-2 w-1/4 overflow-hidden">
              <div class="relative">
                <img
                  :src="proxyImageUrl(card.image)"
                  alt="Card image"
                  class="w-full h-48 object-cover cursor-pointer rounded-xl"
                  @click="toggleSelection(card)"
                  :class="{ highlight: card.selected }"
                />
              </div>
              <div class="p-4 cursor-pointer" @click="openXHSNote(card.id)">
                <h3 class="text-base font-semibold">{{ card.title }}</h3>
                <div class="flex items-center mb-2 mt-2">
                  <img :src="card.avatar" alt="Avatar" class="w-10 h-10 rounded-full mr-2" />
                  <div class="flex flex-row justify-between w-full items-center text-xs">
                    <p class="text-gray-500">{{ card.accountName }}</p>
                    <div class="flex items-center">
                      <svg
                        v-if="card.liked"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="red"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="gray"
                        class="h-5 w-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>

                      <span>{{ card.liked_count }}</span>
                    </div>
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
        <el-form-item>
          <h1>机器人名字</h1>
          <el-input v-model="robotInfo.name"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="flex flex-col">
            <h1>角色设定</h1>
            <div class="mt-2">
              <span
                v-for="(tag, index) in templateTags"
                :key="index"
                class="inline-block rounded-full text-gray-700 px-3 py-1 text-sm font-semibold mr-2 mb-2 cursor-pointer"
                :class="{ 'bg-sky-100   text-[#7C5CFC] ': selectedTTag === tag }"
                @click="selectTemplate(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <el-input type="textarea" v-model="robotInfo.system_prompt" :rows="5"></el-input>
        </el-form-item>
        <el-form-item>
          <h1>置入品牌</h1>
          <el-input type="textarea" v-model="robotInfo.brand_name"></el-input>
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
import XHSLogo from '@/assets/img/xhs-logo.png'
import { currentEnvConfig } from '@/config'
import { useDomainStore } from '@/stores/domain'
import { ElMessageBox } from 'element-plus'
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
const templateTags = ref(['好物分享', '经验分享', '知识分享'])
const selectedTTag = ref()
const templateContent = {
  好物分享:
    'XiaoHongShu Spark将专注于创建符合小红书风格的短评论。它会根据帖子内容提供幽默且直接的回应，并在评论结尾巧妙地推荐相关产品或经验。这些评论将非常简短，大约15个字符，以轻鬆、活泼的语气进行互动。同时，XiaoHongShu Spark将始终遵守社区指南和尊重他人，即使在推广产品或分享经验时也不例外。',
  经验分享:
    '专注于为小红书帖子创建简短、幽默的评论，同时加入自己的经验分享。评论将大约15个字符，以俏皮和有趣的方式回应，有时与帖子的主题直接相关，有时则分享个人体验和建议。使用日常语言、流行语句和表情符号，以友好、亲近的方式与观众互动。在保持幽默的同时，结合自己的体验和观点，确保评论尊重并遵守平台的社区指南。在不清楚的情况下，它会选择轻鬆和普遍适用的回应，这些回应充满活力、能量和娱乐性。',
  知识分享: `XiaoHongShu Spark将专注于创建符合小红书风格的短评论。它会根据帖子内容提供幽默且直接的回应，并在评论结尾巧妙地推荐相关产品或经验。这些评论将非常简短，大约15个字符，以轻鬆、活泼的语气进行互动。同时，XiaoHongShu Spark将始终遵守社区指南和尊重他人，即使在推广产品或分享经验时也不例外。
评论口吻案例（忽略下方评论的内容，仅学习格式以及口吻）：
- 哈哈哈哈哈 可以撤回的
- 拍一拍可以撤回到
-你也太会吃了吧主页发了这么多好吃的……以后跟著你吃
-你小子怎么做的表，太叼了
-难道就我吃了没感觉吗....`
}

const robots = ref([
  {
    name: '',
    system_prompt: '',
    avatar: '',
    slug: '',
    brand_name: ''
  }
])
const robotInfo = ref({
  name: '',
  system_prompt: '',
  brand_name: ''
})
const accountInfo = ref({
  avatar: '',
  title: "点击<a href='https://www.xiaohongshu.com/explore' target='_blank'>登陆</a>小红书账号"
})
const history = ref([
  {
    name: '',
    domain_slug: '',
    org_id: '',
    comment: '',
    avatar: '',
    created: '',
    brand_name: '',
    note_id: '',
    image: '',
    liked: '',
    liked_count: '',
    created_avatar: '',
    created_nickname: ''
  }
])
const { domainList } = storeToRefs(domainStoreI)

const tags = ['推荐', '美食', '穿搭', '彩妆', '影视', '职场', '家装', '游戏', '旅游']

const cards = ref([])

function openXHSNote(id) {
  window.open(`https://www.xiaohongshu.com/explore/${id}`, '_blank')
}

function selectTemplate(tag) {
  selectedTTag.value = tag
  robotInfo.value.system_prompt = templateContent[tag]
}

function selectRobot(slug) {
  selectedDomainSlug.value = slug
}

function editRobot(slug) {
  selectedTTag.value = ''
  selectedDomainSlug.value = slug
  let r = robots.value.find((r) => r.slug == slug)
  if (!r) return
  robotInfo.value = {
    name: r.name,
    system_prompt: r.system_prompt,
    brand_name: r.brand_name
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
    system_prompt: '',
    brand_name: ''
  }
  selectTemplate('好物分享')
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
      userID: d.note_card?.user.user_id,
      liked: d.note_card?.interact_info.liked,
      liked_count: d.note_card?.interact_info.liked_count
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
  const ids = cards.value
    .filter((card) => card.selected)
    .map((card) => {
      card.selected = !card.selected
      return card.id
    })
  if (selectedDomainSlug.value == '' || ids.length == 0) {
    ElMessageBox.alert('请选中使用哪个机器人来回答，且选中要评论的笔记。', 'Oops', {
      confirmButtonText: 'OK'
    })
    return
  }
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
        userID: item.note_card.user.user_id,
        liked: item.note_card?.interact_info.liked,
        liked_count: item.note_card?.interact_info.liked_count
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
