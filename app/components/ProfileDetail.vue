<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

interface Props {
  initialData: {
    fullName?: string | null
    email: string
    phoneNumber?: string | null
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['next'])

const schema = toTypedSchema(
  zod.object({
    fullName: zod.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: zod.string().min(8, 'Enter a valid phone number'),
  })
)

const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    fullName: props.initialData.fullName || '',
    phoneNumber: props.initialData.phoneNumber || '',
  },
})

const [fullName, fullNameProps] = defineField('fullName')
const [phoneNumber, phoneNumberProps] = defineField('phoneNumber')

const onSubmit = handleSubmit(async (values) => {
  try {
    const { error } = await useFetch('/api/customers/update', {
      method: 'PATCH',
      body: values,
    })

    if (error.value) {
      throw new Error(error.value.statusMessage || 'Update failed')
    }

    emit('next', values)
  } catch (err: any) {
    console.error(err)
    alert(err.message || 'An error occurred')
  }
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-2">
      <slot name="title">
        <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Complete Your Profile</h2>
      </slot>
      <p class="text-sm text-zinc-500">We need a few details to get you started.</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          :value="props.initialData.email"
          readonly
          class="bg-zinc-50 dark:bg-zinc-800/50"
        />
        <p class="text-[10px] text-zinc-400">Email cannot be changed.</p>
      </div>

      <div class="space-y-2">
        <Label for="fullName">Full Name</Label>
        <Input
          id="fullName"
          v-model="fullName"
          v-bind="fullNameProps"
          placeholder="e.g. John Doe"
          :class="{ 'border-red-500': errors.fullName }"
        />
        <p v-if="errors.fullName" class="text-xs text-red-500">{{ errors.fullName }}</p>
      </div>

      <div class="space-y-2">
        <Label for="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          v-model="phoneNumber"
          v-bind="phoneNumberProps"
          placeholder="e.g. +62812345678"
          :class="{ 'border-red-500': errors.phoneNumber }"
        />
        <p v-if="errors.phoneNumber" class="text-xs text-red-500">{{ errors.phoneNumber }}</p>
      </div>

      <div class="pt-4">
        <slot name="action">
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Next</span>
          </Button>
        </slot>
      </div>
    </form>
  </div>
</template>
