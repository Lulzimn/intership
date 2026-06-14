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
         className="relative min-h-screen bg-cover bg-center px-4 py-8 sm:px-6 sm:py-12"
         style={{ backgroundImage: `url(${Img})` }}
       >
         <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-4 sm:gap-10 md:grid-cols-[1.1fr_0.9fr]">
           <div className="max-w-xl text-white drop-shadow-lg">
             <p className="mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.35em] text-white/80">
               Therapy Internship
             </p>
             <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold leading-tight">
               Log in or create an account
             </h1>
             <p className="mt-3 sm:mt-6 max-w-lg text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-white/85">
               Join the platform to access guided support, track your progress, and
               stay connected with your therapy journey.
             </p>
           </div>
   
           <div className="w-full max-w-xl rounded-2xl sm:rounded-[2rem] bg-white/85 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md md:ml-auto">
             <form className="space-y-6">
               <FieldGroup>
                 <FieldSet>
                   <FieldLegend className="text-lg sm:text-xl">Create account</FieldLegend>
                   <FieldDescription className="text-xs sm:text-sm">
                     Fill in your details to get started.
                   </FieldDescription>
   
                   <FieldGroup>
                     <Field>
                       <FieldLabel htmlFor="full-name" className="text-xs sm:text-sm">Full name</FieldLabel>
                       <input
                         id="full-name"
                         name="fullName"
                         type="text"
                         placeholder="Evil Rabbit"
                         className="h-9 sm:h-11 w-full rounded-lg sm:rounded-xl border border-black/10 bg-white px-3 sm:px-4 text-xs sm:text-sm outline-none transition focus:border-green-600"
                         required
                       />
                     </Field>
   
                     <Field>
                       <FieldLabel htmlFor="email" className="text-xs sm:text-sm">Email address</FieldLabel>
                       <input
                         id="email"
                         name="email"
                         type="email"
                         placeholder="name@example.com"
                         className="h-9 sm:h-11 w-full rounded-lg sm:rounded-xl border border-black/10 bg-white px-3 sm:px-4 text-xs sm:text-sm outline-none transition focus:border-green-600"
                         required
                       />
                     </Field>
   
                     <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                       <Field>
                         <FieldLabel htmlFor="password" className="text-xs sm:text-sm">Password</FieldLabel>
                         <input
                           id="password"
                           name="password"
                           type="password"
                           placeholder="••••••••"
                           className="h-9 sm:h-11 w-full rounded-lg sm:rounded-xl border border-black/10 bg-white px-3 sm:px-4 text-xs sm:text-sm outline-none transition focus:border-green-600"
                           required
                         />
                       </Field>
   
                       <Field>
                         <FieldLabel htmlFor="role" className="text-xs sm:text-sm">Role</FieldLabel>
                         <select
                           id="role"
                           name="role"
                           defaultValue=""
                           className="h-9 sm:h-11 w-full rounded-lg sm:rounded-xl border border-black/10 bg-white px-3 sm:px-4 text-xs sm:text-sm outline-none transition focus:border-green-600"
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
   
                 <Field orientation="vertical" className="gap-2 sm:gap-3">
                   <Button type="submit" className="w-full sm:w-auto">
                     Create Account
                   </Button>
                   <Button variant="outline" type="button" className="w-full sm:w-auto">
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