import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { decode, verify } from "jsonwebtoken";
import { secret } from "./auth";

export const appController = Router();

appController.use((req: Request, res: Response, next) => {
  const payload = verify(req.cookies.token, secret) as { id: string };
  if (!payload) {
    return res.redirect("/signin");
  }
  res.locals.id = payload.id;
  next();
});

appController.get("/", async (req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: res.locals.id,
    },
  });
  res.render("app", { todos });
});

appController.post("/todos", async (req: Request, res: Response) => {
  const { title } = req.body;
  if (title.length > 0) {
    const todo = await prisma.todo.create({
      data: {
        userId: res.locals.id,
        todo: title,
        done: false,
      },
    });
    return res.render("partials/todos/item", { todo });
  }
  res.status(400).send("Title is required");
});

appController.get("/todos/:id/title", async (req: Request, res: Response) => {
  const todo = await prisma.todo.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  res.render("partials/todos/edit-title", { todo });
});
appController.put("/todos/:id/title", async (req: Request, res: Response) => {
  const todo = await prisma.todo.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!todo) {
    throw new Error("Not found");
  }
  const newTodo = req.body.todo;
  const updatedTodo = await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      todo: newTodo,
    },
  });
  res.render("partials/todos/title", { todo: updatedTodo });
});

appController.put("/todos/:id", async (req: Request, res: Response) => {
  const { done } = req.body;

  const todo = await prisma.todo.findFirst({
    where: {
      id: Number(req.params.id),
      userId: res.locals.id,
    },
  });
  if (!todo) {
    throw new Error("Todo not found");
  }
  const updatedTodo = await prisma.todo.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      done: !todo.done,
    },
  });
  return res.render("partials/todos/item", {
    todo: updatedTodo,
  });
});
