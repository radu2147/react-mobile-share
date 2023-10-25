import * as React from 'react'
import isNil from 'lodash/isNil'
import {
  AsyncProps,
  SyncProps,
  SyncShareReturn,
  AsyncShareReturn,
  AsyncWrapperProps,
  SyncWrapperProps,
} from './types'

type SyncShareState = {
  error: Error | null
  success: boolean
}

type AsyncShareState = SyncShareState & {
  loading: boolean
}

const useMobileShareAsync = ({ generateURL, title, text }: AsyncProps): AsyncShareReturn => {
  const [fetchState, setFetchState] = React.useState<AsyncShareState>({
    loading: false,
    error: null,
    success: false,
  })

  if (isNil(navigator) || !navigator.canShare()) {
    return {
      share: undefined,
      loading: false,
      error: null,
      success: false,
    }
  }

  const share = React.useCallback(async () => {
    setFetchState({ loading: true, error: null, success: false })
    generateURL()
      .then(async ({ url }) => {
        setFetchState({ loading: false, error: null, success: false })
        await navigator.share({
          url,
          title,
          text,
        })
        setFetchState({ error: null, loading: false, success: true })
      })
      .catch((e) => {
        const err = e instanceof Error ? e : new Error('Something went wrong: ' + e)
        setFetchState({ error: err, loading: false, success: false })
      })
  }, [setFetchState, generateURL, title, text])

  return { share, ...fetchState }
}

const useMobileShare = ({ url, title, text }: SyncProps): SyncShareReturn => {
  const [shareState, setShareState] = React.useState<SyncShareState>({
    error: null,
    success: false,
  })

  if (isNil(navigator) || !navigator.canShare()) {
    return { share: undefined, error: null, success: false }
  }

  const share = React.useCallback(async () => {
    try {
      await navigator.share({
        url,
        title,
        text,
      })
      setShareState({ error: null, success: true })
    } catch (e) {
      if (e instanceof Error) {
        setShareState({ error: e, success: false })
      } else {
        setShareState({ error: new Error('Something went wrong: ' + e), success: false })
      }
    }
  }, [url, title, text, setShareState])

  return { share, ...shareState }
}

const MobileShareWrapper = (props: SyncWrapperProps) => {
  const { share, error, success } = useMobileShare(props)

  const handleOnClick = React.useCallback(
    (onClick?: (e: React.MouseEvent<HTMLElement>) => void) =>
      async (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e)
        await share?.()
      },
    [share],
  )

  if (success) {
    props.onSuccess?.()
  }

  if (error) {
    props.onError?.(error)
    if (!isNil(props.renderError)) {
      return props.renderError(error)
    }
  }

  return (
    <>
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child, {
          ...child.props,
          onClick: handleOnClick(child.props.onClick),
        }),
      )}
    </>
  )
}

const MobileShareWrapperAsync = (props: AsyncWrapperProps) => {
  const { share, loading, error, success } = useMobileShareAsync({
    generateURL: props.generateURL,
    title: props.title,
    text: props.text,
  })

  const handleOnClick = React.useCallback(
    (onClick?: (e: React.MouseEvent<HTMLElement>) => void) =>
      (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e)
        share?.()
      },
    [share],
  )

  if (success) {
    props.onSuccess?.()
  }

  if (loading) {
    props.onLoad?.()
    if (!isNil(props.renderLoading)) {
      return props.renderLoading()
    }
  }

  if (error) {
    props.onError?.(error)
    if (!isNil(props.renderError)) {
      return props.renderError(error)
    }
  }

  return (
    <>
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child, {
          ...child.props,
          onClick: handleOnClick(child.props.onClick),
        }),
      )}
    </>
  )
}

export { useMobileShareAsync, useMobileShare, MobileShareWrapper, MobileShareWrapperAsync }
