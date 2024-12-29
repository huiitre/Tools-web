<script setup lang="ts">
import website_img from '@/assets/img/Core/website_img.jpg';
import { computed, ref, onMounted } from 'vue';
// components
import store from '@/store/store';
import toast from '@/services/toast';
import router from '@/router/router';

const isLoading = computed(() => store.getters['Core/isLoading'])

//* mode connexion ou inscription
const formMode = ref(false);
const toggleFormMode = computed(() => {
  return formMode.value ? 'Inscription' : 'Connexion'
})
//* méthode de modification
/* const changeFormMode = (value: boolean) => {
  if (value) formMode.value = 'Inscription'
  else formMode.value = 'Connexion'
} */

// les refs
const form = ref(false)
const email = ref(null)
const password = ref(null)
const showPassword = ref(false)
const loading = ref(false)

const required = (v: string) => {
  return !!v || 'Le champ est obligatoire !'
}
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
    const { data } = await store.dispatch('Core/getUserModules')
    store.commit('Core/setUserModules', data)

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

// Connexion via Google
const handleGoogleLogin = async (response: any) => {
  const googleJwt = response?.credential;

  if (!googleJwt) {
    console.error('JWT Google manquant dans la réponse');
    return;
  }

  await handleLogin('Core/loginWithGoogle', { googleJwt });
};

onMounted(() => {
  const google = window.google
  if (typeof google === 'object' && google.accounts && google.accounts.id) {
    // Initialise Google Identity
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin
    });


    // Forcer le rendu du bouton
    const buttonContainer = document.querySelector('.g_id_signin');
    if (buttonContainer) {
      google.accounts.id.renderButton(
        buttonContainer,
        {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          logo_alignment: 'left',
        }
      );
    } else {
      console.error("Conteneur pour le bouton Google introuvable");
    }
  } else {
      console.error("Google SDK non chargé ou mal initialisé");
  }
})

</script>

<template>
  <div class="login-container">
    <img class="l-c_logo" :src="website_img" alt="" />
    <div class="l-c_content">
      <v-form
        v-model="form"
        @submit.prevent="handleSubmitConnection"
      >
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

        <div
          id="g_id_onload"
          data-client_id="404978765682-hpevl43le3qtcfcjl8uujn8ni2f6egun.apps.googleusercontent.com"
          data-login_uri="http://localhost:5173"
          data-callback="handleGoogleLogin"
        ></div>
        <div
          class="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
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
    // background-color: var(--login-form-background-color);
    border: 1px solid #ddd;
    padding: 2rem;
    // width: 400px;
  }
}
</style>