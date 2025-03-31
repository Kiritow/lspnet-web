import { ElNotification } from 'element-plus'
import { z } from 'zod'

export async function loadUserInfo() {
  const res = await fetch('/auth/user')
  if (!res.ok) {
    console.log(res)
    if (res.status === 401) {
      console.log('User is not authenticated, redirect to login page')
      ElNotification({
        title: 'User not logged in',
        duration: 5000,
        message: 'Redirect to login page...',
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = '/auth/login/github'
    }
    throw new Error('Failed to load user info')
  }

  console.log('loading user data...')
  const data = await res.json()
  console.log(data)

  return z
    .object({
      username: z.string(),
    })
    .parse(data)
}

export async function logoutUser() {
  window.location.href = '/auth/logout'
}
