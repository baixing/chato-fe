<template>
  <div>
    <!-- 页面内容，实际上用户可能看不到，因为页面将被重定向 -->
  </div>
</template>

<script>
export default {
  name: 'RedirectPage',

  mounted() {
    // 你希望用户跳转去的外部链接
    const externalUrl = `http://kimi.moonshot.cn/?tr_param1=aiwriting&tr_param2=newpage&Campaign_group_id=baixing&prefill_prompt=hello&utm_source=Chat&utm_campaign=baixing_kimi&utm_content=到kimi，体验更多AI智能写作场景`
    // 用 replace 方法替换当前页面
    window.location.replace(externalUrl)
  }
}
</script>
