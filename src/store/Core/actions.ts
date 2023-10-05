import { useFetchConnexion } from '@/modules/Login/hooks/useFetchConnexion'
import { createUserInfos } from '@/utils/Core/createUserInfos'
import router from '@/router/router'
import { useFetchRegister } from '@/modules/Login/hooks/useFetchRegister'
import store from '../store'
import { useFetchDisconnectUser } from '@/modules/Login/hooks/useFetchDisconnectUser'
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'

export const login = ({ commit }: any, credentials: { email: string, password: string }) => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchConnexion(credentials)
      if (!data.status)
        throw new Error(data.msg)
  
      const userInfos = createUserInfos(data.data)
      store.dispatch('Core/insertUser', userInfos)
      router.push('/')
      resolve({ status: data.status, msg: 'Connexion réussi !' })
    } catch (err: any) {
      store.dispatch('Core/clearUser')
      reject({ status: 0, msg: err.message })
    }
  })
}

// @ts-ignore
export const register = ({ commit }: any, credentials: { email: string; password: string; confirm_password: string; name: string }) => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchRegister(credentials)
      if (!data.status)
        throw new Error(data.msg)
      
      resolve({ status: data.status, msg: data.msg })
    } catch (err: any) {
      reject({ status: 0, msg: err.message })
    }
  })
}

export const disconnectUser = async() => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchDisconnectUser()
      if (!data.status)
        throw new Error(data.msg)

      resolve({ status: data.status, msg: data.msg })
    } catch(err: any) {
      reject({ status: 0, msg: err.message })
    } finally {
      store.dispatch('Core/clearUser')
      router.push('/login')
    }
  })
}

// @ts-ignore
export const getInfosUser = ({ commit }: any) => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchUserInfos()
      console.log("%c actions.ts #63 || data : ", 'background:red;color:#fff;font-weight:bold;', data);
      if (!data.status)
        throw new Error(data.msg)

      resolve({ status: data.status, data: data.data })
    } catch (err: any) {
      store.dispatch('Core/clearUser')
      router.push('/')
      reject({ status: 0, msg: err.message })
    }
  })
}

export const insertUser = ({ commit }: any, userInfos: any) => {
  commit('insertUserInStore', userInfos)
  commit('insertTokenAndIduserInLS', { iduser: userInfos.iduser, token: userInfos.remember_token })
}

export const clearUser = ({ commit }: any) => {
  commit('clearUser')
  commit('clearLS')
}