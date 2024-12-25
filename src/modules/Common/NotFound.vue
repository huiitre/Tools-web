<template>
  <div class="not-found">
    <h1 class="title">404 - Oops! Vous êtes perdu dans le multivers 🌌</h1>
    <p class="subtitle">
      Cette page est introuvable, mais ne vous inquiétez pas, on vous ramène chez vous !
    </p>

    <div class="animation">
      <img src="https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif" alt="Lost Astronaut" />
    </div>

    <router-link to="/" class="home-link">
      🏠 Retour à l'accueil
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.not-found {
  text-align: center;
  margin: 0 auto;
  padding: 50px;
  font-family: 'Arial', sans-serif;
  color: #444;
}

.title {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #ff6347;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 40px;
  color: #555;
}

.animation img {
  width: 300px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.home-link {
  display: inline-block;
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #ff6347;
  color: #fff;
  text-decoration: none;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.home-link:hover {
  background-color: #e5533d;
  transform: scale(1.05);
}
</style>
