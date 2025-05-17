import axios from "axios";
import LS from "./localStorage";
import store from "@/store/store";
import router from "@/router/router";
import toast from "./toast";
// import { useFetchConnexion } from "@/Modules/Login/hooks/useFetchConnexion";
const clientV1 = axios.create({
  baseURL: import.meta.env.VITE_TOOLS_API_URL_V1,
  headers: {
    'Content-Type': 'application/json',
  }
})
const clientV2 = axios.create({
  baseURL: import.meta.env.VITE_TOOLS_API_URL_V2,
  headers: {
    'Content-Type': 'application/json',
  }
})

const interceptors = (client: any) => {
  client.interceptors.request.use(async(config: any) => {

    //* flag pour la route sécurisé
    const requireToken = config.headers.requireToken
    
    //* est-ce qu'on est sur une route sécurisé
    if (requireToken) {

      //* token depuis le LS
      const { user } = LS.get('TOOLS_CORE_USER')

      //* token depuis le store
      const tokenStore = store.getters['Core/rememberToken']

      let rememberToken = ''
      
      //* est-ce qu'on possède un token dans le store
      if (tokenStore !== null) {
        rememberToken = tokenStore
      }
      //* est-ce qu'on possède un token en localstorage
      else if (user && user.remember_token !== null) {
        rememberToken = user.remember_token
      }
      //* SINON on a pas de token donc on redirige vers /login
      else {
        await store.dispatch('Core/clearUser')
        router.push('/login')
        return config
      }
      config.headers['Authorization'] = `Bearer ${rememberToken}`;
    }
    return config
})

  client.interceptors.response.use(async(response: any) => {
    const { data } = response

    // const userLS = LS.get('TOOLS_USER')

    //* le token n'est pas bon
    //! ancienne méthode de vérification
    if (
      typeof data?.status !== "undefined" && // ← vérifie que c’est bien une réponse PHP
      !data.status &&
      typeof data.msg === "string" &&
      (
        data.msg.includes("Token manquant") ||
        data.msg.includes("Utilisateur introuvable") ||
        data.msg.includes("La date de validité du token API est expirée") ||
        data.msg.includes("Erreur du middleware token API") ||
        data.msg.includes("Le compte est désactivé")
      )
    ) {
      store.dispatch("Core/clearUser");
      router.push("/login");
      // toast.error(data.msg);
    }

    /* //* si le token n'est plus valide
    if (!data.status && data.msg.includes('EW ERR 401 - IDUSER OR TOKEN UNIDENTIFY')) {
      //* on tente de regénérer un token et de relancer la requête
      try {
        // const data = await useFetchConnexion({ login: user.login, password: user.password })
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
    } */

    return response
  }, async (error: any) => {
    console.log(
      "%c axiosInstance.ts #99 || error de l'interceptor : ",
      "background:red;color:#fff;font-weight:bold;",
      error
    );

    // Vérifie que c’est une réponse reçue (donc pas une erreur réseau type CORS ou DNS)
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // 🔐 Token invalide, on dégage
        await store.dispatch("Core/clearUser");
        router.push("/login");
      }
    }

    // Re-balance l’erreur pour que le composant qui a déclenché la requête la reçoive aussi
    return Promise.reject(error);
  })
}

interceptors(clientV1)
interceptors(clientV2)

export { clientV1, clientV2 };