import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectdb } from "./database";
import mainRouter from "./routes/index";
import SocketService from "./lib/utils/socket";
import http from "http";
import withDeviceInfo from "./middlewares/withDeviceInfo";

dotenv.config({ path: ".env" });
connectdb();

const app = express();
const httpServer = http.createServer(app);

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(withDeviceInfo)
app.use("/api", mainRouter);

const socketService = new SocketService(httpServer);
socketService.initListeners();

const PORT = process.env.PORT ? process.env.PORT : 8000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export { socketService }