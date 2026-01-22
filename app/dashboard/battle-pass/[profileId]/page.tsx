'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Mission = {
  id: string
  title: string
  description: string | null
}

type MissionProgress = {
  id: string
  mission_id: string
  completed: boolean
}

export default function ProfileMissionsPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.profileId as string

  const [loading, setLoading] = useState(true)
  const [missions, setMissions] = useState<Mission[]>([])
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        router.replace('/')
        return
      }

      // Buscar missões
      const { data: missionsData } = await supabase
        .from('missions')
        .select('*')
        .order('created_at')

      // Buscar progresso
      const { data: progressData } = await supabase
        .from('mission_progress')
        .select('mission_id, completed')
        .eq('profile_id', profileId)

      if (missionsData) setMissions(missionsData)

      if (progressData) {
        const map: Record<string, boolean> = {}
        progressData.forEach(p => {
          map[p.mission_id] = p.completed
        })
        setProgress(map)
      }

      setLoading(false)
    }

    loadData()
  }, [router, profileId])

  async function toggleMission(missionId: string) {
    const current = progress[missionId] ?? false

    // Existe progresso?
    if (missionId in progress) {
      await supabase
        .from('mission_progress')
        .update({ completed: !current })
        .eq('profile_id', profileId)
        .eq('mission_id', missionId)
    } else {
      await supabase
        .from('mission_progress')
        .insert({
          profile_id: profileId,
          mission_id: missionId,
          completed: true
        })
    }

    setProgress(prev => ({
      ...prev,
      [missionId]: !current
    }))
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-purple-600 text-white">
        Carregando missões...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-purple-600 p-8">
      <div className="max-w-4xl mx-auto">

        <header className="bg-white rounded-xl p-6 shadow mb-8">
          <h1 className="text-2xl font-bold text-purple-600">
            Missões do Personagem
          </h1>
          <button
            onClick={() => router.back()}
            className="text-purple-500 text-sm mt-2 hover:underline"
          >
            ← Voltar
          </button>
        </header>

        <section className="space-y-4">
          {missions.map(mission => {
            const completed = progress[mission.id] ?? false

            return (
              <div
                key={mission.id}
                className={`bg-white rounded-xl p-5 shadow flex justify-between items-center border-l-4 ${
                  completed ? 'border-green-500' : 'border-purple-600'
                }`}
              >
                <div>
                  <h3 className="font-semibold text-purple-600">
                    {mission.title}
                  </h3>
                  {mission.description && (
                    <p className="text-purple-400 text-sm">
                      {mission.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleMission(mission.id)}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    completed
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {completed ? 'Concluído' : 'Não concluído'}
                </button>
              </div>
            )
          })}
        </section>

      </div>
    </main>
  )
}
