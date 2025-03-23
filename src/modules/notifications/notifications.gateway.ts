import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Initialize the gateway
  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  // Handle new connections
  handleConnection(client: Socket) {
    console.log('New client connected:', client.id);
    this.notify('in-app-notifications', 'Hello world');
  }

  // Handle disconnections
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Broadcasting a notification to all connected clients
  sendNotification(channel: string, message: any) {
    this.server.emit(channel, { message });
  }

  // Example method to trigger notification (can be called from a service or controller)
  notify(channel: string, message?: any) {
    this.sendNotification(channel, message ?? 'New in-app notification!');
  }
}
