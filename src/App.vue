<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.5;
  color: #333;
  background-color: #ffffff;
  overflow-x: hidden;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Asegurar que el html también tenga fondo blanco */
html {
  background-color: #ffffff;
}
</style>
