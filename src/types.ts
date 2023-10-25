import React from 'react'

type BaseProps = {
  title: string
  text?: string
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
  success: boolean
}

export type AsyncShareReturn = SyncShareReturn & {
  loading: boolean
}

export type SyncWrapperProps = SyncProps & {
  onError?: (e: Error) => void
  onSuccess?: () => void
  children: Array<React.ReactElement> | React.ReactElement
  renderError?: (e: Error) => React.ReactElement
}

export type AsyncWrapperProps = AsyncProps & {
  onLoad?: () => void
  onError?: (e: Error) => void
  onSuccess?: () => void
  children: Array<React.ReactElement> | React.ReactElement
  renderLoading?: () => React.ReactElement
  renderError?: (e: Error) => React.ReactElement
}
