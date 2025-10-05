"use client"

import { useState, useEffect, useCallback } from "react"
import Card from "../components/ui/card"
import Button from "../components/ui/button"
import Badge from "../components/ui/badge"
import Slider from "../components/ui/slider"
import { Joystick } from "../components/joystick"
import { Car, Gauge, Lightbulb, Camera, Settings, Power, ArrowLeft, ArrowRight, Sun, Moon } from "lucide-react"
import StreamViewer from "../components/stream"
import StatusPanel from "../components/status"
import { getControls, updateControls } from "../../api/api"



// ================== TYPES ==================
interface CarControls {
  speed: number
  direction: { x: number; y: number }
  lights: {
    headlights: boolean
    taillights: boolean
    leftTurn: boolean
    rightTurn: boolean
    brake: boolean
    reverse: boolean
    fog: boolean
  }
  turbo: boolean
}

// ================== COMPONENT ==================
export default function Control() {
  const [socket, setSocket] = useState<WebSocket | null>(null);//-------------------------------
  const [messages, setMessages] = useState<string[]>([]);//-------------------------------

  const [controls, setControls] = useState<CarControls | null>(null)
  const [isConnected, setIsConnected] = useState(false)  
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

  // === Cargar estado inicial desde backend ===
  useEffect(() => {
    getControls().then((data) => setControls(data))
  }, [])

  // === Enviar al backend ===
  const sendControlsToBackend = useCallback(
    async (newControls: CarControls) => {
      if (!isConnected) return
      try {
        await updateControls(newControls)
      } catch (error) {
        console.error("Error enviando controles:", error)
      }
    },
    [isConnected]
  )

  // === Hook que sincroniza cuando cambia el estado ===
  useEffect(() => {
    if (controls) sendControlsToBackend(controls)
  }, [controls, sendControlsToBackend])

  // === Handlers ===
  const handleJoystickMove = (x: number, y: number) => {
    setControls((prev) => prev && { ...prev, direction: { x, y } })
  }

  const toggleConnection = () => {
    setIsConnected(!isConnected)
  }

  const toggleLight = (lightType: keyof CarControls["lights"]) => {
    setControls((prev) =>
      prev
        ? {
            ...prev,
            lights: { ...prev.lights, [lightType]: !prev.lights[lightType] },
          }
        : prev
    )
  }

  useEffect(() => {
    // Use the Pi’s IP on your LAN instead of localhost
    const ws = new WebSocket("ws://localhost:2027");

    ws.onopen = () => console.log("✅ Connected to Pi server");
    ws.onmessage = (msg) => setMessages((prev) => [...prev, msg.data]);
    ws.onerror = (err) => console.error("❌ WebSocket error:", err);
    
    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = (mess: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(mess);
    }else{
      console.log("ASdas");
    }
  };

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setActiveKeys((prev) => new Set(prev).add(key))
      setControls((prev) => {
        if (!prev) return prev
        switch (key) {
          case "w":
          case "arrowup":
            return { ...prev, direction: { ...prev.direction, y: -1 } }
          case "s":
          case "arrowdown":
            return { ...prev, direction: { ...prev.direction, y: 1 } }
          case "a":
          case "arrowleft":
            return { ...prev, direction: { ...prev.direction, x: -1 } }
          case "d":
          case "arrowright":
            return { ...prev, direction: { ...prev.direction, x: 1 } }
          default:
            return prev
        }
      })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setActiveKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })

      setControls((prev) => {
        if (!prev) return prev
        switch (key) {
          case "w":
          case "arrowup":
          case "s":
          case "arrowdown":
            return { ...prev, direction: { ...prev.direction, y: 0 } }
          case "a":
          case "arrowleft":
          case "d":
          case "arrowright":
            return { ...prev, direction: { ...prev.direction, x: 0 } }
          default:
            return prev
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  if (!controls) return <div className="p-4">Cargando controles...</div>

  // ================== UI ==================
  return (
    <div className="h-screen w-screen bg-background grid-bg p-2 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-primary neon-glow" />
              <div>
                <h1 className="text-xl font-bold text-primary">RACER CONTROL</h1>
                <p className="text-xs text-muted-foreground">Sistema de Control Avanzado</p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="px-2 py-1 text-xs">
              {isConnected ? "🟢 CONECTADO" : "🔴 DESCONECTADO"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={toggleConnection}
              variant={isConnected ? "destructive" : "default"}
              className="neon-glow px-3 py-1"
              size="sm"
            >
              <Power className="w-4 h-4 mr-1" />
              {isConnected ? "DESCONECTAR" : "CONECTAR"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 h-[calc(100vh-100px)]">
          {/* Primera fila: Stream y controles principales */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[60%]">
            {/* Stream Viewer */}
            <div className="lg:col-span-2">
              <StreamViewer isConnected={isConnected} />
            </div>

            {/* Joystick */}
            <div>
              <Card className="p-3 border-primary/20 bg-card/50 backdrop-blur h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-primary">JOYSTICK</h3>
                </div>
                <Joystick onMove={handleJoystickMove} />
              </Card>
            </div>

            {/* Control de Velocidad */}
            <div>
              <Card className="p-3 border-accent/20 bg-card/50 backdrop-blur h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold text-accent">VELOCIDAD</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-xl font-bold text-accent">{controls.speed}</span>
                    <span className="text-xs text-muted-foreground ml-1">km/h</span>
                  </div>
                  <Slider
                    value={controls.speed}
                    onChange={(value: number) =>{setControls((prev) => prev && { ...prev, speed: value }); sendMessage("v".concat(value.toString()))}
                      
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Segunda fila: Luces y Teclado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[35%]">
            {/* Panel de Luces */}
            <Card className="p-3 border-secondary/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-semibold text-secondary">LUCES</h3>
              </div>
              <div className="space-y-2">
                {/* Luces Principales */}
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant={controls.lights.headlights ? "default" : "outline"}
                    size="sm"
                    onClick={() => {toggleLight("headlights"); sendMessage("ff")}}
                    className="flex flex-col items-center gap-1 text-xs p-2 h-auto"
                    
                  >
                    <Sun className="w-3 h-3" />
                    <span>Faros</span>
                  </Button>
                  <Button
                    variant={controls.lights.taillights ? "default" : "outline"}
                    size="sm"
                    onClick={() => {toggleLight("taillights"); sendMessage("ft");}}
                    className="flex flex-col items-center gap-1 text-xs p-2 h-auto"
                  >
                    <Moon className="w-3 h-3" />
                    <span>Traseras</span>
                  </Button>
                  <Button
                    variant={controls.lights.leftTurn ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {toggleLight("leftTurn"); sendMessage("fi");}}
                    className="flex flex-col items-center gap-1 text-xs p-2 h-auto"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Izq</span>
                  </Button>
                  <Button
                    variant={controls.lights.rightTurn ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {toggleLight("rightTurn"); sendMessage("fd");}}
                    className="flex flex-col items-center gap-1 text-xs p-2 h-auto"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Der</span>
                  </Button>
                </div>

                {/* Indicadores Automáticos */}
                <div className="flex justify-between text-xs gap-2">
                  <span
                    className={`px-2 py-1 rounded flex-1 text-center ${
                      controls.lights.brake
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted"
                    }`}
                  >
                    FRENO
                  </span>
                  <span
                    className={`px-2 py-1 rounded flex-1 text-center ${
                      controls.lights.reverse
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted"
                    }`}
                  >
                    REVERSA
                  </span>
                </div>
              </div>
            </Card>

            {/* Controles de Teclado */}
            <Card className="p-3 border-destructive/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-destructive">CONTROLES DE TECLADO</h3>
              </div>
              <div className="space-y-2">
                {/* Controles de Movimiento en cruz */}
                <div className="grid grid-cols-3 gap-1 max-w-48 mx-auto">
                  <div></div>
                  <div
                    onClick={() => {sendMessage("d")}}

                    className={`p-2 rounded border text-center text-xs ${
                      activeKeys.has("w") || activeKeys.has("arrowup")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-muted"
                    }`}
                    style={{"cursor":""}}
                  >
                    <div className="font-bold">W / ↑</div>
                    <div>Adelante</div>
                  </div>
                  <div></div>
                  <div
                    onClick={() => {sendMessage("z")}}
                    className={`p-2 rounded border text-center text-xs ${
                      activeKeys.has("a") || activeKeys.has("arrowleft")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-bold">A / ←</div>
                    <div>Izquierda</div>
                  </div>
                  <div
                    onClick={() => {sendMessage("t")}}
                    className={`p-2 rounded border text-center text-xs ${
                      activeKeys.has("s") || activeKeys.has("arrowdown")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-bold">S / ↓</div>
                    <div>Atrás</div>
                  </div>
                  <div
                    onClick={() => {sendMessage("e")}}
                    className={`p-2 rounded border text-center text-xs ${
                      activeKeys.has("d") || activeKeys.has("arrowright")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-bold">D / →</div>
                    <div>Derecha</div>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  WASD o flechas para mover
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
