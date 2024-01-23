// Importamos las librerías
import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
config();

// Creamos la variable APP para el inicio del servidor
const app = express();

// Configuraciones previas
app.set("port", process.env.PORT || 3000);
// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cors());

import email_routes from "./routes/email.routes";
import lote_routes from "./routes/lote.routes";
import default_routes from "./routes/default.routes";
import { AuthMiddleware } from "./middleware/auth.middleware";

app.use(AuthMiddleware.validateApiKey);
app.use("/api/email", email_routes);
app.use("/api/lote", lote_routes);

app.all("*", default_routes);

export default app;
