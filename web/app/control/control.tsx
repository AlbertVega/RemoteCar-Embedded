"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const [isConnected, setIsConnected] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currClicked, setCurrPressed] = useState("0");

  const socketRef = useRef<WebSocket | null>(null);

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
    const ws = new WebSocket("ws://192.168.18.146:2027");

    ws.onopen = () => console.log("Connected to Pi server");
    ws.onmessage = (msg) => setMessages((prev) => [...prev, msg.data]);
    ws.onerror = (err) => console.error("WebSocket error:", err);
    
    setSocket(ws);
    socketRef.current = ws;

    return () => ws.close();
  }, []);

  const startStream = () =>{
    const ws = new WebSocket("ws://localhost:2025");
    ws.onopen = () => console.log("Connected to Pi server");
    ws.onmessage = (msg) => setMessages((prev) => [...prev, msg.data]);
    ws.onerror = (err) => console.error("WebSocket error:", err);

    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send("a");
    }
  }

  const sendMessage = (mess: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(mess);
    }else{
      console.log("ASdas");
    }
  };

  const keyPadPressed = (mess: string) =>{
    console.log(mess);
    setCurrPressed(mess);
    sendMessage(mess);
  };

  const keyPadUnpressed = () =>{
    setCurrPressed("0");
    sendMessage("F");
  };

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setActiveKeys((prev) => new Set(prev).add(key));
      if(currClicked == "0"){
        let message = "";
        if(key.length > 1){
          switch(key[5]){
            case "u":
              message = "w";
              break;
            case "d":
              message = "s";
              break;
            case "r":
              message = "d";
              break;
            case "l":
              message = "a";
              break;
          }
        }else{
          message = key;
        }
        keyPadPressed(message);
      }
      
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
      keyPadUnpressed();
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-primary neon-glow" />
            <h1 className="text-xl font-bold text-primary">CONTROL</h1>
            <Badge variant={isConnected ? "default" : "secondary"} className="px-2 py-1 text-xs">
              {isConnected ? "🟢 CONECTADO" : "🔴 DESCONECTADO"}
            </Badge>
          </div>

          <Button
            onClick={toggleConnection}
            className={`px-3 py-1 border text-primary border-primary bg-background hover:opacity-80 transition ${
              isConnected ? "opacity-70" : ""
            }`}
            size="sm"
          >
            <Power className="w-4 h-4 mr-1" />
            {isConnected ? "DESCONECTAR" : "CONECTAR"}
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-3 h-[calc(100vh-100px)]">
          {/* Fila superior */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[60%]">
            <div className="lg:col-span-2">
              <StreamViewer isConnected={isConnected} />
            </div>

            {/* JOYSTICK Y VELOCIDAD */}
            <div className="flex flex-col gap-3">
              {/* JOYSTICK */}
              <Card className="flex flex-col justify-center items-center border-none bg-transparent shadow-none h-1/2">
                <div className="flex items-center gap-2 mb-2 self-start">
                  <Settings className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-primary">JOYSTICK</h3>
                </div>
                <div className="flex flex-1 justify-center items-center">
                  <Joystick onMove={handleJoystickMove} />
                </div>
              </Card>

              {/* VELOCIDAD */}
              <Card className="flex flex-col justify-center items-center border-none bg-transparent shadow-none h-1/2">
                <div className="flex items-center gap-2 mb-2 self-start">
                  <Gauge className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold text-accent">VELOCIDAD</h3>
                </div>
                <div className="flex flex-col justify-center items-center flex-1 w-full">
                  <div className="text-center mb-2">
                    <span className="text-lg font-bold text-accent">{controls.speed}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">km/h</span>
                  </div>
                  <Slider
                    value={controls.speed}
                    onChange={(value: number) => setControls((prev) => prev && { ...prev, speed: value })}
                    max={100}
                    step={5}
                    className="w-[80%]"
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Fila inferior (luces + teclado) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[35%]">
            {/* LUCES */}
            <Card className="p-2 border-none bg-transparent shadow-none">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-semibold text-secondary">LUCES</h3>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { key: "headlights", label: "Faros", icon: <Sun className="w-3 h-3" /> },
                    { key: "taillights", label: "Traseras", icon: <Moon className="w-3 h-3" /> },
                    { key: "leftTurn", label: "Izq", icon: <ArrowLeft className="w-3 h-3" /> },
                    { key: "rightTurn", label: "Der", icon: <ArrowRight className="w-3 h-3" /> },
                  ].map(({ key, label, icon }) => (
                    <Button
                      key={key}
                      size="sm"
                      onClick={() => toggleLight(key as keyof CarControls["lights"])}
                      className={`flex flex-col items-center gap-0.5 text-[10px] p-1 h-auto ${
                        controls.lights[key as keyof CarControls["lights"]]
                          ? "bg-primary text-primary-foreground neon-glow"
                          : "bg-transparent border border-secondary/30"
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* CONTROLES DE TECLADO */}
            <Card className="p-2 border-none bg-transparent shadow-none">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-destructive">CONTROLES DE TECLADO</h3>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-1 max-w-48 mx-auto flex justify-end">
                  <div></div>
                  <div
                    className={`p-1 rounded border text-center text-[10px] ${
                      activeKeys.has("w") || activeKeys.has("arrowup")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="font-bold text-[11px]">W / ↑</div>
                    <div>Adelante</div>
                  </div>
                  <div></div>

                  <div
                    className={`p-1 rounded border text-center text-[10px] ${
                      activeKeys.has("a") || activeKeys.has("arrowleft")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="font-bold text-[11px]">A / ←</div>
                    <div>Izquierda</div>
                  </div>

                  <div
                    className={`p-1 rounded border text-center text-[10px] ${
                      activeKeys.has("s") || activeKeys.has("arrowdown")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="font-bold text-[11px]">S / ↓</div>
                    <div>Atrás</div>
                  </div>

                  <div
                    className={`p-1 rounded border text-center text-[10px] ${
                      activeKeys.has("d") || activeKeys.has("arrowright")
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="font-bold text-[11px]">D / →</div>
                    <div>Derecha</div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-muted-foreground">
                  WASD o flechas para mover
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )}