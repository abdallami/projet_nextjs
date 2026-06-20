import { SignIn } from '@clerk/nextjs'
import { Layers2, ShieldCheck, Zap, Users } from 'lucide-react'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen flex flex-col lg:flex-row'>

      {/* Côté gauche — présentation */}
      <div className='hidden lg:flex lg:w-1/2 bg-accent flex-col justify-between p-12'>

        {/* Logo */}
        <div className='flex items-center gap-2'>
          <div className='bg-white/10 rounded-xl p-2.5'>
            <Layers2 className='w-6 h-6 text-white' />
          </div>
          <span className='font-black text-2xl italic text-white tracking-tight'>
            Invoice
          </span>
        </div>

        {/* Pitch central */}
        <div className='space-y-8'>
          <div>
            <h1 className='text-4xl font-black text-white leading-tight mb-4'>
              Bon retour
              <br />
              <span className='text-white/70'>parmi nous !</span>
            </h1>
            <p className='text-white/60 text-base leading-relaxed'>
              Connectez-vous pour accéder à votre tableau de bord,
              gérer vos factures et suivre votre stock en temps réel.
            </p>
          </div>

          {/* Features */}
          <div className='space-y-4'>
            {[
              {
                icon: Zap,
                title: "Rapide et fiable",
                desc: "Accédez à toutes vos données instantanément"
              },
              {
                icon: ShieldCheck,
                title: "Sécurisé",
                desc: "Vos données sont protégées et chiffrées"
              },
              {
                icon: Users,
                title: "Fait pour vous",
                desc: "Conçu pour les commerçants et PME au Tchad"
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className='flex items-start gap-3'>
                <div className='bg-white/10 rounded-lg p-2 shrink-0 mt-0.5'>
                  <Icon className='w-4 h-4 text-white' />
                </div>
                <div>
                  <p className='text-white font-semibold text-sm'>{title}</p>
                  <p className='text-white/50 text-xs mt-0.5'>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 pt-4 border-t border-white/10'>
            {[
              { value: "100%", label: "Gratuit" },
              { value: "FCFA", label: "Devise locale" },
              { value: "PME", label: "Ciblé Tchad" },
            ].map(({ value, label }) => (
              <div key={label} className='text-center'>
                <p className='text-white font-black text-xl'>{value}</p>
                <p className='text-white/40 text-xs mt-0.5'>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer gauche */}
        <p className='text-white/30 text-xs'>
          © 2026 Invoice — Conçu pour les PME tchadiennes
        </p>
      </div>

      {/* Côté droit — formulaire */}
      <div className='flex-1 flex flex-col items-center justify-center bg-base-100 px-6 py-12'>

        {/* Logo mobile uniquement */}
        <div className='flex lg:hidden items-center gap-2 mb-8'>
          <div className='bg-accent/10 text-accent rounded-xl p-2.5'>
            <Layers2 className='w-6 h-6' />
          </div>
          <span className='font-black text-2xl italic tracking-tight'>
            In<span className='text-accent'>voice</span>
          </span>
        </div>

        <div className='w-full max-w-md'>
          <div className='mb-6 text-center lg:text-left'>
            <h2 className='text-2xl font-bold mb-1'>
              Connexion
            </h2>
            <p className='text-sm text-gray-400'>
              {"Entrez vos identifiants pour accéder à votre espace"}
            </p>
          </div>

          <SignIn />
        </div>

      </div>

    </div>
  )
}

export default page