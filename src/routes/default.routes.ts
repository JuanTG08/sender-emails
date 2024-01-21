import { Router } from "express";
import { DefaultController } from "../controller/default.controller";
// Importamos funciones de nuestro controlador

const router = Router();

const ctrlEmail = new DefaultController();

router.route("*").all(ctrlEmail.pageNotFound);

export default router;
