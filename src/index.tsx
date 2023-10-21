import React from 'react'
import isNil from 'lodash/isNil'
import { AsyncProps, SyncProps, SyncShareReturn, AsyncShareReturn } from './types'

type State = {
  loading: boolean
  error: Error | null
}

const useMobileShareAsync = ({ generateURL, title, text }: AsyncProps): AsyncShareReturn => {
  const [fetchState, setFetchState] = React.useState<State>({ loading: false, error: null })

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
        console.error(e)
        const err = e instanceof Error ? e : Error('Somthing went wrong: ' + e)
        setFetchState({ error: err, loading: false })
      })
  }, [setFetchState, generateURL, title, text])

  if (isNil(navigator) || !navigator.canShare() || !isNil(fetchState.error)) {
    return { share: undefined, loading: false, error: fetchState.error }
  }

  return { share, ...fetchState }
}

const useMobileShare = ({ url, title, text }: SyncProps): SyncShareReturn => {
  const [error, setError] = React.useState<Error | null>(null)

  const share = React.useCallback(async () => {
    try {
      await navigator.share({
        url,
        title,
        text,
      })
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        setError(e)
      }
      setError(Error('Something went wrong: ' + e))
    }
  }, [url, title, text])

  if (isNil(navigator) || !navigator.canShare() || !isNil(error)) {
    return { share: undefined, error }
  }

  return { share, error }
}

const MobileShareWrapper = (props: SyncProps & { children: Array<React.ReactElement> }) => {
  const { share } = useMobileShare(props)

  const handleOnClick = React.useCallback(
    (onClick?: (e: React.MouseEvent<HTMLElement>) => void) =>
      (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e)
        share?.()
      },
    [share],
  )

  return props.children.map((child) =>
    React.cloneElement(child, {
      ...child.props,
      onClick: handleOnClick(child.props.onClick),
    }),
  )
}

export { useMobileShareAsync, useMobileShare, MobileShareWrapper }
