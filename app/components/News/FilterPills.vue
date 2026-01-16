<template>
  <div class="mb-8">
    <p v-if="label" class="mb-4">{{ label }}</p>
    <div class="flex flex-wrap gap-2">
      <button v-for="option in options" :key="option" :class="[
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        modelValue.includes(option)
          ? `${getTypeColor(option)} border ${getTypeBorder(option)} ring-2`
          : `bg-white border ${getTypeBorder(option)} ${getTypeText(option)}`
      ]" @click="toggleOption(option)">
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  options: string[]
  modelValue: string[]
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Selecciona las opciones que deseas ver:'
})

const emit = defineEmits<Emits>()

const { getTypeColor, getTypeBorder, getTypeText } = useNewsTypeColor()

const toggleOption = (option: string) => {
  const current = [...props.modelValue]
  const index = current.indexOf(option)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(option)
  }

  emit('update:modelValue', current)
}
</script>