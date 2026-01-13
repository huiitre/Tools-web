import store from '@/store/store'
import LS from '../../../services/localStorage'
import router from '../../../router/router'

export const useFetchUpdateItemTypes = (
  onMessage: (data: any) => void,
  onError?: (msg: string) => void
) => {
  const { user } = LS.get('TOOLS_CORE_USER') || {}
  const tokenStore = store.getters['Core/rememberToken']

  let rememberToken = ''
  if (tokenStore !== null) {
    rememberToken = tokenStore
  } else if (user && user.remember_token !== null) {
    rememberToken = user.remember_token
  } else {
    const msg = '⚠️ Aucun token trouvé'
    console.error(msg)
    onError?.(msg)
    return null
  }

  const url = `${import.meta.env.VITE_TOOLS_API_BASE_URL}/api/v2/dofus/configuration/update-item-types?token=${rememberToken}`

  const eventSource = new EventSource(url, { withCredentials: true })

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      onMessage(parsed)
    } catch (err) {
      const msg = `❌ Erreur de parsing SSE : ${event.data}`
      console.error(msg, err)
      onError?.(msg)
    }
  }

  eventSource.onerror = (event) => {
    const es = event.currentTarget as EventSource
    let state = 'UNKNOWN'
    if (es.readyState === EventSource.CONNECTING) state = 'CONNECTING'
    if (es.readyState === EventSource.OPEN) state = 'OPEN'
    if (es.readyState === EventSource.CLOSED) state = 'CLOSED'

    const msg = `❌ Erreur SSE [state=${state}] sur ${es.url}`
    console.error(msg, event)

    onError?.(msg)
    eventSource.close()
  }

  return eventSource
}

export const useFetchUpdateItems = (
  onMessage: (data: any) => void,
  onError?: (msg: string) => void
) => {
  const { user } = LS.get('TOOLS_CORE_USER') || {}
  const tokenStore = store.getters['Core/rememberToken']

  let rememberToken = ''
  if (tokenStore !== null) {
    rememberToken = tokenStore
  } else if (user && user.remember_token !== null) {
    rememberToken = user.remember_token
  } else {
    const msg = '⚠️ Aucun token trouvé'
    console.error(msg)
    onError?.(msg)
    return null
  }

  const url = `${import.meta.env.VITE_TOOLS_API_BASE_URL}/api/v2/dofus/configuration/update-items?token=${rememberToken}`

  const eventSource = new EventSource(url, { withCredentials: true })

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      onMessage(parsed)
    } catch (err) {
      const msg = `❌ Erreur de parsing SSE : ${event.data}`
      console.error(msg, err)
      onError?.(msg)
    }
  }

  eventSource.onerror = (event) => {
    const es = event.currentTarget as EventSource
    let state = 'UNKNOWN'
    if (es.readyState === EventSource.CONNECTING) state = 'CONNECTING'
    if (es.readyState === EventSource.OPEN) state = 'OPEN'
    if (es.readyState === EventSource.CLOSED) state = 'CLOSED'

    const msg = `❌ Erreur SSE [state=${state}] sur ${es.url}`
    console.error(msg, event)

    onError?.(msg)
    eventSource.close()
  }

  return eventSource
}

export const useFetchUpdateRecipes = (
  onMessage: (data: any) => void,
  onError?: (msg: string) => void
) => {
  const { user } = LS.get('TOOLS_CORE_USER') || {}
  const tokenStore = store.getters['Core/rememberToken']

  let rememberToken = ''
  if (tokenStore !== null) {
    rememberToken = tokenStore
  } else if (user && user.remember_token !== null) {
    rememberToken = user.remember_token
  } else {
    const msg = '⚠️ Aucun token trouvé'
    console.error(msg)
    onError?.(msg)
    return null
  }

  const url = `${import.meta.env.VITE_TOOLS_API_BASE_URL}/api/v2/dofus/configuration/update-recipes?token=${rememberToken}`

  const eventSource = new EventSource(url, { withCredentials: true })

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      onMessage(parsed)
    } catch (err) {
      const msg = `❌ Erreur de parsing SSE : ${event.data}`
      console.error(msg, err)
      onError?.(msg)
    }
  }

  eventSource.onerror = (event) => {
    const es = event.currentTarget as EventSource
    let state = 'UNKNOWN'
    if (es.readyState === EventSource.CONNECTING) state = 'CONNECTING'
    if (es.readyState === EventSource.OPEN) state = 'OPEN'
    if (es.readyState === EventSource.CLOSED) state = 'CLOSED'

    const msg = `❌ Erreur SSE [state=${state}] sur ${es.url}`
    console.error(msg, event)

    onError?.(msg)
    eventSource.close()
  }

  return eventSource
}
