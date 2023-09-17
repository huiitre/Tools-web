import toast from '@/services/toast'

import { useFetchConnexion } from '@/modules/Login/hooks/useFetchConnexion'
import { createUserInfos } from '@/utils/Core/createUserInfos'
import router from '@/router/router'
import { useFetchRegister } from '@/modules/Login/hooks/useFetchRegister'

export const login = async ({ commit }: any, credentials: { email: string, password: string }) => {
  toast.clearAll()
  toast.loading('Connexion en cours ...')

  try {
    const { data } = await useFetchConnexion(credentials)
    if (!data.status)
      throw new Error(data.msg)

    const userInfos = createUserInfos(data.data)
    commit('insertUser', userInfos)
    commit('insertUserInLS', userInfos)
    toast.success('Connexion réussi !')
    router.push('/')
  } catch (err: any) {
    console.log("%c actions.ts #13 || ERROR : ", 'background:red;color:#fff;font-weight:bold;', err);
    commit('clearUser')
    commit('clearUserInLS')
    toast.error(err.message)
  } finally {
    toast.clearAll()
  }
}

// @ts-ignore
export const register = async ({ commit }: any, credentials: { email: string; password: string; confirm_password: string; name: string }) => {
  toast.clearAll()
  toast.loading('Inscription en cours ...')

  try {
    const { data } = await useFetchRegister(credentials)
    if (!data.status)
      throw new Error(data.msg)
    toast.success(data.msg)
    return data.status
  } catch (err: any) {
    console.log("%c actions.ts #38 || ERROR : ", 'background:red;color:#fff;font-weight:bold;', err);
    toast.error(err.message)
  } finally {
    toast.clearAll()
  }
}