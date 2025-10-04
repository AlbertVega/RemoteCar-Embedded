"use client"

import { Battery, Signal } from "lucide-react"

interface StatusPanelProps {
  battery: number
  signal: number
  isConnected: boolean
}

export default function StatusPanel({ battery, signal, isConnected }: StatusPanelProps) {
  return (
    <div className="flex items-center gap-3 text-xs">
     

      {/* Estado de conexión */}
      {isConnected && (
        <span className="px-2 py-1 rounded bg-green-600 text-white">
          ONLINE
        </span>
      )}
    </div>
  )
}
