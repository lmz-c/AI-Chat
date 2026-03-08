<script>
import { ref } from 'vue'

export default {
  setup() {
    const data = new Array(500).fill(0).map((_, i) => i) // 模拟真实数据
    const viewHeight = ref(400) // 可视容器高度
    const itemHeight = ref(20) // 每一项的高度
    const showData = ref([]) // 显示的数据
    showData.value = data.slice(0, 20) // 初始展示的数据 （前20个）
    const scrollTop = ref(0) // 初始滚动距离

    // 滚动事件
    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop
      const startIndex = Math.round(scrollTop.value / itemHeight.value)
      const endIndex = startIndex + viewHeight.value / itemHeight.value
      showData.value = data.slice(startIndex, endIndex)
      console.log(startIndex, endIndex,scrollTop.value);
      
    }

    return {
      data,
      viewHeight,
      itemHeight,
      showData,
      scrollTop,
      handleScroll
    }
  }
}
</script>

<template>
  <div
    class="view-container"
    :style="{ height: viewHeight + 'px', overflowY: 'auto' }"
    @scroll="handleScroll"
  >
    <!-- 整个高度撑起来 -->
    <div
      class="content-container"
      :style="{ height: data.length * itemHeight + 'px' }"
    ></div>

    <!-- 实际显示的元素区域 -->
    <div
      class="item-container"
      :style="{ transform: 'translateY(' + scrollTop + 'px)' }"
    >
      <div
        class="item"
        :style="{ height: itemHeight + 'px' }"
        v-for="(item, index) in showData"
        :key="index"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  border: 1px solid #ccc;
  position: relative;
}
.item-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* display: flex; */
}
.item {
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-bottom: 1px solid #eee;
}
</style>
