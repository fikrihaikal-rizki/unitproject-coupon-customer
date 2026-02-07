<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

interface InputConfig {
  id: number
  label: string
  description: string
  inputType: string
  options?: any
  placeholder?: string
  isRequired: boolean
}

interface StepInfo {
  id: number
  title: string
  description: string
  stepType: 'claim_seat' | 'questionnaire'
}

interface Props {
  stepInfo: StepInfo
  inputs: InputConfig[]
  initialValues?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits(['next'])

// Dynamic schema generation
const createSchema = () => {
  const shape: Record<string, zod.ZodTypeAny> = {}
  props.inputs.forEach((input) => {
    let fieldSchema: zod.ZodTypeAny = zod.any()
    
    // Everything is required if it's a claim_seat step or if isRequired is true
    const isRequired = props.stepInfo.stepType === 'claim_seat' || input.isRequired

    if (isRequired) {
      if (input.inputType === 'multiple_select') {
        fieldSchema = zod.array(zod.string()).min(1, `${input.label} is required`)
      } else {
        fieldSchema = zod.string().min(1, `${input.label} is required`)
      }
    } else {
      fieldSchema = zod.any().optional()
    }
    
    shape[`input_${input.id}`] = fieldSchema
  })
  return toTypedSchema(zod.object(shape))
}

// Prepare initial values with defaults
const initialValues = computed(() => {
  const defaults: Record<string, any> = {}
  props.inputs.forEach((input) => {
    const key = `input_${input.id}`
    // Use provided initial value, or default to empty array for multiple_select, or empty string for others
    if (props.initialValues && props.initialValues[key] !== undefined) {
      defaults[key] = props.initialValues[key]
    } else {
      defaults[key] = input.inputType === 'multiple_select' ? [] : ''
    }
  })
  return defaults
})

const form = useForm<Record<string, any>>({
  validationSchema: createSchema(),
  initialValues: initialValues.value,
})

const { handleSubmit, errors, isSubmitting, values, setFieldValue } = form

const onSubmit = handleSubmit((values) => {
  emit('next', values)
})

// Helper to get options from JSONB
const getOptions = (options: any) => {
  if (typeof options === 'string') {
    try {
      return JSON.parse(options)
    } catch {
      return []
    }
  }
  return Array.isArray(options) ? options : []
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-2">
      <slot name="title">
        <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ stepInfo.title }}</h2>
      </slot>
      <p v-if="stepInfo.description" class="text-sm text-zinc-500 line-clamp-2">
        {{ stepInfo.description }}
      </p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <div v-for="input in inputs" :key="input.id" class="space-y-2">
        <Label>{{ input.label }} <span v-if="stepInfo.stepType === 'claim_seat' || input.isRequired" class="text-red-500">*</span></Label>
        
        <p v-if="input.description" class="text-xs text-zinc-400 mb-1">{{ input.description }}</p>

        <!-- Text / Email / Phone / Number -->
        <Input
          v-if="['text', 'email', 'phone', 'number', 'select'].includes(input.inputType) && input.inputType !== 'select'"
          :type="input.inputType === 'phone' ? 'tel' : input.inputType"
          :model-value="(values as any)[`input_${input.id}`]"
          @update:model-value="(val) => setFieldValue(`input_${input.id}`, val)"
          :placeholder="input.placeholder"
          :class="{ 'border-red-500': errors[`input_${input.id}`] }"
        />

        <!-- Select -->
        <Select
          v-else-if="input.inputType === 'select'"
          :model-value="(values as any)[`input_${input.id}`]"
          @update:model-value="(val) => setFieldValue(`input_${input.id}`, val)"
        >
          <SelectTrigger :class="{ 'border-red-500': errors[`input_${input.id}`] }">
            <SelectValue :placeholder="input.placeholder || 'Select an option'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in getOptions(input.options)" :key="opt.value || opt" :value="opt.value || opt">
              {{ opt.label || opt }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- File -->
        <div v-else-if="input.inputType === 'file'" class="flex items-center gap-4">
          <Input
            type="file"
            @change="(e: any) => setFieldValue(`input_${input.id}`, e.target.files[0])"
            :class="{ 'border-red-500': (errors as any)[`input_${input.id}`] }"
          />
        </div>

        <p v-if="(errors as any)[`input_${input.id}`]" class="text-xs text-red-500 mt-1">
          {{ (errors as any)[`input_${input.id}`] }}
        </p>
      </div>

      <div class="pt-4">
        <slot name="action">
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            Next
          </Button>
        </slot>
      </div>
    </form>
  </div>
</template>
