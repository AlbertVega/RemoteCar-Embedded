import express from "express";
import authRoutes from "./auth.js";
const app = express();
app.use(express.json());
// Rutas de autenticación
app.use("/auth", authRoutes);
// Ruta simple para verificar token
import jwt from "jsonwebtoken";
import { config } from "./config.js";
app.get("/me", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ error: "Falta token" });
    try {
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        res.json({ user: decoded });
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
});
app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
