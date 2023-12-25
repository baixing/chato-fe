export function getCurrentEnv() {
  return import.meta.env.VITE_APP_ENV || 'prod'
}

export const currentEnvConfig = {
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  uploadBaseURL: import.meta.env.VITE_APP_UPLOAD_BASE_URL,
  wwwBaseURL: import.meta.env.VITE_APP_WWW_BASE_URL,
  scriptURL: import.meta.env.VITE_APP_SCRIPT_URL,
  socketURL: import.meta.env.VITE_APP_SOCKET_URL,
  socketCRMURL: import.meta.env.VITE_APP_SOCKET_CRM_URL,
  asrSocketURL: import.meta.env.VITE_APP_ASR_SOCKET_URL
}
