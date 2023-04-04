import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app: Express = express();
const httpServer = createServer(app);

const PORT: number = 8080;

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("dev"));
// app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

const io = new Server(httpServer, {
  path: "/socket/chat",
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log(`유저입장 ${new Date()} 유저아이디:${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`유저나감 ${new Date()}  유저아이디:${socket.id}`);
  });
});

app.post("/send_message", (req: Request, res: Response) => {
  const { userName, message }: { userName: string; message: string } = req.body;

  io.emit("message", { userName, message });

  res.status(200).send({
    status: 200,
    message: "메세지 전송 성공.",
  });
});

httpServer.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
