<script setup lang="ts">
import website_img from '@/assets/img/Core/website_img.jpg';
import { ref } from 'vue';
import { reactive } from 'vue';

// components
import CustomSwitch from '@/components/form/CustomSwitch.vue'
import ConnexionForm from '@/modules/Login/ConnexionForm.vue'
import InscriptionForm from '@/modules/Login/InscriptionForm.vue'

//* mode connexion ou inscription
const formMode = ref('Connexion');
//* méthode de modification
const changeFormMode = (value: boolean) => {
  if (value) formMode.value = 'Inscription'
  else formMode.value = 'Connexion'
}

//* data formulaire de connexion
const connexionData = reactive({
  formValid: false,
  loading: false,
  email: '',
  password: '',
});

// méthode submit de connexion
const handleSubmitConnection = () => {
  console.log("%c Login.vue #36 || handleConnexion", 'background:blue;color:#fff;font-weight:bold;');
}

//* data formulaire d'inscription
/* const inscriptionData = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
}); */
</script>

<template>
  <div class="login-container">
    <img class="l-c_logo" :src="website_img" alt="" />
    <div class="l-c_content">
      <div class="l-c_c_mode">
        <CustomSwitch
          @switch-value="changeFormMode"
          size="small"
        />
        <h2>{{ formMode.toUpperCase() }}</h2>
      </div>
      <div class="l-c_c_connexion" v-if="formMode === 'Connexion'">
        <ConnexionForm
          :email="connexionData.email"
          :password="connexionData.password"
          @event-submit="handleSubmitConnection"
        />
      </div>
      <div class="l-c_c_inscription" v-if="formMode === 'Inscription'">
        <InscriptionForm

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

/* .login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  // background-color: #f2f2f2;
  // border: 1px solid #ddd;
  border-radius: 4px;
}

h1 {
  text-align: center;
}

input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007cba;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #005b82;
} */
</style>
