<script setup lang="ts">
// Vue

// Components
import CustomInput from '@/components/form/CustomInput.vue'
import CustomButton from '@/components/form/CustomButton.vue'


</script>

<template>
  <div class="inscription-form">
    <CustomInput
      id="inscription-email"
      name="email"
      type="text"
      label="Adresse email"
      placeholder=""
      modelValue=""
      @update:modelValue=""
      isErrorMessage=""
    />
    <CustomInput
      id="inscription-email"
      name="email"
      type="text"
      label="Adresse email"
      placeholder=""
      modelValue=""
      @update:modelValue=""
      isErrorMessage=""
    />
    <CustomInput
      id="inscription-password"
      name="password"
      type="password"
      label="Mot de passe"
      placeholder=""
      modelValue=""
      @update:modelValue=""
      isErrorMessage=""
    />
    <div class="c-f_buttons">
      <CustomButton
        text="inscription"
        size="small"
        type="primary"
        @click=""
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
