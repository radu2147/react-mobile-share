import React from 'react'

import { act, renderHook, render, waitFor } from '@testing-library/react'
import {
  MobileShareWrapper,
  MobileShareWrapperAsync,
  useMobileShare,
  useMobileShareAsync,
} from '../src'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

describe('Sync share hook', () => {
  beforeEach(() => {
    window.navigator.canShare = jest.fn(() => true)
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('Native share does not exist', () => {
    window.navigator.canShare = jest.fn(() => false)
    const { result } = renderHook(useMobileShare, { initialProps: { url: 'test', title: 'Hellp' } })
    expect(result.current.share).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  test('Native share throws non-error object', async () => {
    window.navigator.share = jest.fn(() => {
      throw 'Test error'
    })
    const { result } = renderHook(useMobileShare, { initialProps: { url: 'test', title: 'Hellp' } })
    // initial state
    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.share?.()
    })

    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error?.message).toEqual('Something went wrong: Test error')
  })

  test('Native share throws error', async () => {
    window.navigator.share = jest.fn(() => {
      throw new Error('Test error')
    })
    const { result } = renderHook(useMobileShare, { initialProps: { url: 'test', title: 'Hellp' } })
    // initial state
    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.share?.()
    })

    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error?.message).toEqual('Test error')
  })
})

describe('MobileShareWrapper', () => {
  beforeEach(() => {
    window.navigator.canShare = jest.fn(() => true)
  })

  test('Native share throws non-error object', async () => {
    window.navigator.share = jest.fn(() => {
      throw 'Test error'
    })
    const onError = jest.fn()
    const onSuccess = jest.fn()
    const { getByTestId } = render(
      <MobileShareWrapper
        title='Test'
        url='https://example.com'
        onError={onError}
        onSuccess={onSuccess}
        renderError={(e) => <p data-testid='error'>{e.message}</p>}
      >
        <div data-testid='test' onClick={() => {}}>
          Click
        </div>
      </MobileShareWrapper>,
    )

    await act(async () => {
      await userEvent.click(getByTestId('test'))
    })

    expect(() => getByTestId('test')).toThrow()
    expect(getByTestId('error').innerHTML).toEqual('Something went wrong: Test error')
    expect(onError).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('Native share throws error', async () => {
    window.navigator.share = jest.fn(() => {
      throw new Error('Test error')
    })
    const { getByTestId } = render(
      <MobileShareWrapper
        title='Test'
        url='https://example.com'
        renderError={(e) => <p data-testid='error'>{e.message}</p>}
      >
        <div data-testid='test' onClick={() => {}}>
          Click
        </div>
      </MobileShareWrapper>,
    )

    await act(async () => {
      await userEvent.click(getByTestId('test'))
    })

    expect(() => getByTestId('test')).toThrow()
    expect(getByTestId('error').innerHTML).toEqual('Test error')
  })
})

describe('MobileShareWrapperAsync', () => {
  beforeEach(() => {
    window.navigator.canShare = jest.fn(() => true)
  })

  test('Native share throws non-error object', async () => {
    window.navigator.share = jest.fn()
    const urlPromise = () => new Promise<{ url: string }>((_, rej) => rej('Test error'))
    const { getByTestId } = render(
      <MobileShareWrapperAsync
        title='Test'
        generateURL={urlPromise}
        renderLoading={() => <p data-testid='loading'>Loading</p>}
        renderError={(e) => <p data-testid='error'>{e.message}</p>}
      >
        <div data-testid='test' onClick={() => {}}>
          Click
        </div>
      </MobileShareWrapperAsync>,
    )

    await act(async () => {
      await userEvent.click(getByTestId('test'))
    })

    expect(() => getByTestId('test')).toThrow()
    expect(() => getByTestId('loading')).toThrow()
    expect(getByTestId('error').innerHTML).toEqual('Something went wrong: Test error')
  })

  test('Native share throws error', async () => {
    window.navigator.share = jest.fn()
    const onError = jest.fn()
    const onSuccess = jest.fn()

    const urlPromise = () => new Promise<{ url: string }>((_, rej) => rej(new Error('Test error')))
    const { getByTestId } = render(
      <MobileShareWrapperAsync
        title='Test'
        generateURL={urlPromise}
        onError={onError}
        onSuccess={onSuccess}
        renderLoading={() => <p data-testid='loading'>Loading</p>}
        renderError={(e) => <p data-testid='error'>{e.message}</p>}
      >
        <div data-testid='test' onClick={() => {}}>
          Click
        </div>
      </MobileShareWrapperAsync>,
    )

    await act(async () => {
      await userEvent.click(getByTestId('test'))
    })

    expect(() => getByTestId('test')).toThrow()
    expect(() => getByTestId('loading')).toThrow()
    expect(getByTestId('error').innerHTML).toEqual('Test error')
    expect(onError).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('Native share loading state', async () => {
    window.navigator.share = jest.fn()
    const onLoad = jest.fn()
    const onSuccess = jest.fn()

    const urlPromise = () =>
      new Promise<{ url: string }>((res) =>
        setTimeout(() => {
          res({ url: 'https://url' })
        }, 300),
      )
    const { getByTestId } = render(
      <MobileShareWrapperAsync
        title='Test'
        generateURL={urlPromise}
        onLoad={onLoad}
        onSuccess={onSuccess}
        renderLoading={() => <p data-testid='loading'>Loading</p>}
        renderError={(e) => <p data-testid='error'>{e.message}</p>}
      >
        <div data-testid='test' onClick={() => {}}>
          Click
        </div>
      </MobileShareWrapperAsync>,
    )

    await act(async () => {
      await userEvent.click(getByTestId('test'))
    })

    expect(getByTestId('loading')).toBeDefined()
    expect(onLoad).toHaveBeenCalled()
    expect(() => getByTestId('error')).toThrow()

    await waitFor(() => {
      expect(getByTestId('test').innerHTML).toEqual('Click')
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})

describe('Async share hook', () => {
  beforeEach(() => {
    window.navigator.canShare = jest.fn(() => true)
  })

  test('Native share does not exist', () => {
    window.navigator.canShare = jest.fn(() => false)
    const { result } = renderHook(useMobileShareAsync, {
      initialProps: {
        generateURL: () => new Promise((res) => res({ url: 'https://url' })),
        title: 'Hellp',
      },
    })
    expect(result.current.share).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  test('Native share throws error', async () => {
    window.navigator.share = jest.fn(() => {
      throw new Error('Test error')
    })
    const { result } = renderHook(useMobileShareAsync, {
      initialProps: {
        generateURL: () => new Promise((res) => res({ url: 'https://url' })),
        title: 'Hellp',
      },
    })
    // initial state
    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.share?.()
    })

    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error?.message).toEqual('Test error')
  })

  test('Native share throws non-error object', async () => {
    window.navigator.share = jest.fn(() => {
      throw new Error('Test error')
    })
    const { result } = renderHook(useMobileShareAsync, {
      initialProps: {
        generateURL: () => new Promise((_, rej) => rej('Weird error')),
        title: 'Hellp',
      },
    })
    // initial state
    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.share?.()
    })

    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error?.message).toEqual('Something went wrong: Weird error')
  })

  test('Native share loading state', async () => {
    window.navigator.share = jest.fn(() => {
      return new Promise<void>((res) => res())
    })
    const { result } = renderHook(useMobileShareAsync, {
      initialProps: {
        generateURL: () =>
          new Promise((res) =>
            setTimeout(() => {
              res({ url: 'https://url' })
            }, 300),
          ),
        title: 'Hellp',
      },
    })
    expect(result.current.share).not.toBeUndefined()
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.share?.()
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})
