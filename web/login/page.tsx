"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const res = await fetch("/auth/login", {   
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        setMessage("✅ Sesión iniciada correctamente")
        setTimeout(() => router.push("./control"), 1000)
      } else {
        setMessage(` ${data.error}`)
      }
   } catch (err) {
  console.error("Error en fetch:", err) 
  setMessage("⚠️ Error de conexión con el servidor")
}

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
      <div className="w-[400px] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 rounded-2xl shadow-lg border border-cyan-500">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6 drop-shadow-lg">
          🎮 Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="👤 Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="🔑 Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400"
          />

          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition shadow-md"
          >
            🚀 Entrar
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-red-400">{message}</p>
        )}

        {/* 🔥 Botón para ir a registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">¿No tienes cuenta?</p>
          <button
            onClick={() => router.push("/register")}
            className="mt-2 px-4 py-2 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition"
          >
            📝 Registrarse
          </button>
        </div>
      </div>
    </div>
  )
}
