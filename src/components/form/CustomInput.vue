<script setup lang="ts">
import { computed, ref } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
library.add(faEye,faEyeSlash);
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
  allowShowPasswordIcon: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  isErrorMessage: {
    type: String,
    default: 'Erreur'
  }
});

/**
 *! GESTION DE LA VALEUR DE L'INPUT
 */
//* evenement de remonté de la valeur
const emit = defineEmits(['update:modelValue']);
//* remonté de la valeur
const updateValue = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;
  emit('update:modelValue', { field: props.name, value: newValue });
};

/**
 *! GESTION D'UN INPUT DE TYPE PASSWORD
 */
//* affichage du mdp true/false
const showPassword = ref(false)
//* type de l'input
const inputType = computed(() => {
  if (showPassword.value) {
    return 'text';
  } else {
    return props.type;
  }
});
//* icone password button
const iconPassword = computed(() => {
  if (showPassword.value)
    return ['fas', 'eye-slash']
  else
    return ['fas', 'eye']
})
//* changement de la visibilité du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}


</script>

<template>
  <div class="input-container">
    <label :for="id" class="input-label">{{ label }}</label>
    <div class="input-field-wrapper">
      <input
        :id="id"
        :type="inputType"
        :name="props.name"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateValue"
        :class="['input-field', { 'field-password': inputType === 'password' }]"
      />
      <span
        class="toggle-password"
        v-on:click="togglePasswordVisibility"
        v-if="props.type === 'password' && props.allowShowPasswordIcon"
      >
        <font-awesome-icon
          :icon="iconPassword"
        />
      </span>
      <span v-if="props.isError" class="toogle-error">
        {{ props.isErrorMessage }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  margin-bottom: 1rem;
}

.input-field-wrapper {
  position: relative;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
.field-password {
  padding-right: 2rem;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  cursor: pointer;
}

.fa-eye,
.fa-eye-slash {
  font-size: 1rem;
}
</style>
