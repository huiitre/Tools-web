<script setup lang="ts">
// Vue

// Components
import CustomInput from '@/components/form/CustomInput.vue'
import CustomButton from '@/components/form/CustomButton.vue'
import { reactive } from 'vue';

import { SubscriptionData } from '@/modules/Login/Types'

const emit = defineEmits()

const subscription = reactive({
  email: {
    value: '',
    isError: false
  },
  name: {
    value: '',
    isError: false
  },
  password: {
    value: '',
    showPassword: false,
    isError: false
  },
  confirmPassword: {
    value: '',
    showPassword: false,
    isError: false
  },
  authorizeSubscription: false
})

const updateFields = (ev: { field: keyof SubscriptionData; value: string }) => {
  subscription[ev.field].value = ev.value

  if (ev.field === 'password' || ev.field === 'confirmPassword') {
    if (subscription[ev.field].value === '')
      subscription[ev.field].showPassword = false
    else
      subscription[ev.field].showPassword = true
  }
}

const handleSubscribe = () => {
  const { email, name, password, confirmPassword } = subscription
  
  //* EMAIL
  const patternEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.value === '' || !email.value.match(patternEmail)) {
    subscription.email.isError = true
    subscription.authorizeSubscription = false
  }
  else {
    subscription.email.isError = false
    subscription.authorizeSubscription = true
  }

  //* NOM D'UTILISATEUR
  if (name.value === '' || (name.value.length < 4 && name.value.length > 16)) {
    subscription.name.isError = true
    subscription.authorizeSubscription = false
  }
  else {
    subscription.name.isError = false
    subscription.authorizeSubscription = true
  }

  //* MOT DE PASSE
  const patternPassword = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
  if (password.value === '' || !password.value.match(patternPassword)) {
    subscription.password.isError = true
    subscription.authorizeSubscription = false
  }
  else {
    subscription.password.isError = false
    subscription.authorizeSubscription = true
  }

  //* CONFIRMATION DU MOT DE PASSE
  if (confirmPassword.value === '' || !confirmPassword.value.match(patternPassword)) {
    subscription.confirmPassword.isError = true
    subscription.authorizeSubscription = false
  }
  else {
    subscription.confirmPassword.isError = false
    subscription.authorizeSubscription = true
  }

  //* MOTS DE PASSE IDENTIQUES
  if ((password.value !== '' && confirmPassword.value !== '') && (password.value !== confirmPassword.value)) {
    subscription.password.isError = true
    subscription.confirmPassword.isError = true
    subscription.authorizeSubscription = false
  }

  if (subscription.authorizeSubscription) {
    emit('event-subscribe', { email: email.value, password: password.value, confirm_password: confirmPassword.value, name: name.value })
  }
}

</script>

<template>
  <div class="inscription-form">
    <CustomInput
      id="inscription-email"
      name="email"
      type="text"
      label="Adresse email"
      placeholder=""
      :modelValue="subscription.email.value"
      @update:modelValue="updateFields"
      :isError="subscription.email.isError"
    />
    <CustomInput
      id="inscription-name"
      name="name"
      type="text"
      label="Nom"
      placeholder=""
      :modelValue="subscription.name.value"
      @update:modelValue="updateFields"
      :isError="subscription.name.isError"
    />
    <CustomInput
      id="inscription-password"
      name="password"
      type="password"
      label="Mot de passe"
      placeholder=""
      :modelValue="subscription.password.value"
      @update:modelValue="updateFields"
      :allowShowPasswordIcon="subscription.password.showPassword"
      :isError="subscription.password.isError"
    />
    <CustomInput
      id="inscription-confirm-password"
      name="confirmPassword"
      type="password"
      label="Confirmation du mot de passe"
      placeholder=""
      :modelValue="subscription.confirmPassword.value"
      @update:modelValue="updateFields"
      :allowShowPasswordIcon="subscription.confirmPassword.showPassword"
      :isError="subscription.confirmPassword.isError"
    />
    <div class="c-f_buttons">
      <CustomButton
        text="inscription"
        size="small"
        type="primary"
        @click="handleSubscribe"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
