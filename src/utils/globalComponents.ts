export const globalComponents = [
  {
    key: 'svg-icon',
    component: () => import('@/components/SvgIcon/index.vue')
  },
  {
    key: 'Modal',
    component: () => import('@/components/Modal/index.vue')
  }
] as const
