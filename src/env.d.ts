/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_SENTRY_DSN: string
  readonly VITE_APP_SENTRY_TOKEN: string
  readonly VITE_APP_SENTRY_URL: string
  readonly VITE_APP_SENTRY_ORG: string
  readonly VITE_APP_SENTRY_PROJECT: string
  readonly VITE_APP_SENSORS_URL: string
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_UPLOAD_BASE_URL: string
  readonly VITE_APP_WWW_BASE_URL: string
  readonly VITE_APP_SCRIPT_URL: string
  readonly VITE_APP_SOCKET_URL: string
  readonly VITE_APP_SOCKET_CRM_URL: string
  readonly VITE_APP_ASR_SOCKET_URL: string
  readonly VITE_APP_MIDJOURNEY_DOMAIN_SLUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
