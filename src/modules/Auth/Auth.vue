<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

import websiteImg from '@/assets/img/Core/website_img.jpg'
import PasswordInput from './components/PasswordInput.vue'

import { validatePassword, PasswordValidationError } from '@/utils/passwordValidation'
import { useFetchLogin } from './hooks/useFetchLogin'
import { useFetchMe } from './hooks/useFetchMe'
import toast from '@/services/toast'
import { useFetchLoginWithGoogle } from './hooks/useFetchLoginWithGoogle'

const auth = useAuthStore()
const router = useRouter()

const isRegister = ref(false)

/* Connexion */
const loginEmail = ref('')
const loginPassword = ref('')

/* Inscription */
const registerEmail = ref('')
const registerUsername = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')

// Google OAuth
const googleBtnRef = ref<HTMLElement | null>(null)
const renderGoogleButton = async () => {
  while (!window.google?.accounts?.id) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  if (!googleBtnRef.value) return

  googleBtnRef.value.innerHTML = ''

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response: any) => {
      try {
        const idToken = response?.credential
        if (!idToken) throw new Error('GOOGLE_ID_TOKEN_MISSING')

        const { data } = await useFetchLoginWithGoogle({ idToken })
        auth.setToken(data.accessToken)

        toast.success('Connexion Google réussie')
        router.push('/')
      } catch (e: any) {
        toast.warning("Connexion Google impossible")
      }
    }
  })

  window.google.accounts.id.renderButton(googleBtnRef.value, {
    theme: 'outline',
    size: 'large',
    shape: 'rectangular'
  })
}
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB

const onLoginSubmit = async () => {
  try {
    validatePassword(loginPassword.value)

    const { data } = await useFetchLogin({
      email: loginEmail.value,
      password: loginPassword.value
    })
    auth.setToken(data.accessToken)

    toast.success('Connexion réussie')
    router.push('/')
  } catch (error: any) {
    
    if (error instanceof PasswordValidationError) {
      toast.warning(error.message)
    }
  }
}
const onRegisterSubmit = () => {
  try {
    validatePassword(registerPassword.value, registerConfirmPassword.value)
  } catch (error) {
    if (error instanceof PasswordValidationError) {
      alert(error.message)
      return
    }
  }
}

onMounted(() => {
  renderGoogleButton()
})

watch(isRegister, async (value) => {
  if (!value) {
    await nextTick()
    renderGoogleButton()
  }
})
</script>

<template>
  <main class="login">
    <img class="login-logo" :src="websiteImg" alt="Logo" />

    <!-- Toggle -->
    <label class="mode-toggle">
      <input type="checkbox" role="switch" v-model="isRegister" />
      <span>{{ isRegister ? 'Inscription' : 'Connexion' }}</span>
    </label>

    <!-- CONNEXION -->
    <form v-if="!isRegister" @submit.prevent="onLoginSubmit">
      <input
        v-model="loginEmail"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="Adresse email"
        required
      />

      <PasswordInput
        v-model="loginPassword"
        name="password"
        autocomplete="current-password"
        placeholder="Mot de passe"
      />

      <button type="submit">Se connecter</button>
    </form>

    <!-- INSCRIPTION -->
    <form v-else @submit.prevent="onRegisterSubmit">
      <input
        v-model="registerUsername"
        type="text"
        name="username"
        autocomplete="username"
        placeholder="Nom d'utilisateur"
        required
      />

      <input
        v-model="registerEmail"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="Adresse email"
        required
      />

      <PasswordInput
        v-model="registerPassword"
        name="new-password"
        autocomplete="new-password"
        placeholder="Mot de passe"
      />

      <PasswordInput
        v-model="registerConfirmPassword"
        name="confirm-password"
        autocomplete="new-password"
        placeholder="Confirmer le mot de passe"
      />

      <button type="submit">Créer un compte</button>
    </form>

    <!-- OAuth -->
    <template v-if="!isRegister">
      <small class="separator">ou</small>
      <div class="google-wrapper">
        <div ref="googleBtnRef"></div>
      </div>
    </template>

    <!-- <template v-if="!isRegister">
      <div class="oauth-wrapper">
        <div ref="googleBtnRef"></div>

        <a
          class="github-btn"
          :href="githubAuthUrl()"
        >
          <i class="fa-brands fa-github github-icon"></i>
          <span>Se connecter avec GitHub</span>
        </a>
      </div>
    </template> -->

  </main>
</template>

<style scoped>
.login {
  width: 100%;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.login-logo {
  width: 140px;
  height: 140px;
  border-radius: 50%;
}

form {
  width: 100%;
  max-width: 360px;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  opacity: 0.6;
}

.google-wrapper {
  display: flex;
  justify-content: center;
}

.oauth-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.github-btn {
  width: 240px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;

  border-radius: 4px;
  background: #24292f;
  color: white;

  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
}

.github-btn:hover {
  background: #1b1f23;
}

.github-icon {
  font-size: 1.2rem;
}
</style>
