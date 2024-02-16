import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./db";
import { Liquid } from "liquidjs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { controllers } from "./controllers";

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

app.use(controllers);

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

app.get("/db", async (req: Request, res: Response) => {
  const totalTodos = await prisma.todo.count();
  res.send({ totalTodos });
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
