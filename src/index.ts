import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./db";
import { Liquid } from "liquidjs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const engine = new Liquid();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine("liquid", engine.express());
app.set("views", "./src/views");
app.set("view engine", "liquid");

app.get("/", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/hero");
  }
  res.render("index");
});

app.get("/about", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/about");
  }
  res.render("about");
});

app.post("/signin", async (req: Request, res: Response) => {
  res.send({ ok: 1 });
});

app.get("/signin", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signin");
  }
  res.render("signin");
});

app.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  /*const user = await prisma.user.create({
    data: {
      email,
      passwd: password,
    },
  });*/
  // Token - JWT
  res.cookie("token", email, { maxAge: 900000, httpOnly: true });
  res.header("hx-redirect", "/app");
  res.send("");
});

app.get("/app", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.render("app", { users, email: req.cookies.token });
});

app.get("/signup", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signup");
  }
  res.render("signup");
});

app.get("/logout", (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.header("hx-redirect", "/");
  res.send("");
});

app.get("/db", async (req: Request, res: Response) => {
  const totalTodos = await prisma.todo.count();
  res.send({ totalTodos });
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
