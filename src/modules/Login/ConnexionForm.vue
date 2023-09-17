<script setup lang="ts">
// Vue
import { reactive } from 'vue';

// Components
import CustomInput from '@/components/form/CustomInput.vue'
import CustomButton from '@/components/form/CustomButton.vue'

// Types
import { ConnexionData } from '@/modules/Login/Types'

const emit = defineEmits()

//* data de connexion
const connexion = reactive({
  email: {
    value: '',
  },
  password: {
    value: '',
    showPassword: false
  },
  authorizeConnexion : false
})

//* indicateurpour dire si on affiche le bouton pour voir le mot de passe ou non
// const showPasswordIcon = ref(false)

//* update des data
const updateFields = (ev: { field: keyof ConnexionData; value: string }) => {
  //* on insère la nouvelle valeur
  connexion[ev.field].value = ev.value

  //* champ email
  if (ev.field === 'email' && connexion[ev.field].value === '') {
    connexion.authorizeConnexion = false
  }
  else {
    connexion.authorizeConnexion = true
  }

  //* vérification du champ mot de passe
  if (ev.field === 'password') {
    //* le champ MDP est vide
    if (connexion[ev.field].value === '') {
      connexion[ev.field].showPassword = false
      connexion.authorizeConnexion = false
    }
    else {
      connexion[ev.field].showPassword = true
      connexion.authorizeConnexion = true
    }
  }
}

//* Bouton de connexion
const handleSubmit = () => {
  if (connexion.email.value !== '' && connexion.password.value !== '')
    emit('event-submit', { email: connexion.email.value, password: connexion.password.value })
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
    />
    <div class="c-f_buttons">

      <CustomButton
        text="Connexion"
        size="small"
        type="primary"
        @click="handleSubmit"
        :disabled="!connexion.authorizeConnexion"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>