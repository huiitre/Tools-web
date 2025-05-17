import { useFetchConnexion } from '@/modules/Login/hooks/useFetchConnexion'
import { createUserInfos } from '@/utils/Core/createUserInfos'
import router from '@/router/router'
import { useFetchRegister } from '@/modules/Login/hooks/useFetchRegister'
import store from '../store'
import { useFetchDisconnectUser } from '@/modules/Login/hooks/useFetchDisconnectUser'
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'
import { useFetchConnexionWithGoogle } from '@/modules/Login/hooks/useFetchConnexionWithGoogle'
import { clientV2 } from '@/services/axiosInstance'
import { isMobileDevice, isPWA } from '@/composables/useDeviceDetection';

const handleLogin = async (authFunction: () => Promise<any>) => {
  try {
    const { data } = await authFunction();

    const userInfos = createUserInfos(data.data);
    store.dispatch('Core/insertUser', userInfos);

    return { msg: 'Connexion réussie !' };
  } catch (err: any) {
    store.dispatch('Core/clearUser');
    throw { status: 0, msg: err.message };
  }
};

export const login = async ({ commit }: any, credentials: { email: string, password: string }) => {
  return handleLogin(() => useFetchConnexion(credentials));
};

// Action pour la connexion via Google
export const loginWithGoogle = async ({ commit }: any, payload: any) => {
  return handleLogin(() => useFetchConnexionWithGoogle(payload));
};

// @ts-ignore
export const register = ({ commit }: any, credentials: { email: string; password: string; confirm_password: string; name: string }) => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchRegister(credentials)
      
      resolve({ msg: data.msg })
    } catch (err: any) {
      reject({ status: 0, msg: err.message })
    }
  })
}

export const disconnectUser = async() => {
  return new Promise(async(resolve, reject) => {
    try {
      const { data } = await useFetchDisconnectUser()

      resolve({ msg: data.msg })
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

      resolve({ data: data.data })
    } catch (err: any) {
      store.dispatch('Core/clearUser')
      router.push('/')
      reject({ status: 0, msg: err.message })
    }
  })
}

export const getUserModules = async({ commit }: any) => {
  try {
    const { data } = await clientV2.get('core/user/getusermodule', { headers: { requireToken: true } })
    return data
  } catch(err) {
    throw err
  }
}

export const insertUser = ({ commit }: any, userInfos: any) => {
  commit('insertUserInStore', userInfos)
  commit('insertUserInLS', { iduser: userInfos.iduser, token: userInfos.remember_token })
  return Promise.resolve()
}

export const clearUser = ({ commit }: any) => {
  commit('clearUser')
  commit('clearLS')
}

export const detectPlatform = ({ commit }: any) => {
  let platform = 'desktop';

  if (window && (window as any).process && (window as any).process.type) {
    platform = 'electron';
  } else if (isMobileDevice()) {
    platform = isPWA() ? 'pwa' : 'mobile';
  }

  commit('setPlatform', platform);
}