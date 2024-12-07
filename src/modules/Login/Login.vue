<script setup lang="ts">
import website_img from '@/assets/img/Core/website_img.jpg';
import { computed, ref } from 'vue';
// components
import ConnexionForm from '@/modules/Login/ConnexionForm.vue'
import InscriptionForm from '@/modules/Login/InscriptionForm.vue'
import LvToggleSwitch from 'lightvue/toggle-switch';
import store from '@/store/store';
import toast from '@/services/toast';

import { GoogleLogin } from 'vue3-google-login';
const { signIn } = GoogleLogin;

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

// méthode submit de connexion
const handleSubmitConnection = async(data: { email: string, password: string }) => {
  toast.clearAll()
  toast.loading('Connexion en cours ...')
  try {
    const result = await store.dispatch('Core/login', data)
    if (result) formMode.value = false
    toast.success(result.msg)
  } catch(err: any) {
    toast.error(err.msg)
  } finally {
    toast.clearAll()
  }
  
}

const handleSubmitSubscribe = async(data: { email: string; password: string; confirm_password: string; name: string }) => {
  toast.clearAll()
  toast.loading('Inscription en cours ...')
  try {
    const result = await store.dispatch('Core/register', data)
    if (result) formMode.value = false
    toast.success(result.msg)
  } catch(err: any) {
    toast.error(err.msg)
  } finally {
    toast.clearAll()
  }
}

const handleLoginGoogle = async() => {
  console.log("%c Login.vue #53 || handleLoginGoogle", 'background:blue;color:#fff;font-weight:bold;');
  try {
    const response = await signIn();
    console.log('Google Login Response:', response);
    // Envoyez `response.credential` (token JWT) à votre API Laravel pour validation
  } catch (error) {
    console.error('Erreur lors de la connexion Google:', error);
  }
}

</script>

<template>
  <div class="login-container">
    <img class="l-c_logo" :src="website_img" alt="" />
    <div class="l-c_content">
      <div class="l-c_c_mode">
        <!-- <CustomSwitch
          @switch-value="changeFormMode"
          size="small"
        /> -->
        <LvToggleSwitch v-model="formMode" />
        <h2>{{ toggleFormMode.toUpperCase() }}</h2>
      </div>
      <div class="l-c_c_connexion" v-if="!formMode">
        <ConnexionForm
          @event-submit="handleSubmitConnection"
        />
      </div>
      <!-- Ajouter le bouton Google -->
      <button @click="handleLoginGoogle">Se connecter avec Google</button>
      <!-- Inscription -->
      <div class="l-c_c_inscription" v-if="formMode">
        <InscriptionForm
          @event-subscribe="handleSubmitSubscribe"
        />
      </div>
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
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  //* contenu central (formulaire et bouton)
  & .l-c_content {
    display: flex;
    flex-direction: column;
    background-color: var(--login-form-background-color);
    border: 1px solid #ddd;
    padding: 2rem;
    width: 300px;

    //* bouton switch entre connexion et inscription
    & .l-c_c_mode {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      //* Titre du mode (connexion ou inscription)
      & h2 {
        font-weight: bold;
        font-size: 1.3rem;
      }
    }
  }
}
</style>
