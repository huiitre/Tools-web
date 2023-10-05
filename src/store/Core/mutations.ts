import LS from "@/services/localStorage"
import { UserInfosType, baseUser } from "@/utils/Core/createUserInfos"

//* flag pour dire si l'utilisateur est connecté ou non
export const isLogged = (state: any, isLogged: boolean) => state.user.isLogged = isLogged

//* Insertion des data utilisateur dans le store et en localstorage
export const insertUserInStore = (state: any, data: UserInfosType) => state.user = { ...data }
// export const insertUserInLS = (data: UserInfosType) => LS.set('TOOLS_CORE_USER', data)
export const insertTokenAndIduserInLS = (data: any) => {
  LS.set('TOOLS_CORE_USER', data)
}

//* insertion des paramètres utilisateur (modifiable ?) en localstorage et dans le store
export const insertConfigUser = (state: any, data: any) => state.config = { ...data }
export const insertConfigInLS = (data: any) => LS.set('TOOLS_CORE_CONFIG', data)

//* Clear des data utilisateur dans le store et en localstorage
export const clearUser = (state: any) => state.user = { ...baseUser }
export const clearLS = () => LS.clear()