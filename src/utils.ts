import { ElMessage, ElNotification } from 'element-plus'

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg ?? 'Assertion failed')
}

class ErrorAsCardMessage extends Error {
  title: string

  constructor(title: string, message: string) {
    super(message)
    this.title = title
    this.name = 'ErrorAsCardMessage'
  }
}

export async function justGet(url: string, params?: Record<string, string>) {
  try {
    const useUrl = params !== undefined ? url + '?' + new URLSearchParams(params).toString() : url
    const res = await fetch(useUrl)
    if (res.status === 403) {
      const data = await res.text()
      throw new ErrorAsCardMessage('Permission denied', data)
    }

    if (res.status === 400) {
      const data = await res.text()
      throw new ErrorAsCardMessage('Invalid parameters', data)
    }

    if (!res.ok) {
      const data = await res.text()
      throw new Error(`request failed with [${res.status}] ${data}`)
    }

    return await res.json()
  } catch (e) {
    console.log(e)
    if (e instanceof ErrorAsCardMessage) {
      ElNotification({
        title: e.title,
        duration: 5000,
        message: e.message,
      })
    } else {
      ElMessage({
        showClose: true,
        duration: 3000,
        message: `GET ${url} failed: ${e instanceof Error ? e.message : `${e}`}`,
      })
    }

    throw e
  }
}

export async function justPost(url: string, jsonData?: unknown) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })

    if (res.status === 403) {
      const data = await res.text()
      throw new ErrorAsCardMessage('Permission denied', data)
    }

    if (res.status === 400) {
      const data = await res.text()
      throw new ErrorAsCardMessage('Invalid parameters', data)
    }

    if (!res.ok) {
      const data = await res.text()
      throw new Error(`request failed with [${res.status}] ${data}`)
    }

    return await res.json()
  } catch (e) {
    console.log(e)
    if (e instanceof ErrorAsCardMessage) {
      ElNotification({
        title: e.title,
        duration: 5000,
        message: e.message,
      })
    } else {
      ElMessage({
        showClose: true,
        duration: 3000,
        message: `POST ${url} failed: ${e instanceof Error ? e.message : `${e}`}`,
      })
    }

    throw e
  }
}

export function formatLocalTime(t: Date | string) {
  if (typeof t === 'string') {
    const pt = new Date(t)
    return formatLocalTime(pt)
  }

  if (isNaN(t.getTime())) {
    return 'Invalid Date'
  }

  const year = t.getFullYear()
  const month = String(t.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(t.getDate()).padStart(2, '0')

  const hours = String(t.getHours()).padStart(2, '0')
  const minutes = String(t.getMinutes()).padStart(2, '0')
  const seconds = String(t.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (Local)`
}
