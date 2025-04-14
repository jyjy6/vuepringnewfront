//@ts-ignore
import io, { Socket } from "socket.io-client";
import { ChatMessage } from "../types/ChatTypes";

// Socket.IO 서버 URL 설정

class SocketIOService {
  private socket: Socket;
  private static instance: SocketIOService;

  private constructor() {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:9090";

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // polling 추가
      path: "/socket.io", // 기본 path 명시
      autoConnect: false,
    });
  }

  public static getInstance(): SocketIOService {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
      console.log("소켓IO가동");
    }
    return SocketIOService.instance;
  }

  public connect(): void {
    this.socket.connect();
    console.log("소켓연결");
  }

  public disconnect(): void {
    this.socket.disconnect();
    console.log("소켓연결끊겼음ㅇㅇㅇㅇㅇㅇㅇ");
  }

  public joinRoom(room: string): void {
    this.socket.emit("join_room", room);
    console.log("챗방들어옴");
  }

  public sendMessage(message: ChatMessage): void {
    this.socket.emit("send_message", message);
    console.log("메세지보냄");
  }

  public onReceiveMessage(callback: (message: ChatMessage) => void): void {
    this.socket.on("receive_message", callback);
    console.log("메세지받음");
  }

  public onConnect(callback: () => void): void {
    this.socket.on("connect", callback);
    console.log("연결됭ㅇㅇㅇㅇㅇㅇㅇ");
  }

  public onDisconnect(callback: () => void): void {
    this.socket.on("disconnect", callback);
    console.log("연결끊김ㅇㅇㅇㅇㅇㅇㅇ");
  }

  public removeAllListeners(): void {
    this.socket.removeAllListeners();
    console.log("다삭제됨ㅇㅇㅇㅇㅇㅇㅇ");
  }
  public isConnected(): boolean {
    return this.socket.connected;
  }
}

export default SocketIOService.getInstance();
