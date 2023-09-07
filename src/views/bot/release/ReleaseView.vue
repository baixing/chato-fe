<script setup lang="ts">
import { getCreateSites } from '@/api/iframe'
import {
  createPublic as createPublicApi,
  editPublic as editPublicApi,
  getBrandDomain,
  getPublicCodeImg,
  getPubliclist,
  getWeixinPublicRobotQrCode,
  postWeixinPublicInviteLarge,
  postWeixinPublicInviteMini,
  serachPublicCreateStatus
} from '@/api/release'
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import { ChatBubbleColorList } from '@/constant/chat'
import { ECreatePublicText } from '@/constant/release'
import { brandCreateEditStatusType, brandDomainStatusType } from '@/enum/domain'
import { ECreatePublicType, ETabPublicType } from '@/enum/release'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type {
  PlatFormListProps,
  RobotQrCodeInfoProps,
  brandDomainTypeKeyFile,
  createSitesChannelsRes,
  weixinCreateConfigType
} from '@/interface/release'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { copyPaste } from '@/utils/help'
import {
  CirclePlus,
  CopyDocument,
  Document,
  FullScreen,
  Tools,
  UploadFilled,
  View
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { ElLoading, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PlatFormList from './components/PlatFormList.vue'
import ReleaseBox from './components/ReleaseBox.vue'
import SerachApi from './components/apiCall/SerachApi.vue'
import ApplicationForm from './components/application/ApplicationForm.vue'
import BrandDomain from './components/brandDomain/BrandDomainIndex.vue'
import CreateFeishu from './components/feishuPublic/CreateFeishu.vue'
import DrawerSite from './components/implantJs/DrawerSite.vue'
import SetEffectSite from './components/implantJs/SetEffectSite.vue'
import OfficialAccont from './components/officialAccount/OfficialAccont.vue'
import EmPower from './components/tiktok/EmPower.vue'
import Copylink from './components/webPage/Copylink.vue'
import CreatePublic from './components/weixinPublic/CreatePublic.vue'
import DrawerPublic from './components/weixinPublic/DrawerPublic.vue'
import PublicImgPreview from './components/weixinPublic/PublicImgPreview.vue'
import WeixinService from './components/weixinService/WeixinService.vue'

const { t } = useI18n()
interface CurrentRowI {
  qrcode_data: string
  room_id?: string
}

const route = useRoute()
const base = useBase()
const spaceStoreI = useSpaceStore()
const domainStoreI = useDomainStore()
const { userInfo, orgInfo, userCommercialType } = storeToRefs(base)
const { currentRights } = storeToRefs(spaceStoreI)
const { domainInfo } = storeToRefs(domainStoreI)
const userRoute = `/t/bot/${domainInfo.value.id}/user`
const botSlug = computed(() => domainInfo.value.slug)
const chatWebPageBaseURL = `${currentEnvConfig.wwwBaseURL}`
const chatReleaseURL = computed(() => {
  return {
    chatWebPage: `${chatWebPageBaseURL}/b/${botSlug.value}`,
    chatAPI: getChatAPI(currentEnvConfig.baseURL, botSlug.value),
    chato_script_checkDomain: `${currentEnvConfig.baseURL}/chato/api/v1/domains/${botSlug.value}/whitelist_sites/check`
  }
})
const chatScript = `${currentEnvConfig.scriptURL}/assets/iframe.min.js`
const chta_List = ChatBubbleColorList.filter((item) => item.bg === domainInfo.value.suspend_style)
const tip_chato_color = chta_List.length > 0 ? chta_List[0].cl : '#fff'
const wssApiDocs =
  'https://apifox.com/apidoc/shared-74401769-7cc9-4d75-a57e-892dc6aa5960/api-95610185'
const weixinServiceDocs = 'https://baixingwang.feishu.cn/docx/CXyTdSKF6oPCiLxAQTacrHvUnfe'
// 发布权限
// const previewLoading = ref(true)
// 复制网页链接
const showCopyLinkVisbile = ref<boolean>(false)
// 群聊列表
const showDrawerPublic = ref<boolean>(false)
const showCopyApiVisible = ref<boolean>(false)
// 群聊
const tableData = ref([])
const createPublicVisible = ref<boolean>(false)
const currentRow = ref<CurrentRowI>({
  qrcode_data: ''
})
const previewCode = ref<boolean>(false)
const codeImgLoading = ref<boolean>(false)
const isCreating = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const editConfig = ref({})
const activeName = ref<ETabPublicType>(ETabPublicType.create)
const robotQrCodeInfo = ref<RobotQrCodeInfoProps>({})
const serachPublicStatusRef = ref(null)
const transferStatus = ref(false)
const showTransfer = ref(false)
// 公众号
const dialogVisibleOfficialAccount = ref<boolean>(false)
// 嵌入网页
const visibleSite = ref<boolean>(false)
const loading = ref()
const dialogVisibleHttp = ref<boolean>(false)
// 站点
const sitesList = ref<createSitesChannelsRes[]>([])
// 域名部署
const brandDomainVisible = ref<boolean>(false)
const currentIndex = ref<number>(1)
const brandDomainList = ref<brandDomainTypeKeyFile[]>([])
const brandDomainInfo = ref<brandDomainTypeKeyFile>()
const brandDomainStatus = ref<brandCreateEditStatusType>(brandCreateEditStatusType.create)
const feiShuVisible = ref<boolean>(false) // 飞书
const weixinService = ref<boolean>(false) // 微信客服
const tiktokService = ref<boolean>(false) // 抖音

const sureMessage = [ECreatePublicType.create, ECreatePublicType.friends, ECreatePublicText.invite]

function getChatAPI(baseURL, slug) {
  return `${baseURL}/chato/api-public/domains/${slug}/chat`
}

async function submitCreatePublic(
  inputCreatePublicForm: weixinCreateConfigType,
  formEl?: FormInstance,
  type?: ECreatePublicType,
  row?: any
) {
  let checkRes = true
  if (formEl) {
    checkRes = await formEl.validate(async (valid) => {
      return Boolean(valid)
    })
  }
  if (!checkRes) return
  if (type === ECreatePublicType.edit) {
    editPublic(inputCreatePublicForm, row)
  }
  try {
    if (sureMessage.includes(type)) {
      await ElMessageBox.confirm(t(ECreatePublicText[type]), t('创建群聊确认'), {
        confirmButtonText: t('确认'),
        cancelButtonText: t('取消'),
        icon: ''
      })
    }
    loading.value = ElLoading.service({
      lock: true,
      text: t('保存中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    let apiFunc = null
    const data: any = {
      robot_nickname: domainInfo.value.name,
      endpoint: chatReleaseURL.value.chatAPI,
      name: inputCreatePublicForm.name
    }
    // 创建或编辑群聊
    switch (type) {
      case ECreatePublicType.invite:
        apiFunc = postWeixinPublicInviteMini
        data.base64_data = inputCreatePublicForm.base64_data
        data.dragon_mother_name = inputCreatePublicForm.weixinName
        data.robot_response_type = Number(inputCreatePublicForm.robot_response_type)
        data.new_user_in_group_msg = inputCreatePublicForm.new_user_in_group_msg
        break
      case ECreatePublicType.create:
        data.robot_response_type = Number(inputCreatePublicForm.robot_response_type)
        data.new_user_in_group_msg = inputCreatePublicForm.new_user_in_group_msg
        apiFunc = createPublicApi
        break
      case ECreatePublicType.friends:
        data.dragon_mother_name = inputCreatePublicForm.weixinName
        data.robot_response_type = Number(inputCreatePublicForm.robot_response_type)
        data.new_user_in_group_msg = inputCreatePublicForm.new_user_in_group_msg
        apiFunc = postWeixinPublicInviteLarge
        break
      case ECreatePublicType.edit:
        data.response_type = Number(inputCreatePublicForm.robot_response_type)
        data.new_user_msg = inputCreatePublicForm.new_user_in_group_msg
        data.id = row.id
        apiFunc = editPublicApi
        break
      case ECreatePublicType.transfer:
        data.id = inputCreatePublicForm.id
        data.robot_nickname = row.name
        data.new_domain_id = row.id
        data.endpoint = getChatAPI(currentEnvConfig.baseURL, row.slug)
        apiFunc = editPublicApi
        break
    }
    const res = await apiFunc(domainInfo.value.id, data)
    loading.value.close()
    initPublicList()
    createPublicVisible.value = type === ECreatePublicType.friends
    if (type === ECreatePublicType.friends) {
      robotQrCodeInfo.value = res.data.data
      getRobotQrCodeInfo()
    }
    if (type === ECreatePublicType.create) {
      previewCode.value = true
      serachPublicStatus()
      serachPublicStatusRef.value = setInterval(() => {
        serachPublicStatus()
      }, 10000)
    }
    if (type === ECreatePublicType.invite) {
      return Notification.success(
        t('{mention}机器人提问，机器人即可自动回复，请前往群聊体验。', { mention: '@' })
      )
    }

    Notification.success(
      t('{slot1}成功', {
        slot1: isEdit.value ? t('更新') : t('创建')
      })
    )
    isEdit.value = false
    transferStatus.value = type === ECreatePublicType.transfer
  } catch (e) {
    loading.value.close()
  }
}

const getRobotQrCodeInfo = async () => {
  codeImgLoading.value = true
  const res = await getWeixinPublicRobotQrCode(domainInfo.value.id)
  robotQrCodeInfo.value = { ...robotQrCodeInfo.value, ...res.data.data }
  codeImgLoading.value = false
}

async function reloadCodeImg(room_id: string) {
  codeImgLoading.value = true
  const res = await getPublicCodeImg(domainInfo.value.id, room_id)
  currentRow.value.qrcode_data = res.data.data.qrcode_data
  codeImgLoading.value = false
}

async function initPublicList() {
  const res: any = await getPubliclist(domainInfo.value.id || Number(route.params.botId))
  tableData.value = res.data.data
}

function editPublic(inputCreatePublicForm, row) {
  isEdit.value = true
  editConfig.value = row
  inputCreatePublicForm.id = row.id
  inputCreatePublicForm.robot_nickname = row.robot_nickname
  inputCreatePublicForm.endpoint = row.endpoint
}

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const createPublicDialog = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.groupChat)
  if (needUpgrade) {
    return
  }
  createPublicVisible.value = true
  robotQrCodeInfo.value = {}
}

const platformList: PlatFormListProps[] = [
  { title: t('钉钉'), icon: 'dingding' },
  { title: 'QQ', icon: 'qq' },
  { title: 'APP', icon: 'app-store' },
  { title: t('小程序'), icon: 'applets' }
]

// 蒙层
const maskVisible = computed(() => {
  return !base.orgInfo.visible && ESpaceCommercialType.free === userCommercialType.value
})

// 更新visible
const handleUpdateOrgInfo = () => {
  base.updateOrgInfo({
    ...orgInfo.value,
    visible: true
  })
}

// 预览体验
const handlePreview = (e: string) => {
  window.open(e)
}

const serachPublicStatus = async () => {
  const res = await serachPublicCreateStatus(userInfo.value.org.id)
  const flag = res.data.data.is_done
  isCreating.value = flag
  serachPublicStatusRef.value && flag ? clearInterval(serachPublicStatusRef.value) : null
}

const commonVisible = (visibleRef: Ref<boolean>) => {
  visibleRef.value = true
}

// 域名部署
const brandDomain = async () => {
  if (!currentRights.value.dns) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.brand)
    return
  }
  brandDomainVisible.value = true
}

const getBrandDomainList = async () => {
  const res = await getBrandDomain(botSlug.value)
  brandDomainList.value = res.data.data
  if (brandDomainList.value.length > 0) {
    try {
      const resDomainInfo = brandDomainList.value[0]
      brandDomainInfo.value = {
        ...resDomainInfo,
        pri_key: JSON.parse(resDomainInfo.pri_key as string),
        pub_key: JSON.parse(resDomainInfo.pub_key as string)
      }
      brandDomainInfo.value.s_status === brandDomainStatusType.normal
        ? (currentIndex.value = 4)
        : (currentIndex.value = 3)
    } catch (e) {}
  } else {
    currentIndex.value = 1
  }
}

// 站点代码
const codeIframeHtml = (source: string) => {
  return `
<iframe
src="${chatReleaseURL.value.chatWebPage}?source=${source}"
width="408px"
height="594px"
frameborder="0">
</iframe>
`
}

const codeContent = (source: string) => {
  return (
    `
<script>
window.tip_chato_color="${tip_chato_color}";
window.tip_chato_bg="${domainInfo.value.suspend_style}";
window.chato_iframe_src = "${chatReleaseURL.value.chatWebPage}?source=${source}";
window.chato_script_checkDomain = "${chatReleaseURL.value.chato_script_checkDomain}";
var st = document.createElement("script");
st.type="text/javascript";
st.async = true;st.src = "${chatScript}";
var header = document.getElementsByTagName("head")[0];
header.appendChild(st);` +
    '</scr' +
    'ipt>'
  )
}

// 站点列表
const initSitesList = async () => {
  const res = await getCreateSites(botSlug.value)
  if (res.data.code === 200) {
    const channels = res.data.data.channels
    sitesList.value = channels.map((item) => ({
      ...item,
      codeContent: codeContent(item.source),
      codeIframeHtml: codeIframeHtml(item.source)
    }))
  }
}

const handleShowDrawer = () => {
  previewCode.value = false
  showDrawerPublic.value = true
}

const releaseList = [
  {
    icon: 'wangye',
    title: t('网页'),
    desc: t('用户在此链接可以直接和您的机器人聊天'),
    setList: [
      {
        icon: CopyDocument,
        label: t('复制链接'),
        scriptId: 'Chato-copy-link',
        click: () => commonVisible(showCopyLinkVisbile)
      },
      {
        icon: View,
        label: t('预览体验'),
        scriptId: 'Chato-preview-chat',
        click: () => handlePreview(chatReleaseURL.value.chatWebPage)
      },
      {
        icon: UploadFilled,
        label: t('域名部署'),
        scriptId: 'Chato-brand-domain',
        click: brandDomain
      }
    ]
  },
  {
    icon: 'js-qianru',
    title: t('JS嵌入'),
    desc: t('可添加到网站的任何位置，将此 iframe 添加到 html 代码中'),
    setList: [
      {
        icon: CirclePlus,
        label: t('创建站点'),
        scriptId: 'Chato-setted-effect-site',
        click: () => commonVisible(dialogVisibleHttp)
      },
      {
        icon: View,
        label: t('查看代码'),
        scriptId: 'Chato-copy-code',
        click: () => commonVisible(visibleSite)
      }
    ]
  },
  {
    icon: 'api-diaoyong',
    title: t('API调用'),
    desc: t('通过API，可直接进行调用或发出请求'),
    setList: [
      {
        icon: View,
        label: t('接口秘钥'),
        scriptId: 'Chato-fetch-api',
        click: () => commonVisible(showCopyApiVisible)
      },
      {
        icon: Document,
        label: t('接口文档'),
        scriptId: 'Chato-api-document',
        click: () => handlePreview(wssApiDocs)
      }
    ]
  },
  {
    icon: 'weixin-qun',
    title: t('微信群聊'),
    desc: t('在微信群聊中提供机器人服务'),
    setList: [
      {
        icon: CirclePlus,
        label: t('创建群聊'),
        scriptId: 'Chato-group-create',
        click: createPublicDialog
      },
      {
        icon: View,
        label: t('查看群聊'),
        scriptId: 'Chato-group-view',
        click: () => commonVisible(showDrawerPublic)
      }
    ]
  },
  {
    icon: 'weixin-public',
    title: t('微信公众号'),
    desc: t('可在微信公众号后台配置，提供机器人服务'),
    setList: [
      {
        icon: Tools,
        label: t('配置公众号'),
        scriptId: 'Chato-public-set',
        click: () => commonVisible(dialogVisibleOfficialAccount)
      }
    ]
  },
  {
    icon: 'feishu-public',
    title: t('飞书'),
    desc: t('在飞书群聊中提供机器人服务'),
    setList: [
      {
        icon: Tools,
        label: t('配置飞书'),
        scriptId: 'Chato-feishu-set',
        click: () => commonVisible(feiShuVisible)
      }
    ]
  },
  {
    icon: 'weixin-service',
    title: t('微信客服'),
    desc: t('通过配置微信客服，实现与机器人1V1聊天'),
    setList: [
      {
        icon: Tools,
        label: t('配置微信客服'),
        scriptId: 'Chato-weixin-service-set',
        click: () => commonVisible(weixinService)
      },
      {
        icon: Document,
        label: t('配置文档'),
        scriptId: 'Chato-weixin-api-document',
        click: () => handlePreview(weixinServiceDocs)
      }
    ]
  },
  {
    icon: 'tiktok',
    title: t('抖音'),
    desc: t('配置完成后，机器人可自动回复私信'),
    setList: [
      {
        icon: FullScreen,
        label: t('扫码授权'),
        scriptId: 'Chato-tiktok-set',
        click: () => commonVisible(tiktokService)
      }
    ]
  }
]

const handleCopyButtonClick = (e: MouseEvent) => {
  e.stopPropagation()
  copyPaste((e.target as HTMLElement).querySelector('.text').innerHTML)
}

watch(brandDomainVisible, (e) => {
  e ? getBrandDomainList() : ''
})

const init = () => {
  initSitesList()
  getBrandDomainList()
}

watch(() => route.params.botId, initPublicList, { immediate: true })
watch(botSlug, (v) => v && init(), { immediate: true })
watch(showTransfer, () => (transferStatus.value = false))
onMounted(() => {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const copyBtns = document.querySelectorAll('.copy-btn-code')
        // 移除旧的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.removeEventListener('click', handleCopyButtonClick)
        })

        // 添加新的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.addEventListener('click', handleCopyButtonClick)
        })
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <div class="content-view-container">
    <div v-if="!maskVisible">
      <div class="release-container">
        <div class="overflow-hidden">
          <ReleaseBox
            v-for="item in releaseList"
            :key="item.icon"
            :svgName="item.icon"
            :title="item.title"
            :desc="item.desc"
          >
            <div
              class="icon-set-container mr-[16px] md:mr-[6px]"
              @click="ic.click"
              v-for="ic in item.setList"
              :key="ic.label"
            >
              <el-icon>
                <component :is="ic.icon" />
              </el-icon>
              {{ ic.label }}
            </div>
          </ReleaseBox>
        </div>
      </div>
      <PlatFormList :platformList="platformList" />
    </div>

    <ApplicationForm
      v-else
      @handleUpdateOrgInfo="handleUpdateOrgInfo"
      :platformList="platformList"
      :org_id="userInfo.org.id"
      :org_user_id="userInfo.id"
    />
    <BrandDomain
      :slug="botSlug"
      :status="brandDomainStatus"
      :index="currentIndex"
      @handleSubmitSuccess="getBrandDomainList"
      @handleIndex="(e) => (currentIndex = e)"
      :brandDomainInfo="brandDomainInfo"
      v-model:value="brandDomainVisible"
    />
    <DrawerSite
      v-model:value="visibleSite"
      :slug="botSlug"
      :defaultActiveNames="sitesList.length > 0 ? sitesList[sitesList.length - 1].source : ''"
      :chatWebPage="chatReleaseURL.chatWebPage"
      :tip_chato_color="tip_chato_color"
      :suspend_style="domainInfo.suspend_style"
      :chato_script_checkDomain="chatReleaseURL.chato_script_checkDomain"
      :chatScript="chatScript"
      :sitesList="sitesList"
      @handleUpSitesList="initSitesList"
      @handleCopyCode="copyPaste"
    >
    </DrawerSite>
    <OfficialAccont
      v-model:value="dialogVisibleOfficialAccount"
      @handleCopyLink="copyPaste"
      :link="chatReleaseURL.chatWebPage"
      :slug_id="botSlug"
    />
    <SetEffectSite
      v-model:value="dialogVisibleHttp"
      :slug="domainInfo.slug"
      @showDrawerSite="() => (visibleSite = true)"
      @handleUpSitesList="() => initSitesList()"
    />
    <PublicImgPreview
      v-model:value="previewCode"
      :codeImgLoading="!isCreating"
      @handleShowDrawer="handleShowDrawer"
    />
    <DrawerPublic
      v-model:value="showDrawerPublic"
      v-model:showTransfer="showTransfer"
      :tableData="tableData"
      :userRoute="userRoute"
      :domainId="domainInfo.id"
      :nickname="domainInfo.name"
      :avatar="domainInfo.avatar"
      :codeImgLoading="codeImgLoading"
      :qrcode_data="currentRow.qrcode_data"
      :org-id="userInfo.org.id"
      :robotQrCodeInfo="robotQrCodeInfo"
      :transferStatus="transferStatus"
      @handleGetInviteLarge="getRobotQrCodeInfo"
      @handleReloadCodeImg="(e) => reloadCodeImg(e)"
      @submitCreatePublic="submitCreatePublic"
      @updatePublicList="initPublicList"
    />
    <CreatePublic
      v-model:value="createPublicVisible"
      v-model:activeName="activeName"
      :userRoute="userRoute"
      :currentRow="currentRow"
      :codeImgLoading="codeImgLoading"
      :robotQrCodeInfo="robotQrCodeInfo"
      @submitCreatePublic="submitCreatePublic"
    />
    <SerachApi
      v-model:value="showCopyApiVisible"
      :chatAPI="domainInfo.token"
      :slug="botSlug"
      @handleCopyApiUrl="copyPaste"
    />
    <Copylink
      v-model:value="showCopyLinkVisbile"
      :chatWebPage="chatReleaseURL.chatWebPage"
      @handleCopyLink="copyPaste(chatReleaseURL.chatWebPage)"
    />
    <CreateFeishu
      :slug="domainInfo.slug"
      @handleCopyUrl="(e) => copyPaste(e)"
      v-model:value="feiShuVisible"
    />
    <WeixinService
      v-model:value="weixinService"
      @handleCopy="copyPaste"
      :domain_slug="domainInfo.slug"
    />
    <EmPower v-model:value="tiktokService" :domain_slug="botSlug" />
  </div>
</template>

<style lang="scss" scoped>
.release-container {
  margin: 0 auto;
  .icon-set-container {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    gap: 8px;
    cursor: pointer;
    color: #b5bed0;
    &:hover {
      color: #7c5cfc;
    }
  }
}

.content-view-container {
  position: relative;

  :deep(.el-col) {
    @apply flex items-center justify-center;
  }

  :deep(.el-dialog__header) {
    margin-bottom: 0 !important;
    margin-right: 0 !important;
  }
}
</style>
