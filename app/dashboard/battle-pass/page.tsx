'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  name: string
}

export default function BattlePassPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [newProfileName, setNewProfileName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔐 Auth + carregar personagens
  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        router.replace('/')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setProfiles(data)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  // ➕ Criar personagem
  async function createProfile() {
    if (!newProfileName.trim()) return

    setCreating(true)
    setError(null)

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      router.replace('/')
      return
    }

    const { error } = await supabase.from('profiles').insert({
      name: newProfileName,
      user_id: authData.user.id
    })

    if (error) {
      setError('Erro ao criar personagem')
      setCreating(false)
      return
    }

    // 🔄 Recarregar lista
    const { data } = await supabase
      .from('profiles')
      .select('id, name')
      .order('created_at', { ascending: true })

    if (data) setProfiles(data)

    setNewProfileName('')
    setCreating(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-purple-600 text-white">
        Carregando Passe de Batalha...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-purple-600 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-purple-600">
            Passe de Batalha
          </h1>
          <p className="text-purple-400 text-sm mt-1">
            Escolha ou crie um personagem
          </p>
        </header>

        {/* CRIAR PERSONAGEM */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <h2 className="font-semibold text-purple-600 mb-3">
            Criar novo personagem
          </h2>

          <div className="flex gap-3">
            <input
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              placeholder="Nome do personagem"
              className="flex-1 border rounded-lg px-4 py-2 text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              onClick={createProfile}
              disabled={creating}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {creating ? 'Criando...' : 'Criar'}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">
              {error}
            </p>
          )}
        </div>

        {/* LISTA DE PERSONAGENS */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow">
            <p className="text-purple-600 font-semibold">
              Nenhum personagem criado
            </p>
            <p className="text-purple-400 text-sm mt-2">
              Crie um personagem para começar
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <div
                key={profile.id}
                onClick={() =>
                  router.push(`/dashboard/battle-pass/${profile.id}`)
                }
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition cursor-pointer border-t-4 border-purple-600"
              >
                <h3 className="text-lg font-bold text-purple-600">
                  {profile.name}
                </h3>
                <p className="text-purple-400 text-sm mt-1">
                  Acessar missões
                </p>
              </div>
            ))}
          </section>
        )}

      </div>
    </main>
  )
}
