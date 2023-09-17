/**
 * OBJET UTILISATEUR
 */
export type UserInfosType = {
  isLogged: boolean;
  iduser: number;
  email: string;
  is_active: number;
  name: string;
  remember_token: string;
  role: number;
  token_date: string;
  created_at: string;
}
export const baseUser = {
  isLogged: false,
  iduser: null,
  email: null,
  is_active: null,
  name: null,
  remember_token: null,
  role: null,
  token_date: null,
  created_at: null
}
export function createUserInfos(data: UserInfosType) {
  return {
    ...baseUser,
    ...data,
    isLogged: true
  };
}