// @ts-nocheck
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/invoices")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-spinner loading-lg text-accent" />
    </div>
  )
}
