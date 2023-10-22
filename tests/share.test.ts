import { act, renderHook } from '@testing-library/react'
import { useMobileShare, useMobileShareAsync } from '../src'
import { wait } from '@testing-library/user-event/dist/utils'

describe('Sync share hook', () => {
  beforeEach(() => {
    window.navigator.canShare = jest.fn(() => true)
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
    expect(result.current.error?.message).toEqual('Somthing went wrong: Weird error')
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
            }, 1000),
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

    await act(async () => {
      await wait(1000)
    })

    expect(result.current.loading).toBe(false)
  })
})
