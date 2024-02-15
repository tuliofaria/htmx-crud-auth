import { Router, Request, Response } from "express";
import { prisma } from "../db";

export const appController = Router();

appController.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.render("app", { users, name: "tulio", email: req.cookies.token });
});

appController.post("/todos", async (req: Request, res: Response) => {
  const { title } = req.body;
  if (title.length > 0) {
    return res.render("partials/todos/item", { title });
  }
  res.status(400).send("Title is required");
});

appController.put("/todos/:title", async (req: Request, res: Response) => {
  const { title } = req.params;
  const { title: val } = req.body;
  return res.render("partials/todos/item", {
    title,
    checked: !val ? "checked" : "false",
  });
});
