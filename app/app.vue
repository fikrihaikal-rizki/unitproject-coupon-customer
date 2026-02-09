<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <Toaster position="top-center" :expand="true" richColors />
  <NuxtPage />
</template>
