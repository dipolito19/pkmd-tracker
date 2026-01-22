'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  // 🔐 Proteção do Dashboard
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/')
      } else {
        setEmail(data.user.email ?? null)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-purple-600 text-white">
        Carregando dashboard...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-purple-600 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-purple-600">
            Dashboard
          </h1>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/')
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Sair
          </button>
        </header>

        {/* CARDS */}
      {/* OPÇÕES */}
<section className="grid grid-cols-1 gap-6">

  <div
    onClick={() => router.push('/dashboard/battle-pass')}
    className="cursor-pointer bg-purple-800 text-white p-8 rounded-2xl shadow-lg hover:bg-purple-900 transition flex items-center justify-between"
  >
    <div>
      <h2 className="text-2xl font-bold mb-1">
        🎟️ Battle Pass
      </h2>
      <p className="text-purple-200 text-sm">
        Progresso, missões e recompensas
      </p>
    </div>

    <span className="text-3xl">
      →
    </span>
  </div>

</section>

        {/* FOOTER */}
        <footer className="mt-10 text-sm text-purple-100 text-center">
          Logado como: <b className="text-white">{email}</b>
        </footer>

      </div>
    </main>
  )
}
