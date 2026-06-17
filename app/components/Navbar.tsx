"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import  { useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Layers2 } from 'lucide-react'
import { checkAndAddUser } from '../actions'

// cette composant est utilisé pour afficher la barre de navigation dans l'application. Il utilise le hook usePathname pour obtenir le chemin actuel de l'URL et déterminer quel lien de navigation est actif. Les liens de navigation sont définis dans un tableau navlinks, et la fonction renderlinks est utilisée pour générer les éléments de lien avec les classes CSS appropriées en fonction de leur état actif ou non.
const Navbar = () => {
    const pathname=usePathname()
    //pour recuperer les informations des utilisateurs 
    const {user}=useUser()
    
    const navlinks=[
        {
        href:'/',
        label:'Factures'}
    ]
    //pour mettre a jour le composant chaque fois que les informations de l'utilisateur changent, par exemple après la connexion ou la déconnexion affiche avant que la page charge.
    useEffect(()=>{
    if(user?.primaryEmailAddress?.emailAddress && user?.fullName){
        //on appelle à la fonction checkAndAddUser pour vérifier si l'utilisateur existe déjà dans la base de données et l'ajouter si ce n'est pas le cas.
        checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName)
    }
    },[user])

    const  isActiveLink=(href:string)=>pathname.replace(/\/$/,'')===href.replace(/\/$/,'');

const renderlinks=(classNames:string)=>
     navlinks.map(({href,label})=>{
        return  <Link href={href} key={href} className={
            `btn-sm ${classNames} ${isActiveLink(href)? "btn-accent":""} flex justify-center items-center`
        }>{label}</Link>
    })

  return (
    <div className='border-b  border-base-300 px-5 md:px-[10%] py-4 relative'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                <div className='bg-accent-content text-accent rounded-full p-2'>
                   <Layers2 className='w-5 h-5 md:w-6 md:h-6'/>
                </div>
                <span className='font-bold text-lg md:text-2xl italic'>
                   In<span className='text-accent'>voice</span>
                </span>
            </div>
            <div className='flex items-center gap-3'>
                {renderlinks("btn")}
                <UserButton/>
            </div>
        </div>

    </div>
  )
}

export default Navbar