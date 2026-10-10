<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-brand-wash">
      <AppNavbar />
      <main class="w-full grow mt-20">
        <slot />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>