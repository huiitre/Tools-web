<script setup lang="ts">
import {  } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value: unknown) => {
      if (typeof value === 'string') {
        return ['default', 'primary', 'secondary'].includes(value);
      }
      return false;
    }
  },
  text: {
    type: String,
    default: 'Bouton'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => {
      if (typeof value === 'string') {
        return ['small', 'medium', 'large'].includes(value);
      }
      return false;
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};

const sizeClass = `button-${props.size}`;
const typeClass = `button-${props.type}`;
</script>

<template>
  <button
    class="custom-button"
    :class="[sizeClass, typeClass, { 'button-disabled': disabled }]"
    @click="handleClick"
    :disabled="disabled"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.custom-button {
  min-width: 30%;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  border: none;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.button-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.button-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.button-primary {
  background-color: #007bff;
  color: #fff;
}

.button-primary:hover {
  background-color: #0056b3;
}

.button-secondary {
  background-color: #6c757d;
  color: #fff;
}

.button-secondary:hover {
  background-color: #4e555b;
}

.button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: gray;
}
</style>