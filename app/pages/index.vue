<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full text-center space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 line-clamp-2">Dashboard</h1>
      <p class="text-gray-600 line-clamp-3">Welcome to your coupon dashboard!</p>
    </div>
  </div>
</template>