/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UAZAPI_SUBDOMAIN: string
  readonly VITE_UAZAPI_TOKEN: string
  readonly VITE_UAZAPI_ADMIN_TOKEN: string
  readonly VITE_UAZAPI_INSTANCE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
