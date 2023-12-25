<template>
  <div ref="containerEl" class="infinite-list-container" :style="{ height }" @scroll="scrollEvent">
    <div ref="phantomEl" class="infinite-list-phantom"></div>
    <div ref="contentEl" :class="['infinite-list', listClass]">
      <slot name="more"></slot>
      <div
        ref="itemsEl"
        v-for="item in visibleData"
        :id="item._index"
        :key="item._index"
        :class="itemClass"
      >
        <slot :row-data="item"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUpdated, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    listData: Array<any>
    height?: string
    estimatedItemSize?: number
    bufferScale?: number
    itemClass?: string
    listClass?: string
  }>(),
  {
    height: '100%',
    itemSize: 100,
    bufferScale: 3,
    estimatedItemSize: 80
  }
)

const emit = defineEmits(['scrollTop'])

const containerEl = ref()
const contentEl = ref()
const phantomEl = ref()
const itemsEl = ref()

const internalListData = computed(() => {
  return props.listData.map((item, index) => {
    return {
      _index: `_${index}`,
      ...item
    }
  })
})
const screenHeight = computed(() => containerEl.value?.clientHeight || 0)
// 可显示的列表项数
const visibleCount = computed(() => Math.ceil(screenHeight.value / props.estimatedItemSize))
const aboveCount = computed(() => Math.min(start.value, props.bufferScale * visibleCount.value))
const belowCount = computed(() =>
  Math.min(props.listData.length - end.value, props.bufferScale * visibleCount.value)
)
// 获取真实显示列表数据
const visibleData = computed(() => {
  const startTag = start.value - aboveCount.value
  const endTag = end.value + belowCount.value
  return internalListData.value.slice(startTag, endTag)
})

const positions = computed({
  get: () => {
    return props.listData.map((item, index) => {
      return {
        index,
        id: item.id,
        height: props.estimatedItemSize,
        top: index * props.estimatedItemSize,
        bottom: (index + 1) * props.estimatedItemSize
      }
    })
  },
  set: (val) => val
})

// 此时的开始索引
const start = ref(0)
// 此时的结束索引
const end = ref(0)

// 获取列表项的当前尺寸
const updateItemsSize = () => {
  const itemNodes = itemsEl.value
  const newPositions = [...positions.value]
  itemNodes.forEach((node) => {
    let rect = node.getBoundingClientRect()
    let height = rect.height
    let index = +node.id.slice(1)
    let oldHeight = positions.value[index].height
    let dValue = oldHeight - height
    // 存在差值
    if (dValue) {
      newPositions[index].bottom = newPositions[index].bottom - dValue
      newPositions[index].height = height
      for (let k = index + 1; k < newPositions.length; k++) {
        newPositions[k].top = newPositions[k - 1].bottom
        newPositions[k].bottom = newPositions[k].bottom - dValue
      }
    }
  })
  positions.value = newPositions
}

// 获取列表起始索引
const getStartIndex = (scrollTop = 0) => binarySearch(positions.value, scrollTop)

// 获取当前的偏移量
const setStartOffset = () => {
  let startOffset = 0
  if (start.value >= 1) {
    let size =
      positions.value[start.value].top -
      (positions.value[start.value - aboveCount.value]
        ? positions.value[start.value - aboveCount.value].top
        : 0)
    startOffset = positions.value[start.value - 1].bottom - size
  } else {
    startOffset = 0
  }
  contentEl.value.style.transform = `translate3d(0,${startOffset}px,0)`
}

const scrollEvent = () => {
  // 当前滚动位置
  let scrollTop = containerEl.value.scrollTop
  if (scrollTop < 90) {
    emit('scrollTop')
  }
  // 此时的开始索引
  start.value = getStartIndex(scrollTop)
  // 此时的偏移量
  setStartOffset()
}

const binarySearch = (list, value: number) => {
  let start = 0
  let end = list.length - 1
  let tempIndex = null
  while (start <= end) {
    let midIndex = Math.floor((start + end) / 2)
    let midValue = list[midIndex].bottom
    if (midValue === value) {
      return midIndex + 1
    } else if (midValue < value) {
      start = midIndex + 1
    } else if (midValue > value) {
      if (tempIndex === null || tempIndex > midIndex) {
        tempIndex = midIndex
      }
      end = end - 1
    }
  }
  return tempIndex
}

const scrollToIndex = ref<number>()
const indexPositionInfo = computed(() =>
  positions.value.find((item) => item.id === scrollToIndex.value)
)

const setScrollToIndex = (index: number) => {
  scrollToIndex.value = index
}

let scrollToIndexTag = true

const onScrollToIndex = (tag = true) => {
  if (!scrollToIndex.value) {
    return
  }

  scrollToIndexTag = tag
  if (!indexPositionInfo.value) {
    console.log('获取位置信息偏移量失败')
    return
  }

  const scrollTopNumber = indexPositionInfo.value.top
  containerEl.value.scrollTop = scrollTopNumber
}

watch(
  indexPositionInfo,
  () => {
    onScrollToIndex()
  },
  { immediate: true }
)

onUpdated(() => {
  // nextTick(() => {
  if (!itemsEl.value || !itemsEl.value.length) {
    return
  }
  updateItemsSize()

  scrollToIndexTag && onScrollToIndex(false)
  let height = positions.value[positions.value.length - 1].bottom
  phantomEl.value.style.height = height + 'px'
  setStartOffset()
  // })
})

watch(
  start,
  () => {
    // 此时的结束索引
    end.value = start.value + visibleCount.value
  },
  { immediate: true }
)

defineExpose({
  setScrollToIndex
})
</script>

<style lang="scss" scoped>
.infinite-list-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;

  .infinite-list-phantom {
    position: absolute;
    left: -5px;
    top: 0;
    right: 0;
    z-index: -1;
  }

  .infinite-list {
    left: 0;
    right: 0;
    top: 0;
    position: absolute;
    text-align: center;
    padding-right: 10px;
  }
}
</style>
