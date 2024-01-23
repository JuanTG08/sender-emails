import { Router } from "express";
import { LoteController } from "../controller/lote.controller";
// Importamos funciones de nuestro controlador

const router = Router();

const ctrlLote = new LoteController();

router.route("/handler-R-info-lote/:numberLote").get(ctrlLote.infoLote);

export default router;
