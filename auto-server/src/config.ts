import 'dotenv/config';

export const config = {
  dbPath: "./data/app.db", // ruta donde se guardará la base de datos
  adminUser: "admin",
  adminPassword: "admin123", 
  jwtSecret: "supersecreto"
};
