import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { sign, verify } from "jsonwebtoken";
import { JWT_SECRET } from "./authController";

export const appController = Router();

// middleware
appController.use((req: Request, res: Response, next) => {
  if (!req.cookies.token) {
    res.redirect("/signin");
    return;
  }
  const payload = verify(req.cookies.token, JWT_SECRET) as {
    id: number;
    email: string;
  };
  if (!payload) {
    res.redirect("/signin");
    return;
  }
  // token de sessão
  const token = sign({ id: payload.id, email: payload.email }, JWT_SECRET);
  res.cookie("token", token, { maxAge: 900000, httpOnly: true });

  res.locals.id = payload.id;
  next();
});

appController.get("/", async (req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: res.locals.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  res.render("app", { id: res.locals.id, todos });
});

appController.put("/todos/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const todo = await prisma.todo.findFirst({
    where: {
      id: parseInt(id),
      userId: res.locals.id,
    },
  });
  if (!todo) {
    res.status(404).send("Todo not found");
    return;
  }

  const updatedTodo = await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      done: !todo.done,
    },
  });

  res.render("partials/todos/todo-item", { todo: updatedTodo });
});

appController.put("/todos/:id/title", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { todo: newTodoContent } = req.body;
  const todo = await prisma.todo.findFirst({
    where: {
      id: parseInt(id),
      userId: res.locals.id,
    },
  });
  if (!todo || newTodoContent.length === 0) {
    res.status(404).send("Todo not found");
    return;
  }

  const updatedTodo = await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      todo: newTodoContent,
    },
  });
  res.render("partials/todos/todo-title", { todo: updatedTodo });
});
appController.get("/todos/:id/title", async (req: Request, res: Response) => {
  const id = req.params.id;
  const todo = await prisma.todo.findFirst({
    where: {
      id: parseInt(id),
      userId: res.locals.id,
    },
  });
  if (!todo) {
    res.status(404).send("Todo not found");
    return;
  }
  res.render("partials/todos/edit-todo-title", { todo });
});

appController.post("/todos", async (req: Request, res: Response) => {
  const { todo } = req.body;
  if (todo.length === 0) {
    res.status(400).send("Invalid todo");
    return;
  }
  const newTodo = await prisma.todo.create({
    data: {
      todo,
      userId: res.locals.id,
    },
  });
  res.render("partials/todos/todo-item", { todo: newTodo });
});
