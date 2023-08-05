<script setup lang="ts">
import { ref, watch } from 'vue';
//* paramètres du switch
const props = defineProps({
  size: {
    type: String,
    default: '',
    validator: (value: string) => {
      if (value === '') return true
      return ['small'].includes(value)
    }
  }
});

//* valeur du switch true/false
const value = ref(false)

//* evenement qui remonte la valeur du switch au composant parent
const emit = defineEmits(['switch-value'])

//* écouteur sur le switch afin de faire remonter la valeur
watch(value, () => {
  emit('switch-value', value.value)
})
</script>

<template>
  <label :class="['switch', { 'small': props.size === 'small' }]">
    <input type="checkbox" v-model="value" />
    <span class="slider round"></span>
  </label>
</template>

<style lang="scss" scoped>
/* The switch - the box around the slider */
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Small switch */
.switch.small {
  width: 46px;
  height: 20px;
}

.switch.small .slider {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.switch.small .slider:before {
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
}
</style>
