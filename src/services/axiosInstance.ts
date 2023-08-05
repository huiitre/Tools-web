import axios from "axios";
import LS from "./localStorage";
import { clearToasts } from "mosha-vue-toastify";
import { useFetchConnexion } from "@/Modules/Login/hooks/useFetchConnexion";
import router from "@/router/router";
import store from "@/store/store";

const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
  }
})


client.interceptors.request.use((config) => {
  const user = LS.get('TOOLZ2_USER')

  //? Pour chaque requête qu'on va intercepter, on y insère l'iduser et le token provenant du state
  //* on insère l'iduser et le token dans la requête
  if (!config.params && user && config.url !== '/login') {
    config.params = {
      iduser: user.iduser,
      token: user.token
    }
  }

  if (config.url === '/login') {
    config.baseURL = import.meta.env.VITE_TOOLZ_API_URL
  }
  else
    config.baseURL = import.meta.env.VITE_TOOLZ_WEB_URL

  return config
})

client.interceptors.response.use(async(response) => {
  const { data } = response

  const user = LS.get('TOOLZ2_USER')

  //* si le token n'est plus valide
  if (!data.status && data.msg.includes('EW ERR 401 - IDUSER OR TOKEN UNIDENTIFY')) {
    //* on tente de regénérer un token et de relancer la requête
    try {
      const data = await useFetchConnexion({ login: user.login, password: user.password })
      //* si l'identifiant est incorrect
      if (!data.status)
        throw new DOMException(data.msg)

      //* on relance la requête précédente
      const requestConfig = response.config

      //* on lui ajouter les paramètres
      requestConfig.params = {
        iduser: data.iduser,
        token: data.token
      }

      //* on vérifie les en-tête de la requête (headers)
      if (requestConfig.headers && typeof requestConfig.headers === 'object') {
        for (const header in requestConfig.headers) {
          if (typeof requestConfig.headers[header] === 'object') {
            requestConfig.headers[header] = JSON.stringify(requestConfig.headers[header]);
          }
        }
      }

      //* les data de la req précédente sont déjà stringifié, on doit re-PARSER ces data avant de les renvoyer
      if (requestConfig.data)
        requestConfig.data = JSON.parse(requestConfig.data)

      //* on stock en LS et dans le state
      store.commit('Core/insertUser', {
        login: user.login,
        password: user.password,
        status: data.status,
        iduser: data.iduser,
        token: data.token
      })

      //* on relance la précédente requête
      //! la requête retourne une erreur comme quoi on lui donne une valeur vide alors qu'on a bien les valeurs dans le body de la requête, va comprendre ...
      //! le seul truc qui diffère d'une requête OK c'est le fait qu'on ai pas de requête OPTION avant, possible que ça vienne de là
      //? La solution était de PARSER le data de la requête précédente afin d'envoyer un objet et non un string ... car j'imagine que le stringify des data en json doit se faire dans l'instance d'axios. L'interceptor récupère la précédente requête qui a foiré, les data sont déjà stringifié, donc pour pouvoir la relancer il faut re-PARSER les data
      return client(requestConfig)

    } catch (e) {
      //* on a pas réussi à se co, on retourne sur /login et on vide le LS et le state
      store.commit('Core/clearUser')
      LS.delete('TOOLZ2_USER')
      router.push('/login')
    } finally {
      clearToasts()
    }
  }

  return response
}, (error) => {
  console.log("%c axiosInstance.ts #31 || error de l'interceptor : ", 'background:red;color:#fff;font-weight:bold;', error);
})

export default client;