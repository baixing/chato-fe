import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']

export function useBasicLayout() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('lg')

  return { isMobile }
}

export function useIsMobile() {
  const userAgentInfo = navigator.userAgent
  const isExist = agents.filter((item) => userAgentInfo.includes(item))
  return isExist.length ? true : false
}

export const isIphone = () => navigator.userAgent.includes('iphone')
