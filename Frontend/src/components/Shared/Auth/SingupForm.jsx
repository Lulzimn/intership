import React from 'react'

import Img from '@/assets/BG.png'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'

export const Signup = () => {
  return (
    <section
         className="relative min-h-screen bg-cover bg-center px-6 py-12"
         style={{ backgroundImage: `url(${Img})` }}
       >
         <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
           <div className="max-w-xl text-white drop-shadow-lg">
             <p className="mb-4 text-sm uppercase tracking-[0.35em] text-white/80">
               Therapy Internship
             </p>
             <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
               Log in or create an account
             </h1>
             <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 md:text-xl">
               Join the platform to access guided support, track your progress, and
               stay connected with your therapy journey.
             </p>
           </div>
   
           <div className="ml-auto w-full max-w-xl rounded-[2rem] bg-white/85 p-6 shadow-2xl backdrop-blur-md md:p-8">
             <form className="space-y-6">
               <FieldGroup>
                 <FieldSet>
                   <FieldLegend>Create account</FieldLegend>
                   <FieldDescription>
                     Fill in your details to get started.
                   </FieldDescription>
   
                   <FieldGroup>
                     <Field>
                       <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                       <input
                         id="full-name"
                         name="fullName"
                         type="text"
                         placeholder="Evil Rabbit"
                         className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-green-600"
                         required
                       />
                     </Field>
   
                     <Field>
                       <FieldLabel htmlFor="email">Email address</FieldLabel>
                       <input
                         id="email"
                         name="email"
                         type="email"
                         placeholder="name@example.com"
                         className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-green-600"
                         required
                       />
                     </Field>
   
                     <div className="grid gap-4 md:grid-cols-2">
                       <Field>
                         <FieldLabel htmlFor="password">Password</FieldLabel>
                         <input
                           id="password"
                           name="password"
                           type="password"
                           placeholder="••••••••"
                           className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-green-600"
                           required
                         />
                       </Field>
   
                       <Field>
                         <FieldLabel htmlFor="role">Role</FieldLabel>
                         <select
                           id="role"
                           name="role"
                           defaultValue=""
                           className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-green-600"
                           required
                         >
                           <option value="" disabled>
                             Select role
                           </option>
                           <option value="client">Client</option>
                           <option value="therapist">Therapist</option>
                         </select>
                       </Field>
                     </div>
   
                     
   
                     <Field>
                       <FieldLabel htmlFor="terms" className="font-normal">
                         <span className="flex items-center gap-3">
                           <input
                             id="terms"
                             name="terms"
                             type="checkbox"
                             className="h-4 w-4 rounded border-black/20 text-green-700 focus:ring-green-600"
                             required
                           />
                           I agree to the terms and privacy policy
                         </span>
                       </FieldLabel>
                     </Field>
                   </FieldGroup>
                 </FieldSet>
   
                 <FieldSeparator />
   
                 <Field orientation="horizontal" className="justify-between gap-3">
                   <Button type="submit" className="min-w-32">
                     Create Account
                   </Button>
                   <Button variant="outline" type="button" className="min-w-32">
                     Cancel
                   </Button>
                 </Field>
               </FieldGroup>
             </form>
           </div>
         </div>
       </section>
     )
   }
  


export default Signup