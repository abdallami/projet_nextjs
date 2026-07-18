 // @ts-nocheck
"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Layers2, LayoutDashboard, FileText, Package, Tag, Menu, X, Receipt, BarChart3 } from 'lucide-react'
import { checkAndAddUser } from '../actions'

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
              <Layers2 className='w-5 h-5' />
            </div>
            <span className='font-black text-xl italic tracking-tight'>
              In<span className='text-accent'>voice</span>
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