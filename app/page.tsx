'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔒 Verifica se já está logado
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  async function signIn() {
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      return
    }

    router.replace('/dashboard')
  }

  async function signUp() {
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      return
    }

    // Funciona se confirmação de email estiver DESATIVADA
    router.replace('/dashboard')
  }

  // ⏳ Loading enquanto valida sessão
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-purple-600 text-white">
        Verificando sessão...
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-purple-600">

      {/* LOGO */}
      <div className="mb-8">
        <Image
          src="/logo-v2.png"
          alt="Logo"
          width={400}
          height={400}
          priority
          className="drop-shadow-xl"
        />
      </div>

      {/* BOX LOGIN */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-600">
          Entrar
        </h1>

        <input
          className="text-purple-600 w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-400"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="text-purple-600 w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-400"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition mb-2"
        >
          Entrar
        </button>

        <button
          onClick={signUp}
          className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition"
        >
          Criar conta
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
