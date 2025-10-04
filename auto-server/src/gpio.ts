/**import { Direction, LightsState } from './types.js';
import { config } from './config.js';

interface GpioBridge {
  setMotor(direction: Direction, speed: number): Promise<void>;
  setLights(state: LightsState): Promise<void>;
}

class MockBridge implements GpioBridge {
  async setMotor(direction: Direction, speed: number) {
    console.log(`[MOCK] motor → ${direction} @ ${speed}%`);
  }
  async setLights(state: LightsState) {
    console.log(`[MOCK] lights →`, state);
  }
}

let ffiBridge: GpioBridge | null = null;

if (config.gpioBackend === 'ffi') {
  try {
    // Permite cambiar el nombre del módulo nativo vía .env:
    // NODE_VEHICLE_MODULE=node-vehicle (o el nombre real de tu addon)
    const modName = process.env.NODE_VEHICLE_MODULE || 'node-vehicle';
    // @ts-ignore  Módulo opcional cargado en tiempo de ejecución
    const native: any = await import(modName);

    ffiBridge = {
      async setMotor(direction, speed) {
        const map: Record<Direction, number> = {
          stop: 0, forward: 1, backward: 2, left: 3, right: 4
        };
        await native.vehicle_set_motor(
          map[direction],
          Math.max(0, Math.min(100, Math.round(speed)))
        );
      },
      async setLights(s) {
        await native.vehicle_set_lights(
          s.front ? 1 : 0,
          s.rear  ? 1 : 0,
          s.left  ? 1 : 0,
          s.right ? 1 : 0
        );
      }
    };
  } catch (e) {
    console.warn('[gpio] No se pudo cargar el puente FFI, usando mock. Detalle:', e);
  }
}

export const GPIO: GpioBridge = ffiBridge ?? new MockBridge();*/

// src/gpio.ts

// src/gpio.ts



// src/gpio.ts
/**
 * Módulo GPIO con soporte para simulación o hardware real
 */

import { LightsState } from "./types";

const SIMULATION = process.env.SIMULATION === "true";

let GPIO: {
  init: () => void;
  readPin: (pin: number) => number;
  writePin: (pin: number, value: number) => void;
  setMotor: (direction: string, speed: number) => Promise<void>;
  setLights: (state: LightsState) => Promise<void>;
};

if (SIMULATION) {
  console.log("Ejecutando en modo SIMULACIÓN (sin hardware)");

  GPIO = {
    init: () => console.log("GPIO simulado inicializado"),
    readPin: (pin) => { console.log(`Leyendo pin SIMULADO ${pin}`); return 0; },
    writePin: (pin, value) => console.log(`Escribiendo ${value} en pin SIMULADO ${pin}`),
    setMotor: async (direction, speed) => console.log(`Motor SIMULADO → dirección=${direction}, velocidad=${speed}`),
    setLights: async (state: LightsState) => console.log("Luces SIMULADAS → estado:", state),
  };
} else {
  console.log("Ejecutando en modo REAL (con hardware)");

  const { Gpio } = require("onoff");

  GPIO = {
    init: () => console.log("GPIO real inicializado"),
    readPin: (pin) => new Gpio(pin, "in").readSync(),
    writePin: (pin, value) => new Gpio(pin, "out").writeSync(value),
    setMotor: async (direction, speed) => console.log(`Motor REAL → dirección=${direction}, velocidad=${speed}`),
    setLights: async (state: LightsState) => console.log("Luces REALES → estado:", state),
  };
}

export { GPIO };
