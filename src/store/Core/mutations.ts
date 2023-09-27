import LS from "@/services/localStorage"
import { UserInfosType, baseUser } from "@/utils/Core/createUserInfos"

//* flag pour dire si l'utilisateur est connecté ou non
export const isLogged = (state: any, isLogged: boolean) => state.user.isLogged = isLogged

//* Insertion des data utilisateur dans le store et en localstorage
export const insertUser = (state: any, data: UserInfosType) => state.user = { ...data }
export const insertUserInLS = (data: UserInfosType) => LS.set('TOOLS_CORE', data)

//* Clear des data utilisateur dans le store et en localstorage
export const clearUser = (state: any) => state.user = { ...baseUser }
export const clearUserInLS = () => LS.clear()