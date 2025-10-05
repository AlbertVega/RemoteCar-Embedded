import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Estado inicial del carro
let carControls = {
  speed: 50,
  direction: { x: 0, y: 0 },
  lights: {
    headlights: false,
    taillights: false,
    leftTurn: false,
    rightTurn: false,
    brake: false,
    reverse: false,
    fog: false,
  },
  turbo: false,
};

// --- ENDPOINTS ---
// Probar conexión
app.get("/api/status", (req, res) => {
  res.json({ message: "✅ Backend conectado correctamente" });
});

// Obtener controles actuales
app.get("/api/controls", (req, res) => {
  res.json(carControls);
});

// Actualizar controles
app.post("/api/controls", (req, res) => {
  carControls = { ...carControls, ...req.body };
  res.json({ message: "✅ Controles actualizados", controls: carControls });
});

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});
