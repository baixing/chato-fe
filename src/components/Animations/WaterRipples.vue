<template>
  <div class="water-ripples">
    <div class="circle"></div>
    <div class="circle1"></div>
    <div class="circle2"></div>
    <div class="circle3"></div>
  </div>
</template>

<style lang="scss" scoped>
.water-ripples {
  z-index: -1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
}

/* 扩散动画 */
.circle,
.circle1,
.circle2,
.circle3 {
  width: 28px;
  height: 28px;
  background: rgba(124, 92, 252);
  border-radius: 100%;
  position: absolute;
}
.circle1,
.circle2,
.circle3 {
  animation-name: waterCircle;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.circle1 {
  animation-delay: 0s;
}
.circle2 {
  animation-delay: 1s;
}
.circle3 {
  animation-delay: 2s;
}

@keyframes waterCircle {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  25% {
    transform: scale(1.25);
    opacity: 0.375;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.25;
  }
  75% {
    transform: scale(1.75);
    opacity: 0.125;
  }
  100% {
    transform: scale(2);
    opacity: 0.05;
  }
}
</style>
