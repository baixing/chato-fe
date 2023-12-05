import { ChatMessageImgLimit_Size_800 } from '@/constant/chat'
import { validateURL } from './validate'

export const formatChatMessageAnswer = ({
  content,
  type = 'text',
  lastContent = ''
}: {
  content: string
  type?: 'text' | 'mj_image'
  lastContent?: string
}) => {
  if (type === 'mj_image') {
    return validateURL(content) ? `${content}${ChatMessageImgLimit_Size_800}` : content
  } else {
    return lastContent + content
  }
}
