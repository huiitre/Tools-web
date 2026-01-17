<!-- settings/AccountSecuritySection.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import PasswordInput from '@/modules/Auth/components/PasswordInput.vue'
import {
  validatePassword,
  PasswordValidationError
} from '@/utils/passwordValidation'

const newPassword = ref('')
const confirmPassword = ref('')

const feedback = ref<{
  type: 'success' | 'error'
  message: string
} | null>(null)

const onUpdatePassword = () => {
  feedback.value = null

  try {
    validatePassword(newPassword.value, confirmPassword.value)

    feedback.value = {
      type: 'success',
      message: 'Mot de passe mis à jour (simulation).'
    }

    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    if (e instanceof PasswordValidationError) {
      feedback.value = { type: 'error', message: e.message }
    } else {
      feedback.value = { type: 'error', message: 'Erreur inattendue.' }
    }
  }
}
</script>

<template>
  <section>
    <header>
      <h2>Sécurité</h2>
      <p>Mot de passe, email et sécurité du compte.</p>
    </header>

    <div class="accordion-grid">
      <!-- MOT DE PASSE -->
      <details open class="accordion">
        <summary>Changer le mot de passe</summary>

        <form @submit.prevent="onUpdatePassword">
          <div class="field">
            <label>
              Nouveau mot de passe
              <PasswordInput
                v-model="newPassword"
                autocomplete="new-password"
                placeholder="Nouveau mot de passe"
              />
            </label>
          </div>

          <div class="field">
            <label>
              Confirmer le mot de passe
              <PasswordInput
                v-model="confirmPassword"
                autocomplete="new-password"
                placeholder="Confirmation"
              />
            </label>
          </div>

          <small>
            Minimum 8 caractères, avec au moins une lettre et un chiffre.
          </small>

          <div class="actions">
            <button type="submit">Mettre à jour</button>
          </div>

          <p v-if="feedback" class="feedback">
            <mark v-if="feedback.type === 'success'">
              {{ feedback.message }}
            </mark>
            <mark v-else class="error">
              {{ feedback.message }}
            </mark>
          </p>
        </form>
      </details>

      <!-- EMAIL -->
      <details class="accordion">
        <summary>Email</summary>
        <p>
          Modification d’email, vérification et gestion des emails non confirmés.
        </p>
        <button class="secondary" disabled>
          Modifier l’email (plus tard)
        </button>
      </details>

      <!-- SESSIONS -->
      <details class="accordion">
        <summary>Sessions & appareils</summary>
        <p>
          Liste des sessions actives, révocation, déconnexion globale.
        </p>
        <button class="secondary" disabled>
          Gérer les sessions (plus tard)
        </button>
      </details>

      <!-- AUTH RENFORCÉE -->
      <details class="accordion">
        <summary>Authentification renforcée</summary>
        <p>
          2FA (TOTP), passkeys, codes de récupération.
        </p>
        <button class="secondary" disabled>
          Configurer (plus tard)
        </button>
      </details>
    </div>
  </section>
</template>

<style scoped>
/* ===== Accordéons ===== */

.accordion {
  background: rgba(0, 0, 0, 0.015);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.accordion + .accordion {
  margin-top: 0.75rem;
}

summary {
  font-size: 0.95rem; /* + que texte, - que h3 */
  font-weight: 600;
  cursor: pointer;
}

/* ===== Layout ===== */

.accordion-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* Desktop : 2 colonnes */
@media (min-width: 1024px) {
  .accordion-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* ===== Form ===== */

.field {
  max-width: 360px; /* inputs pas full width */
}

.field + .field {
  margin-top: 0.75rem;
}

.actions {
  margin-top: 1rem;
}

.actions button {
  width: auto;
}

/* ===== Feedback ===== */

.feedback {
  margin-top: 0.75rem;
}

.feedback .error {
  background: #ffe3e3;
}
</style>
