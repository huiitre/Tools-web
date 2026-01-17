<script setup lang="ts">
export type SettingsSection =
  | 'account-profile'
  | 'account-security'
  | 'account-providers'
  | 'prefs-general'
  | 'prefs-appearance'
  | 'prefs-notifications'
  | 'prefs-config'
  | 'module-dofus'
  | 'module-todolist'

defineProps<{
  currentSection: SettingsSection
}>()

const emit = defineEmits<{
  (e: 'select', section: SettingsSection): void
}>()

const goTo = (section: SettingsSection) => {
  emit('select', section)
}
</script>

<template>
  <!-- MOBILE NAV : ACCORDÉON -->
  <nav class="settings-nav-mobile mobile-only">
    <details>
      <summary>Navigation</summary>

      <div class="nav-group">
        <strong>Compte</strong>
        <ul>
          <li @click="goTo('account-profile')">Profil</li>
          <li @click="goTo('account-security')">Sécurité</li>
          <li @click="goTo('account-providers')">Comptes liés</li>
        </ul>
      </div>

      <div class="nav-group">
        <strong>Préférences</strong>
        <ul>
          <li @click="goTo('prefs-general')">Général</li>
          <li @click="goTo('prefs-appearance')">Apparence</li>
          <li @click="goTo('prefs-notifications')">Notifications</li>
          <li @click="goTo('prefs-config')">Paramètres</li>
        </ul>
      </div>

      <div class="nav-group">
        <strong>Modules</strong>
        <ul>
          <li @click="goTo('module-dofus')">Dofus</li>
          <li @click="goTo('module-todolist')">Todolist</li>
        </ul>
      </div>
    </details>
  </nav>

  <!-- DESKTOP SIDEBAR (INCHANGÉ LOGIQUEMENT) -->
  <aside class="settings-sidebar desktop-only">
    <nav>
      <h4>Compte</h4>
      <ul>
        <li :class="{ active: currentSection === 'account-profile' }" @click="goTo('account-profile')">Profil</li>
        <li :class="{ active: currentSection === 'account-security' }" @click="goTo('account-security')">Sécurité</li>
        <li :class="{ active: currentSection === 'account-providers' }" @click="goTo('account-providers')">Comptes liés</li>
      </ul>

      <h4>Préférences</h4>
      <ul>
        <li :class="{ active: currentSection === 'prefs-general' }" @click="goTo('prefs-general')">Général</li>
        <li :class="{ active: currentSection === 'prefs-appearance' }" @click="goTo('prefs-appearance')">Apparence</li>
        <li :class="{ active: currentSection === 'prefs-notifications' }" @click="goTo('prefs-notifications')">Notifications</li>
        <li :class="{ active: currentSection === 'prefs-config' }" @click="goTo('prefs-config')">Paramètres</li>
      </ul>

      <h4>Modules</h4>
      <ul>
        <!-- <li :class="{ active: currentSection === 'module-dofus' }" @click="goTo('module-dofus')">Dofus</li>
        <li :class="{ active: currentSection === 'module-todolist' }" @click="goTo('module-todolist')">Todolist</li> -->
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
/* ===== MOBILE ===== */

.settings-nav-mobile {
  margin-top: 1rem;
}

.settings-nav-mobile details {
  border: 1px solid var(--pico-muted-border-color, #ddd);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  background: var(--pico-background-color);
}

.settings-nav-mobile summary {
  font-weight: 600;
  cursor: pointer;
}

.nav-group {
  margin-top: 0.75rem;
}

.nav-group strong {
  display: block;
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.nav-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.nav-group li {
  padding: 0.3rem 0;
  cursor: pointer;
}

/* ===== DESKTOP ===== */

.settings-sidebar {
  width: 260px;
  border-right: 1px solid #ddd;
  padding: 1rem;
}

nav h4 {
  margin-top: 1.25rem;
  font-size: 0.85rem;
  text-transform: uppercase;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav li {
  padding: 0.35rem 0;
  cursor: pointer;
}

nav li.active {
  font-weight: 600;
}

/* ===== RESPONSIVE ===== */

.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}
</style>
