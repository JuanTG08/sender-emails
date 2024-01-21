// Importamos APP
import app from "./app";
import http from "http";

// Funcion de Inicio de la Aplicación
const main = async () => {
  // Puerto por el que corre el servidor
  const port = app.get("port");
  // Creamos el servidor socket
  const Server = http.createServer(app);
  // Creamos la constante httpServer con el inicio del servidor
  const httpServer = await Server.listen(port);
  console.log("Listening on Port", port);
};
// Ejecutamos la funcionalidad inicial
main();
