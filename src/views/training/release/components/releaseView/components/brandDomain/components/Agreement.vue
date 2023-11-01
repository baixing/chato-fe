<template>
  <div class="text-sm w-full">
    <div
      class="p-[14px] rounded-sm agreement-content pb-[0px] border-solid border-1 border-[#D8D8D8]"
    >
      <p>{{ $t('绑定独立域名前，必须仔细阅读并确认以下事项：') }}</p>
      <p>
        {{
          $t(
            '1、Chato会为您提供绑定独立域名的技术及服务支持，不提供域名购买及续费、域名备案及安全证书的购买及续费等服务。'
          )
        }}
      </p>
      <p>
        {{
          $t(
            '2、绑定的独立域名必须经过ICP备案。具体的备案流程及操作事项请自行咨询域名服务商，Chato不提供备案服务。'
          )
        }}
      </p>
      <p>
        {{ $t('3、域名必须配置HTTPS安全证书，并要求提交的域名及证书的有效期至少在一个月以上。') }}
      </p>
      <p>
        {{ $t('4、为了确保Chato服务的稳定性，独立域名配置成功后不可随意更换。') }}
      </p>
      <p>
        {{
          $t(
            '5、绑定独立域名后，你需要保证域名及安全证书均在有效期内，若因域名或安全证书过期而导致Chato链接失效无法访问，责任由用户自行承担。'
          )
        }}
      </p>
      <p>
        {{
          $t(
            '6、绑定的独立域名，建议为二级及以下域名（如：Chato.cn），暂不支持中文域名（如：纳什智能.cn）'
          )
        }}
      </p>
    </div>
    <p class="my-[16px]">
      <el-checkbox v-model="checked" class="ml-[8px] text-[#878787]">{{
        $t('我已知情上述事项并同意绑定独立域名')
      }}</el-checkbox>
    </p>
    <el-row justify="end">
      <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
        <el-button
          type="primary"
          size="large"
          :disabled="!checked"
          @click="() => emit('nextClick', 2)"
          >{{ $t('下一步') }}</el-button
        >
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits(['nextClick'])

const checked = ref(false)
</script>
<style lang="scss" scoped>
.agreement-content {
  p {
    margin-bottom: 16px;
  }
}
</style>
