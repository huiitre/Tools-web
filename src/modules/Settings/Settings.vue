<script setup lang="ts">
import { ref } from 'vue'
import SettingsNav, { SettingsSection } from './SettingsNav.vue'
import AccountProfileSection from './sections/AccountProfileSection.vue';
import AccountSecuritySection from './sections/AccountSecuritySection.vue';
import AutofocusMappingSection from './sections/AutofocusMappingSection.vue';

import { useAuthStore } from '@/modules/Auth/auth.store'
const auth = useAuthStore()

const currentSection = ref<SettingsSection>('account-profile')
</script>

<template>
  <div class="settings-layout">
    <SettingsNav
      :current-section="currentSection"
      @select="currentSection = $event"
    />

    <main class="settings-content">
      <AccountProfileSection
        v-if="currentSection === 'account-profile'"
        :display-name="auth.user?.name"
        :email="auth.user?.email"
        :avatar-url="auth.user?.avatarUrl"
      />

      <AccountSecuritySection
        v-if="currentSection === 'account-security'"
      />

      <section v-if="currentSection === 'account-providers'">
        <h2>Comptes liés</h2>
        <p>Google, GitHub, Discord</p>
      </section>

      <section v-if="currentSection === 'prefs-general'">
        <h2>Préférences générales</h2>
        <p>Langue, options globales</p>
      </section>

      <section v-if="currentSection === 'prefs-appearance'">
        <h2>Apparence</h2>
        <p>Thème, affichage</p>
      </section>

      <section v-if="currentSection === 'prefs-notifications'">
        <h2>Notifications</h2>
        <p>Emails, alertes</p>
      </section>

      <section v-if="currentSection === 'module-dofus'">
        <AutofocusMappingSection />
      </section>

      <section v-if="currentSection === 'module-todolist'">
        <h2>Todolist</h2>
        <p>Paramètres spécifiques Todolist</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.settings-layout {
  display: flex;
  min-height: 100vh;
}

.settings-content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
  }
}
</style>
