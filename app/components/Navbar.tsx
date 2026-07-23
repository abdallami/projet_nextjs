 // @ts-nocheck
"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, FileText, Package, Tag, Menu, X, Receipt, BarChart3 } from 'lucide-react'
import { checkAndAddUser } from '../actions'

const AfricaLogo = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 100 120'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M38 4 C28 4 18 10 14 20 C10 30 12 40 10 50 C8 58 4 64 6 72 C8 82 16 88 22 96 C28 104 32 114 42 116 C50 118 56 110 62 104 C70 96 80 92 86 84 C92 76 90 64 88 54 C86 44 82 36 80 26 C78 16 72 8 62 5 C54 3 46 4 38 4Z'
      fill='currentColor'
      opacity='0.9'
    />
    <path
      d='M62 5 C68 7 74 12 78 20 C72 18 66 16 60 18 C64 14 64 9 62 5Z'
      fill='currentColor'
      opacity='0.6'
    />
    <ellipse cx='88' cy='78' rx='5' ry='9' fill='currentColor' opacity='0.5' transform='rotate(15 88 78)' />
  </svg>
)

const navlinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Factures', icon: FileText },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/rapport', label: 'Rapport', icon: BarChart3 },
  { href: '/inventory', label: 'Inventaire', icon: Package },
  { href: '/categories', label: 'Catégories', icon: Tag },
]

const Navbar = () => {
  const pathname = usePathname()
  const { user } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName)
    }
  }, [user])

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    pathname.replace(/\/$/, '') === href.replace(/\/$/, '')

  return (
    <nav className='border-b border-base-300 bg-base-100/80 backdrop-blur-md sticky top-0 z-50'>
      <div className='px-5 md:px-[10%] py-3'>
        <div className='flex items-center justify-between'>

          {/* Logo */}
          <Link href="/dashboard" className='flex items-center gap-2 group'>
            <div className='bg-accent/10 text-accent rounded-xl p-2 group-hover:bg-accent/20 transition-colors'>
              <AfricaLogo size={20} className='w-5 h-5' />
            </div>
            <span className='font-black text-xl italic tracking-tight'>
              In<span className='text-accent'>voice</span><span>Pro</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className='hidden md:flex items-center gap-1'>
            {navlinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? 'bg-accent text-accent-content shadow-sm'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                }`}
              >
                <Icon className='w-3.5 h-3.5' />
                {label}
              </Link>
            ))}
          </div>

          {/* Droite : user + burger */}
          <div className='flex items-center gap-3'>
            <UserButton />
            {/* Burger mobile */}
            <button
              className='md:hidden btn btn-sm btn-ghost btn-circle'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className='w-4 h-4' /> : <Menu className='w-4 h-4' />}
            </button>
          </div>

        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className='md:hidden mt-3 pb-3 flex flex-col gap-1 border-t border-base-300 pt-3'>
            {navlinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? 'bg-accent text-accent-content'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                }`}
              >
                <Icon className='w-4 h-4' />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar