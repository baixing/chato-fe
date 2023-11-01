<template>
  <div class="personal-space-container">
    <div class="p-s-header">
      <div class="header-left w-full">
        <div class="img-upload-container">
          <div class="default-avatar" v-if="!userInfo?.org?.avatar && !isRemove">
            <el-avatar :size="48">{{ $t('空间') }}</el-avatar>
          </div>
          <div
            :class="[!userInfo.org.avatar && !isRemove ? 'hidden-img-upload' : 'show-img-upload']"
          >
            <ImgUpload :setInitUrl="handleChange" :fixed="true" :initImgUrl="''" :imgUrl="avatar" />
          </div>
        </div>
        <span class="mx-4 text-sm" v-if="!isEdit">{{ name }}</span>
        <HansInputLimit
          v-else
          v-model:value="name"
          type="text"
          size="large"
          class="mx-4 w-full max-w-[80%]"
          @blurInput="blurInput"
          :placeholder="$t(`请输入空间名`)"
          :limit="20"
          :defaultFocus="true"
        />
        <el-icon @click="handleEdit" :size="14">
          <Edit />
        </el-icon>
      </div>
      <el-button
        link
        type="primary"
        class="!border-none !bg-white !py-[10px] !px-5 !text-[#7C5CFC] hover:opacity-80"
        @click="onAddMember"
        >{{ $t('添加成员') }}</el-button
      >
    </div>
    <div class="w-full h-full member-table" v-loading="loading">
      <el-table
        :data="spaceMembers"
        style="
          width: 100%;
          height: 100%;
          --el-table-border-color: none;
          --el-table-header-bg-color: #e7e9ee;
          --el-table-bg-color: #f2f3f5;
          --el-table-tr-bg-color: #f2f3f5;
          --el-bg-color: #f2f3f5;
          --el-fill-color-light: #f2f3f5;
        "
      >
        <el-table-column prop="nickname" :label="$t(`用户名`)" min-width="200">
          <template #default="scope">
            <div class="flex justify-start items-center">
              <UserAvatar :user="scope.row" :size="28" :text-size="14" class="mr-[6px]" />
              {{
                scope.row.id === userInfo.id
                  ? $t('{slot1}（我自己）', { slot1: scope.row.nickname })
                  : scope.row.nickname
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" :label="$t(`手机号`)" width="180" />
        <el-table-column prop="consume_total" :label="$t(`已用电力值`)" width="140" />
        <el-table-column
          :label="$t(`角色`)"
          align="left"
          class-name="table-role-container"
          width="200"
        >
          <template #default="scope">
            <span class="float-left ml-3" v-if="scope.row.org.owner_id === scope.row.id">{{
              $t('管理者')
            }}</span>
            <el-select
              v-model="scope.row.role"
              class="custom-select text-[#3D3D3D]"
              :placeholder="$t(`选择角色`)"
              @change="(e: ESettingSpaceRole) => handleSelect(scope.row.id, e)"
              v-else
            >
              <el-option
                v-for="item in roleList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                style="height: auto"
              >
                <div class="flex justify-between items-center py-1">
                  <div class="flex flex-col mr-2">
                    <span class="text-[#3D3D3D] text-sm mb-1">{{ item.label }}</span>
                    <span class="text-[#B5BED0] text-xs">{{ item.desc }}</span>
                  </div>
                  <svg-icon v-if="item.value === scope.row.role" name="Radio"></svg-icon>
                  <svg-icon v-else name="Radio-default"></svg-icon>
                </div>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="90" :label="$t(`操作`)" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.org.owner_id !== scope.row.id"
              @click="() => handleRemoveMember(scope.row)"
              link
              type="primary"
            >
              {{ scope.row.id === userInfo.id ? $t('退出') : $t('移除') }}
            </el-button>
            <el-text v-else type="info">-</el-text>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddMember v-model:visible="addMemberVisible" />
  </div>
</template>
<script lang="ts" setup>
import { removeSpaceMember, updateOrgSpaceInfo, updateSpaceMemberRole } from '@/api/space'
import UserAvatar from '@/components/Avatar/UserAvatar.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import useSpace from '@/composables/useSpace'
import ImgUpload from '@/components/NewImgUpload/ImgUpload.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import type { ESettingSpaceRole } from '@/enum/space'
import { ESpaceRightsType } from '@/enum/space'
import type { EAllRole } from '@/enum/user'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useSpaceStore } from '@/stores/space'
import { getStringWidth } from '@/utils/string'
import { ElMessage, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AddMember from './components/AddMember.vue'

const { t } = useI18n()
const router = useRouter()
const base = useBase()
const spaceStoreI = useSpaceStore()
const { userInfo, orgInfoList } = storeToRefs(base)
const { spaceMembers } = storeToRefs(spaceStoreI)
const isRemove = ref<boolean>(false)
const loading = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const addMemberVisible = ref<boolean>(false)
const name = ref(userInfo.value?.org?.name || '')
const avatar = ref(userInfo.value?.org?.avatar || '')
const { switchSpace } = useSpace()

const roleList = [
  {
    label: t('管理者'),
    value: 'owner',
    desc: t('可训练机器人，可管理空间成员')
  },
  {
    label: t('使用者'),
    value: 'member',
    desc: t('不可训练机器人，不可管理空间成员')
  }
]

const handleEdit = () => {
  isEdit.value = true
}

const handleChange = (value: string) => {
  avatar.value = value
  handleUpdateOrgInfo()
}

const blurInput = () => {
  isEdit.value = false
  handleUpdateOrgInfo()
}

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onAddMember = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.space)
  if (needUpgrade) {
    return
  }

  addMemberVisible.value = true
}

const exitMsgBox = {
  title: t('退出空间'),
  content: t('退出后将无法访问此空间，是否确认退出？'),
  okBtn: t('确认退出'),
  doneMsg: t('退出成功')
}
const removeMsgBox = {
  title: t('移除成员'),
  content: t('移除后该成员将无法访问此空间，是否确认移除该成员？'),
  okBtn: t('确认移除'),
  doneMsg: t('移除成功')
}

const handleRemoveMember = async (row: any) => {
  const isExitSpace = row.id === userInfo.value.id
  const msgBox = isExitSpace ? exitMsgBox : removeMsgBox

  await ElMessageBox.confirm(msgBox.content, msgBox.title, {
    confirmButtonText: msgBox.okBtn,
    cancelButtonText: t('取消'),
    type: 'warning'
  })

  const res = await removeSpaceMember(row.id)
  const code = res.data.code
  const message = res.data.message
  ElMessage({
    type: code === 200 ? 'success' : 'error',
    message: code === 200 ? msgBox.doneMsg : message
  })

  if (isExitSpace) {
    // 用户退出他人空间后，更新当前空间信息为用户空间
    await base.updateUserInfoCommon(orgInfoList.value[0])
    router.replace({ name: RoutesMap.namespaceSwitch })
    return
  }
  init()
}

const handleSelect = async (userId: number, value: ESettingSpaceRole) => {
  const data = {
    org_user_id: userId,
    role: value
  }
  const res = await updateSpaceMemberRole(data)
  const code = res.data.code
  const message = res.data.message
  ElMessage({
    type: code === 200 ? 'success' : 'error',
    message: code === 200 ? t('修改成功') : message
  })
  if (data.org_user_id === userInfo.value.id) {
    switchSpace(userInfo.value.org.id, { role: value as unknown as EAllRole })
    base.getUserInfo()
  }
}

const handleUpdateOrgInfo = async () => {
  name.value = name.value.trim()
  const data = {
    avatar: avatar.value,
    name: name.value
  }
  if (getStringWidth(data.name) > 20) return Notification.error(t('昵称超过20个字符'))
  if (getStringWidth(data.name) === 0) return Notification.error(t('请输入昵称'))
  try {
    await updateOrgSpaceInfo(data)
    base.updateUserOrgInfoAttri(data)
    Notification.success(t('保存成功'))
  } catch (e) {}
}

const init = async () => {
  try {
    loading.value = true
    await spaceStoreI.initSpaceMembers()
  } catch (err) {
  } finally {
    loading.value = false
  }
}

init()
</script>
<style lang="scss">
.personal-space-container {
  .member-table {
    overflow-y: auto;
    height: calc(100% - 190px);
  }

  .el-table__cell {
    border-bottom: none !important;
  }

  thead {
    .table-role-container {
      .cell {
        padding-left: 24px;
      }
    }

    .cell {
      color: #303133;
      font-weight: 500;
    }
  }

  .p-s-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    margin-bottom: 16px;
    background: #e5ecf7;
    border-radius: 8px;
    color: #3d3d3d;
    cursor: pointer;

    .header-left {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .img-upload-container {
        position: relative;
        width: 48px;
        height: 48px;

        .hidden-img-upload {
          opacity: 0;
        }

        .show-img-upload {
          opacity: 1;
        }
      }
    }
  }

  :deep(.member-table) {
    .s-p-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }

  .custom-select {
    :deep(.el-select .el-input__wrapper) {
      background-color: transparent;
    }
  }
}
</style>
<style lang="scss" scoped>
.default-avatar {
  position: absolute;
  width: 40px;
  height: 40px;
  font-size: 14px;

  &:hover {
    &::after {
      content: '替换';
      width: 40px;
      height: 40px;
      line-height: 40px;
    }
  }
}

:deep(.el-select-dropdown__item) {
  .item-right {
    width: 14px;
    height: 14px;
    border-radius: 100%;
    border: 1px solid #e4e7ed;
  }

  .item-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #7c5cfc;

    &::after {
      display: inline-block;
      content: '';
      width: 9px;
      height: 5px;
      border-left: 1px solid #fff;
      border-bottom: 1px solid #fff;
    }
  }
}
</style>
