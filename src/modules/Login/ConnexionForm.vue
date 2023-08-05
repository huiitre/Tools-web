<script setup lang="ts">
// Vue
import { onMounted, reactive } from 'vue';

// Components
import CustomInput from '@/components/form/CustomInput.vue'
import CustomButton from '@/components/form/CustomButton.vue'

// Types
import { ConnexionData } from '@/modules/Login/Types'

//* data de connexion
const connexion = reactive({
  email: {
    value: '',
    isError: false,
    isErrorMessage: ''
  },
  password: {
    value: '',
    isError: false,
    isErrorMessage: '',
    showPassword: false
  }
})

//* indicateurpour dire si on affiche le bouton pour voir le mot de passe ou non
// const showPasswordIcon = ref(false)

//* update des data
const updateFields = (ev: { field: keyof ConnexionData; value: string }) => {
  //* on insère la nouvelle valeur
  connexion[ev.field].value = ev.value

  //todo tout ce qui est en commentaire sera à utiliser pour le formulaire d'inscription

  //* si le champ email ne correspond pas à un email valide
  /* const patternEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (ev.field === 'email' && !connexion[ev.field].value.match(patternEmail)) {
    connexion.email.isError = true
    connexion.email.isErrorMessage = 'L\'adresse email n\'est pas valide'
  }
  else {
    connexion.email.isError = false
    connexion.email.isErrorMessage = ''
  } */

  //* vérification du champ mot de passe
  if (ev.field === 'password') {
    //* le champ MDP est vide
    if (connexion[ev.field].value === '')
      connexion[ev.field].showPassword = false
    else
      connexion[ev.field].showPassword = true
    
    //* vérification du mot de passe
    /* const patternPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!connexion[ev.field].value.match(patternPassword)) {
      connexion.password.isError = true
      connexion.password.isErrorMessage = 'Le mot de passe doit être d\'au moins 8 caractères et contenir au moins 1 chiffre et 1 lettre'
    }
    else {
      connexion.password.isError = false
      connexion.password.isErrorMessage = ''
    } */
  }
}

//* Bouton de connexion
const handleSubmit = () => {
  console.log("%c ConnexionForm.vue #27 || handleSubmit", 'background:blue;color:#fff;font-weight:bold;');
}

</script>

<template>
  <div class="connexion-form">
    <CustomInput
      id="connexion-email"
      name="email"
      type="text"
      label="Adresse email"
      placeholder=""
      :modelValue="connexion.email.value"
      @update:modelValue="updateFields"
      :isError="connexion.email.isError"
      :isErrorMessage="connexion.email.isErrorMessage"
    />
    <CustomInput
      id="connexion-password"
      name="password"
      type="password"
      label="Mot de passe"
      placeholder=""
      :modelValue="connexion.password.value"
      @update:modelValue="updateFields"
      :allowShowPasswordIcon="connexion.password.showPassword"
      :isError="connexion.password.isError"
      :isErrorMessage="connexion.password.isErrorMessage"
    />
    <div class="c-f_buttons">

      <CustomButton
        text="Connexion"
        size="small"
        type="primary"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>