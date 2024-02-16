import { Router } from "express";
import { authController } from "./authController";
import { staticController } from "./staticController";
import { appController } from "./appController";

export const controllers = Router();

controllers.use("/app", appController);
controllers.use(staticController);
controllers.use(authController);
