<script setup lang="ts">
import { getTheme, toggleTheme } from '@/ui/theme'
import { ref, onMounted } from 'vue'

const year = new Date().getFullYear()
const theme = ref<'dark' | 'light'>('dark')

onMounted(() => {
  theme.value = getTheme()
})

const onToggleTheme = () => {
  theme.value = toggleTheme()
}
</script>

<template>
  <footer class="app-footer">
    <nav class="footer-nav">
      <!-- GAUCHE -->
      <div class="footer-left">
        <small>© {{ year }} Tools</small>
      </div>

      <!-- CENTRE -->
      <ul class="footer-links">
        <li><a href="/privacy-policy">Confidentialité</a></li>
        <li><a href="/terms-of-service">Conditions</a></li>
      </ul>

      <!-- DROITE : SWITCH PICO -->
      <div class="footer-theme">
        <label class="theme-switch">
          <input
            type="checkbox"
            role="switch"
            :checked="theme === 'dark'"
            @change="onToggleTheme"
          />
          <span class="icon" aria-hidden="true">
            {{ theme === 'dark' ? '🌙' : '☀️' }}
          </span>
        </label>
      </div>
    </nav>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  padding: 1rem;
  margin-top: auto;
  border-top: 1px solid var(--pico-muted-border-color);
}

/* Mobile first */
.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 1rem;
  padding: 0;
}

.footer-links li {
  list-style: none;
}

/* Switch discret */
.theme-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.theme-switch .icon {
  line-height: 1;
  user-select: none;
}

/* Desktop */
@media (min-width: 640px) {
  .footer-nav {
    flex-direction: row;
    justify-content: space-between;
  }

  .footer-links {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
