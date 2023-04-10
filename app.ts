import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import multer from "multer";
import path from "path";
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
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(__dirname + "/uploads"));

const io = new Server(httpServer, {
  path: "/socket/chat",
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log(`유저입장 : ${new Date()} 유저아이디:${socket.id}`);

  socket.on("sendMessage", ({ userName, message }: { userName: string; message: string }) => {
    io.emit("message", { userName, message });
  });

  socket.on("disconnect", () => {
    console.log(`유저나감 : ${new Date()}  유저아이디:${socket.id}`);
  });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/chat");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

app.post("/upload", upload.single("chatImage"), (req: Request, res: Response) => {
  const imagePath: string = req.file ? `uploads/chat/${req.file?.filename}` : "";

  res.status(200).send({
    status: 200,
    message: "ok",
    data: { chatImg: imagePath },
  });
});

httpServer.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
