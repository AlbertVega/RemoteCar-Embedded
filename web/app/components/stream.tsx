import { useState, useEffect } from "react"
import Card from "./ui/card"
import Button from "./ui/button"
import Badge from "./ui/badge"

import { Camera, Maximize2, Volume2, VolumeX, RotateCcw, Wifi, WifiOff } from "lucide-react"

interface StreamProps {
  isConnected: boolean
}

export default function StreamViewer({ isConnected }: StreamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [streamQuality, setStreamQuality] = useState<"HD" | "SD" | "LOW">("HD")
  const [fps, setFps] = useState(30)
  const [latency, setLatency] = useState(45)

  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setFps(28 + Math.random() * 4)
      setLatency(40 + Math.random() * 20)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden">
      <div className="relative aspect-video bg-black/80 flex items-center justify-center">
        {isConnected ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="text-center text-primary/60">
              <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <img src="http://192.168.18.146:8080/?action=stream" alt="Camera" />
            </div>

            <div className="absolute top-4 left-4 space-y-2">
              <Badge color="default">
                <Wifi className="w-3 h-3 mr-1" />
                {streamQuality} • {Math.round(fps)}fps
              </Badge>
              <Badge color="warning">Latencia: {Math.round(latency)}ms</Badge>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <WifiOff className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-mono">SIN CONEXIÓN</p>
          </div>
        )}
      </div>
    </Card>
  )
}
