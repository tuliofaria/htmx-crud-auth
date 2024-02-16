import { Router } from "express";
import { authController } from "./auth";
import { appController } from "./app";

export const controllers = Router();

controllers.use(authController);
controllers.use("/app", appController);
