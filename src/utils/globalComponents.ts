export const globalComponents = [
  {
    key: 'svg-icon',
    component: () => import('@/components/SvgIcon/index.vue')
  },
  {
    key: 'Modal',
    component: () => import('@/components/Modal/index.vue')
  },
  {
    key: 'Avatar',
    component: () => import('@/components/Avatar/index.vue')
  },
  {
    key: 'AvatarModal',
    component: () => import('@/components/AvatarModal/AvatarModal.vue')
  }
] as const
