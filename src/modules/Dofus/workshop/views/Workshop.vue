<script setup lang="ts">
</script>

<template>
  <main id="dofus-atelier">
    <section class="card">
      <h1>🛠️ Atelier en cours de craft</h1>

      <figure>
        <img
          src="https://media1.tenor.com/m/jpNf0TBeStkAAAAd/%D0%BC%D0%B8%D0%BB%D0%B0.gif"
          alt="Travail intensif en cours"
        />
      </figure>

      <p class="muted">
        Pendant que tu traînes encore sur Dofusbook,
        <br /><br />
        ici ça forge la suite.
      </p>
    </section>
  </main>
</template>

<style lang="scss" scoped>
#dofus-atelier {
  margin-top: 2rem;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--pico-background-color);
  color: var(--pico-color);
}

.card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  box-shadow: var(--pico-card-box-shadow);
  border-radius: var(--pico-border-radius);
  padding: 2rem;
  max-width: 520px;
  text-align: center;
}

h1 {
  margin-bottom: 1rem;
  color: var(--pico-contrast);
}

.lead {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

figure {
  margin: 1.5rem 0;
}

img {
  max-width: 100%;
  border-radius: var(--pico-border-radius);
  border: 1px solid var(--pico-muted-border-color);
}

figcaption {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.muted {
  margin-top: 1.25rem;
  color: var(--pico-muted-color);
  font-size: 0.95rem;
}
</style>
