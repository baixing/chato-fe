import { useLocales } from '@/stores/locales'
import { localeImagePath } from '@/utils/help'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

export default function useImagePath(
  imageName: string,
  subDir: string = '',
  fileType: string = 'png'
) {
  const locales = useLocales()
  const { locale } = storeToRefs(locales)
  const imageSrc = ref('') // This will hold the actual image source
  watch(
    locale,
    (newLocale, oldLocale) => {
      if (newLocale !== oldLocale) {
        generatePath(imageName, subDir, fileType)
      }
    },
    { deep: true }
  )

  const generatePath = async (imageName: string, subDir: string = '', fileType: string = 'png') => {
    try {
      const src = await localeImagePath(imageName, locale.value, subDir, fileType)
      imageSrc.value = src
    } catch (error) {
      console.error('Failed to set image path:', error)
    }
  }

  generatePath(imageName, subDir, fileType)

  return {
    ImagePath: imageSrc,
    setImagePath: generatePath
  }
}
