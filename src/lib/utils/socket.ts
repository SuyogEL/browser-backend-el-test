import { Server } from "socket.io";
import http from "http";
import { decrypt } from "./common";

interface UserSocket {
  sessionId: string;
  socketId: string;
}

class SocketService {
  private _io: Server;
  private userSockets: Record<string, UserSocket[]> = {};

  constructor(httpServer: http.Server) {
    this._io = new Server(httpServer, {
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
        credentials: true,
      },
    });
  }

  public initListeners(): void {
    const io = this.io;

    io.on("connect", (socket) => {
      const token = socket.handshake.query.token as string;
      const decryptedToken = decrypt(token);
      const parsedToken = JSON.parse(decryptedToken);
      const userId = parsedToken.userId;
      const sessionId = parsedToken.sessionId;

      this.addUserSocket(userId, sessionId, socket.id);

      socket.on("event:message", ({ message }: { message: string }) => {
        console.log("New Message Received:", message);
      });

      socket.on("disconnect", () => {
        console.log(`Socket Disconnected: ${socket.id}`);
        this.removeUserSocket(userId, sessionId);
      });
    });
  }

  private addUserSocket(userId: string, sessionId: string, socketId: string): void {
    if (!this.userSockets[userId]) {
      this.userSockets[userId] = [];
    }
    this.userSockets[userId].push({ sessionId, socketId });
    console.log(`Sockets`, this.userSockets);
  }

  private removeUserSocket(userId: string, sessionId: string): void {
    const userSessions = this.userSockets[userId];
    if (userSessions) {
      this.userSockets[userId] = userSessions.filter(
        (socket) => socket.sessionId !== sessionId
      );
      if (this.userSockets[userId].length === 0) {
        delete this.userSockets[userId];
      }
    }
    console.log(`Sockets`, this.userSockets);
  }

  public getSocketsByUserId(userId: string) {
    return this.userSockets[userId] || [];

  }

  public logoutSession(userId: string, sessionId: string, callback: (success: boolean) => void): void {
    const userSockets = this.getSocketsByUserId(userId);
    const sessionToLogout = userSockets.find(socket => socket.sessionId === sessionId);
    if (sessionToLogout) {
      const socket = this._io.sockets.sockets.get(sessionToLogout.socketId);
      if (socket) {
        socket.emit("event:logout", { message: "You have been logged out by an admin." });
        socket.disconnect(true);
        this.removeUserSocket(userId, sessionId);
        console.log(`Sockets`, this.userSockets);
        callback(true);
        return;
      }
    }
    callback(false);
  }

  get io(): Server {
    return this._io;
  }
}

export default SocketService;
