<script setup lang="ts">
import website_img from '@/assets/img/Core/website_img.jpg';
import { computed, ref, onMounted } from 'vue';
// components
import store from '@/store/store';
import toast from '@/services/toast';
import router from '@/router/router';

const isLoading = computed(() => store.getters['Core/isLoading']);
let REDIRECT_URI = '';
if (import.meta.env.DEV) {
  console.log("Environnement de développement");
  REDIRECT_URI = 'http://localhost:5173'
} else if (import.meta.env.PROD) {
  console.log("Environnement de production");
  REDIRECT_URI = 'https://tools.huiitre.fr'
}

const platform = store.getters['Core/getPlatform'];
const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB

//* mode connexion ou inscription
const formMode = ref(false);
const toggleFormMode = computed(() => formMode.value ? 'Inscription' : 'Connexion');

// les refs
const form = ref(false);
const email = ref(null);
const password = ref(null);
const showPassword = ref(false);
const loading = ref(false);

const required = (v: string) => !!v || 'Le champ est obligatoire !';
const validEmail = (v: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(v) || 'Veuillez entrer une adresse email valide !';
};

const handleLogin = async (action: string, payload: any) => {
  try {
    store.commit('Core/isLoading', true);
    const result = await store.dispatch(action, payload);

    if (!result?.status) throw result.msg;

    //* récupération des modules
    const { data } = await store.dispatch('Core/getUserModules');
    store.commit('Core/setUserModules', data);

    router.push('/');
    toast.success(result.msg);
  } catch (err: any) {
    toast.error(err.msg);
  } finally {
    store.commit('Core/isLoading', false);
    toast.clearAll();
  }
};

// Connexion classique
const handleSubmitConnection = async () => {
  if (!form.value) {
    console.error('Formulaire invalide !');
    return;
  }
  await handleLogin('Core/login', { email: email.value, password: password.value });
};

// Connexion via Google (SDK standard)
const handleGoogleLogin = async (response: any) => {
  const googleJwt = response?.credential;
  if (!googleJwt) {
    console.error('JWT Google manquant dans la réponse');
    return;
  }
  await handleLogin('Core/loginWithGoogle', { googleJwt });
};

// Méthode de connexion Google personnalisée pour mobile (Android/iOS)
const handleGoogleCustomLogin = async () => {
  console.log("Connexion Google personnalisée pour mobile initiée");
  /* if (platform === 'mobile') {
    console.log("%c Login.vue #85 || dans le if", 'background:blue;color:#fff;font-weight:bold;');
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    console.log("%c Login.vue #87 || GoogleAuth : ", 'background:red;color:#fff;font-weight:bold;', GoogleAuth);
    try {
      const googleUser = await GoogleAuth.signIn();
      console.log("%c Login.vue #89 || googleUser : ", 'background:red;color:#fff;font-weight:bold;', googleUser);
      console.log("Utilisateur connecté :", googleUser);
      // Ici, vous pouvez envoyer le token à votre backend ou stocker les infos utilisateur
    } catch (error) {
      console.error("Erreur lors de la connexion Google", error);
    }
  } */
};

onMounted(() => {
  const waitForGoogleSDK = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      (window as any).handleGoogleLogin = handleGoogleLogin;
      window.google.accounts.id.initialize({
        client_id: VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => handleGoogleLogin(response)
      });

      const buttonContainer = document.querySelector('.g_id_signin');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(
          buttonContainer,
          {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left'
          }
        );
      } else {
        console.error("Conteneur pour le bouton Google introuvable");
      }
    } else {
      setTimeout(waitForGoogleSDK, 100);
    }
  };
  waitForGoogleSDK();
});
</script>

<template>
  <div class="login-container">
    <img class="l-c_logo" :src="website_img" alt="" />
    <div class="l-c_content">
      <v-form v-model="form" @submit.prevent="handleSubmitConnection">
        <v-text-field
          v-model="email"
          :readonly="loading"
          :rules="[required, validEmail]"
          class="mb-2"
          label="Adresse mail"
          clearable
        ></v-text-field>

        <v-text-field
          v-model="password"
          :readonly="loading"
          :rules="[required]"
          label="Password"
          placeholder="Mot de passe"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <br>

        <v-btn
          :disabled="!form"
          :loading="loading"
          color="success"
          size="large"
          type="submit"
          variant="elevated"
          block
        >
          Connexion
        </v-btn>

        <br />

        <!-- Rendu conditionnel selon la plateforme -->
        <div v-if="/* platform === 'mobile' */false">
          <!-- Bouton personnalisé pour mobile (Android ou iOS) -->
          <v-btn
            color="info"
            size="large"
            variant="elevated"
            block
            disabled
            @click="handleGoogleCustomLogin"
          >
            Connexion Google (Mobile)
          </v-btn>
        </div>
        <div v-else>
          <!-- Bouton standard pour le web -->
          <div
            class="g_id_signin"
            data-type="standard"
            data-shape="rectangular"
            data-theme="outline"
            data-text="signin_with"
            data-size="large"
            data-logo_alignment="left"
          ></div>
        </div>
      </v-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-self: center;
  margin: 0 auto;
  align-items: center;

  //* logo du site
  & .l-c_logo {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  //* contenu central (formulaire et bouton)
  & .l-c_content {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    padding: 2rem;
  }
}
</style>
