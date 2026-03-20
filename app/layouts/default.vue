<template>
  <UApp>
    <div class="flex flex-col min-h-screen min-w-screen bg-abstract-gradient text-gray-500 antialiased ">
      <AppNavbar />
      <main class="w-full grow mt-20">
        <slot />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>