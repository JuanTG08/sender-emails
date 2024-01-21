import { Router } from "express";
import { EmailController } from "../controller/email.controller";
// Importamos funciones de nuestro controlador

const router = Router();

const ctrlEmail = new EmailController();

router
  .route("/handler-send-emails")
  .post(ctrlEmail.sendEmails)

export default router;