"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ Usuario registrado correctamente")
        setTimeout(() => router.push("/login"), 1500) // 🔥 redirige al login
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (err) {
      setMessage("⚠️ Error de conexión con el servidor")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
      <div className="w-[400px] bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#141e30] p-8 rounded-2xl shadow-lg border border-pink-500">
        <h1 className="text-3xl font-bold text-center text-pink-400 mb-6 drop-shadow-lg">
          📝 Registro Gamer
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="👤 Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="🔑 Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
          />

          <button
            type="submit"
            className="w-full py-3 bg-pink-500 hover:bg-pink-400 text-black font-bold rounded-lg transition shadow-md"
          >
            🎮 Registrarse
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-red-400">{message}</p>
        )}

        {/* 🔥 Botón para volver al login */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">¿Ya tienes cuenta?</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 px-4 py-2 border border-pink-500 text-pink-400 rounded-lg hover:bg-pink-500 hover:text-black transition"
          >
            🎮 Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
