import * as React from 'react'
import isNil from 'lodash/isNil'
import { AsyncProps, SyncProps, SyncShareReturn, AsyncShareReturn } from './types'

type State = {
  loading: boolean
  error: Error | null
}

const useMobileShareAsync = ({ generateURL, title, text }: AsyncProps): AsyncShareReturn => {
  const [fetchState, setFetchState] = React.useState<State>({ loading: false, error: null })

  if (isNil(navigator) || !navigator.canShare()) {
    return {
      share: undefined,
      loading: false,
      error: null,
    }
  }

  const share = React.useCallback(async () => {
    setFetchState({ loading: true, error: null })
    generateURL()
      .then(async ({ url }) => {
        setFetchState({ loading: false, error: null })
        await navigator.share({
          url,
          title,
          text,
        })
      })
      .catch((e) => {
        const err = e instanceof Error ? e : new Error('Something went wrong: ' + e)
        setFetchState({ error: err, loading: false })
      })
  }, [setFetchState, generateURL, title, text])

  if (!isNil(fetchState.error)) {
    return { share, loading: false, error: fetchState.error }
  }

  return { share, ...fetchState }
}

const useMobileShare = ({ url, title, text }: SyncProps): SyncShareReturn => {
  const [error, setError] = React.useState<Error | null>(null)

  if (isNil(navigator) || !navigator.canShare()) {
    return { share: undefined, error: null }
  }

  const share = React.useCallback(async () => {
    try {
      await navigator.share({
        url,
        title,
        text,
      })
    } catch (e) {
      if (e instanceof Error) {
        setError(e)
      } else {
        setError(new Error('Something went wrong: ' + e))
      }
    }
  }, [url, title, text, setError])

  return { share, error }
}

const MobileShareWrapper = (
  props: SyncProps & {
    children: Array<React.ReactElement> | React.ReactElement
    renderError?: (e: Error) => React.ReactElement
  },
) => {
  const { share, error } = useMobileShare(props)

  const handleOnClick = React.useCallback(
    (onClick?: (e: React.MouseEvent<HTMLElement>) => void) =>
      (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e)
        share?.()
      },
    [share],
  )

  if (error) {
    return <>{props.renderError?.(error)}</>
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

const MobileShareWrapperAsync = (
  props: AsyncProps & {
    children: Array<React.ReactElement> | React.ReactElement
    renderLoading: () => React.ReactElement
    renderError?: (e: Error) => React.ReactElement
  },
) => {
  const { share, loading, error } = useMobileShareAsync(props)

  const handleOnClick = React.useCallback(
    (onClick?: (e: React.MouseEvent<HTMLElement>) => void) =>
      (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e)
        share?.()
      },
    [share],
  )

  if (loading) {
    return props.renderLoading()
  }

  if (error) {
    return <>{props.renderError?.(error)}</>
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
