import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoveLeft } from 'lucide-react'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import Layout from '@/components/Shared/Layout'
import { Link } from 'react-router-dom'

const roles = [
  {
    id: 'therapist',
    label: 'Therapist',
    sub: 'I provide therapy sessions',
  },
  {
    id: 'patient',
    label: 'Patient',
    sub: 'I am looking for support',
  },
]

const formSchema = z
  .object({
    role: z.enum(['therapist', 'patient'], {
      message: 'Please choose a role',
    }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string().min(6, { message: 'Confirm Password must be at least 6 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const RegisterForm = () => {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'patient',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data) => {
    setSubmitted(true)
    console.info('Demo form submitted', data)
  }

  return (
    <Layout title="Demo form">
      <h1 className="absolute top-10 left-4 sm:top-[35%] sm:left-20 max-w-xs sm:max-w-sm md:max-w-xl font-serif text-2xl sm:text-4xl md:text-6xl text-green-900">
        Demo therapy form
        <p className="mt-3 sm:mt-6 text-xs sm:text-sm md:text-lg leading-relaxed text-green-800">
          This is a static demo for preview and sharing. No backend is required for publishing.
        </p>
      </h1>

      <Button className="absolute top-4 left-4" variant="ghost" size="sm">
        <Link className="flex items-center justify-between gap-2" to="/">
          Home
          <MoveLeft />
        </Link>
      </Button>

      <form
        id="form-rhf-demo"
        onSubmit={form.handleSubmit(onSubmit)}
        className="absolute inset-x-4 bottom-6 sm:bottom-auto sm:top-[50%] sm:left-[70%] w-auto sm:w-full max-w-sm sm:max-w-md -translate-y-0 sm:-translate-y-1/2 sm:-translate-x-1/2 space-y-4 sm:space-y-6 p-4 sm:p-0 bg-white/90 sm:bg-transparent rounded-lg sm:rounded-none"
      >
        {submitted && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Thank you! Your demo form was submitted successfully.
          </div>
        )}

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Role</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {roles.map((role) => {
                  const isSelected = field.value === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => field.onChange(role.id)}
                      className={`rounded-lg sm:rounded-xl border p-2 sm:p-3 text-left transition ${
                        isSelected
                          ? 'border-green-700 bg-green-50'
                          : 'border-black/10 bg-white hover:border-green-600'
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-semibold">{role.label}</span>
                      <span className="mt-1 block text-[10px] sm:text-xs text-black/60">{role.sub}</span>
                    </button>
                  )
                })}
              </div>
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Username</FieldLabel>
              <Input
                className="w-full bg-white"
                {...field}
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your full name"
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                className="w-full bg-white"
                {...field}
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your email"
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Password</FieldLabel>
              <Input
                className="w-full bg-white"
                {...field}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your password"
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                className="w-full bg-white"
                {...field}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Confirm your password"
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Button type="submit">Submit demo</Button>
      </form>
    </Layout>
  )
}

export default RegisterForm