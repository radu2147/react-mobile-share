type BaseProps = {
  title: string
  text: string
}

export type AsyncProps = BaseProps & {
  generateURL: () => Promise<{ url: string }>
}

export type SyncProps = BaseProps & {
  url: string
}

export type SyncShareReturn = {
  share: (() => Promise<void>) | undefined
  error: Error | null
}

export type AsyncShareReturn = SyncShareReturn & {
  loading: boolean
}
