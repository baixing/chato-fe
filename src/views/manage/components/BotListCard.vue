<template>
  <div
    class="group/card relative bg-white rounded-lg p-6 space-y-5 transition cursor-pointer hover:shadow-lg hover:-translate-y-2 lg:p-4 lg:space-y-3 lg:hover:-translate-y-0"
    @click="onCardClick"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <Avatar
          :avatar="internalBot.avatar || DefaultAvatar"
          class="w-11 h-11 rounded-full overflow-hidden shrink-0 lg:w-9 lg:h-9"
          :size="isMobile ? 36 : 44"
          :name="internalBot.name.slice(0, 2)"
        />
        <span class="inline-block truncate font-medium text-[#3D3D3D]">
          {{ internalBot.name }}
        </span>
      </div>
      <!-- <div
        v-if="isAllowedDelete"
        class="border hidden border-[#E4E7ED] lg:!hidden p-2 group-hover/card:block border-solid rounded hover:!border-[#7C5CFC] text-[#9DA3AF] hover:text-[#7C5CFC]"
        @click.stop="emit('visible', internalBot)"
      >
        <svg-icon :name="internalBot.use_scope ? 'visible' : 'private'" svg-class="w-4 h-4" />
      </div> -->
      <div class="gap-4 flex items-center justify-between">
        <el-popover trigger="click" placement="right-start" width="fit-content" :show-arrow="false">
          <template #reference>
            <svg-icon
              name="more"
              svg-class="w-4 h-4 transition-colors text-[#9DA3AF] hover:text-[#7C5CFC]"
              @click.stop
            />
          </template>
          <div class="flex flex-col gap-4">
            <IconBtn
              class="w-full"
              name="clone-robot"
              @click="() => emit('cloneRobot', internalBot.slug, internalBot.name)"
            >
              {{ t('克隆') }}
            </IconBtn>
            <IconBtn
              class="w-full"
              :name="internalBot.use_scope ? 'visible' : 'private'"
              @click="() => emit('visible', internalBot)"
            >
              {{ t('访问权限') }}({{ internalBot.use_scope ? t('公开') : t('私密') }})
            </IconBtn>
            <template v-if="isPrivilege">
              <IconBtn
                :icon="internalBot.visible ? Hide : View"
                @click="() => emit('sync', internalBot, 'visible')"
              >
                {{ internalBot.visible ? t('设为不可见') : t('设为可见') }}
              </IconBtn>
              <IconBtn
                :icon="internalBot.template ? Notification : Compass"
                @click="() => emit('sync', internalBot, 'template')"
              >
                {{ internalBot.template ? t('设为资源广场机器人') : t('设为模板机器人') }}
              </IconBtn>
            </template>
            <IconBtn
              v-if="isAllowedDelete"
              :icon="Delete"
              @click="() => emit('delete', internalBot)"
              class="hover:!text-[#f56c6c]"
            >
              {{ t('删除') }}
            </IconBtn>
          </div>
        </el-popover>
      </div>
    </div>

    <p
      class="text-xs text-[#B5BED0] leading-5 line-clamp-2 break-all whitespace-pre-wrap h-10 lg:h-auto"
    >
      {{ internalBot.desc }}
    </p>

    <!-- <div class="flex items-center justify-between">
      <template v-if="EDomainStatus.draft === internalBot.status">
        <IconBtn
          v-if="isAllowedDelete"
          :icon="Delete"
          @click="() => emit('delete', internalBot)"
          class="hover:!text-[#f56c6c]"
          >{{ t('删除') }}
        </IconBtn>
        <el-button
          type="primary"
          plain
          @click="() => onLinkTo(RoutesMap.manager.create)"
          class="shrink-0 w-[73%] max-w-[220px] !border-[#E4E7ED] !text-[#3D3D3D] !font-normal !bg-transparent hover:!bg-[#7C5CFC] hover:!border-[#7C5CFC] hover:!text-white"
        >
          <template #icon>
            <svg-icon name="create-continue" svg-class="w-4 h-4" />
          </template>
          {{ t('继续创建') }}
        </el-button>
      </template>
      <template v-else> -->
    <!-- <div class="gap-4 flex items-center justify-between">
          <IconBtn :icon="Edit" @click="() => onLinkTo(RoutesMap.tranning.roleInfo)">
            {{ t('编辑') }}
          </IconBtn>
          <IconBtn :icon="Position" @click="() => onLinkTo(RoutesMap.tranning.release)">
            {{ t('发布') }}
          </IconBtn>
          <el-popover
            trigger="click"
            placement="right-start"
            width="fit-content"
            :show-arrow="false"
          >
            <template #reference>
              <svg-icon
                name="more"
                svg-class="w-4 h-4 transition-colors text-[#9DA3AF] hover:text-[#7C5CFC]"
                @click.stop
              />
            </template>
            <div class="flex flex-col gap-4">
              <IconBtn
                class="w-full"
                name="clone-robot"
                @click="() => emit('cloneRobot', internalBot.slug, internalBot.name)"
              >
                {{ t('克隆') }}
              </IconBtn>
              <IconBtn
                v-if="isSuperAdmin"
                :icon="Finished"
                @click="() => emit('acceptance', internalBot)"
              >
                {{ t('验收') }}
              </IconBtn>
              <template v-if="isPrivilege">
                <IconBtn
                  :icon="internalBot.visible ? Hide : View"
                  @click="() => emit('sync', internalBot, 'visible')"
                >
                  {{ internalBot.visible ? t('设为不可见') : t('设为可见') }}
                </IconBtn>
                <IconBtn
                  :icon="internalBot.template ? Notification : Compass"
                  @click="() => emit('sync', internalBot, 'template')"
                >
                  {{ internalBot.template ? t('设为资源广场机器人') : t('设为模板机器人') }}
                </IconBtn>
              </template>
              <IconBtn
                v-if="isAllowedDelete"
                :icon="Delete"
                @click="() => emit('delete', internalBot)"
                class="hover:!text-[#f56c6c]"
              >
                {{ t('删除') }}
              </IconBtn>
            </div>
          </el-popover>
        </div>
        <el-button
          type="primary"
          plain
          :icon="ChatDotRound"
          @click.stop="() => onLinkTo(RoutesMap.chat.c)"
          class="shrink-0 !border-[#E4E7ED] !text-[#3D3D3D] !font-normal !bg-transparent hover:!bg-[#7C5CFC] hover:!border-[#7C5CFC] hover:!text-white"
        >
          {{ t('对话') }}
        </el-button> -->
    <!-- </template>
    </div> -->

    <span
      v-if="EDomainStatus.draft === internalBot.status"
      class="absolute right-0 top-0 inline-block !m-0 text-center px-2 py-1 rounded-tr-md rounded-bl-md bg-[#FFC7C7] text-xs text-[#EA0000]"
    >
      {{ t('草稿') }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { addChatSessionB } from '@/api/chatList'
import DefaultAvatar from '@/assets/img/avatar.png'
import IconBtn from '@/components/IconBtn/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { EDomainStatus } from '@/enum/domain'
import { EAllRole } from '@/enum/user'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { Compass, Delete, Hide, Notification, View } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{
  bot?: IDomainInfo
}>()

const emit = defineEmits(['delete', 'sync', 'cloneRobot', 'visible', 'acceptance'])

// 特殊权益用户开放同步/隐藏资源广场机器人按钮
const PrivilegeUser = '18116404787'

const { t } = useI18n()
const router = useRouter()
const domainStoreI = useDomainStore()
const chatStoreI = useChatStore()
const baseStoreI = useBase()
const { userInfo } = storeToRefs(baseStoreI)
const { isMobile } = useBasicLayout()

const internalBot = computed(() => props.bot)
const isPrivilege = computed(() => userInfo.value.mobile === PrivilegeUser)
const isSuperAdmin = computed(() => userInfo.value.role === EAllRole.superman)
const isAllowedDelete = computed(
  () =>
    userInfo.value.id === userInfo.value.org.owner_id ||
    userInfo.value.id === internalBot.value.creator
)

const onLinkTo = async (routeName: string, routeParams?: Record<string, string>) => {
  domainStoreI.$patch({
    domainInfo: internalBot.value
  })

  if (routeName === RoutesMap.chat.c) {
    await addChatSessionB([internalBot.value.id])
    await chatStoreI.initChatList()
    chatStoreI.switchChatingInfo(internalBot.value.slug)
  }

  router.push({
    name: routeName,
    params: {
      botId: internalBot.value.id,
      slug: internalBot.value.slug,
      botSlug: internalBot.value.slug,
      ...routeParams
    }
  })
}

const onCardClick = () => {
  // const linkRouteName =
  //   EDomainStatus.draft === internalBot.value.status ? RoutesMap.manager.create : RoutesMap.chat.c
  onLinkTo(RoutesMap.tranning.botChat)
}
</script>
