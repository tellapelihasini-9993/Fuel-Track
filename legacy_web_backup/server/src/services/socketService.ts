import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected via WebSocket: ${socket.id}`);

    // Join role room
    socket.on('join:role', (role: string) => {
      socket.join(`role:${role}`);
      console.log(`📡 Socket ${socket.id} joined role:${role}`);
    });

    // Join order room for tracking
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`📡 Socket ${socket.id} joined order:${orderId}`);
    });

    // Join tanker room for telemetry
    socket.on('join:tanker', (tankerId: string) => {
      socket.join(`tanker:${tankerId}`);
      console.log(`📡 Socket ${socket.id} joined tanker:${tankerId}`);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return ioInstance;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastOrderUpdate(order: any, eventName = 'order:updated'): void {
  if (!ioInstance) return;
  ioInstance.emit(eventName, order);
  ioInstance.to(`order:${order.id}`).emit(eventName, order);
  ioInstance.to('role:dispatcher').emit(eventName, order);
  ioInstance.to('role:admin').emit(eventName, order);
  ioInstance.to('role:station_owner').emit(eventName, order);
}

export function broadcastTankerUpdate(tanker: any, eventName = 'tanker:updated'): void {
  if (!ioInstance) return;
  ioInstance.emit(eventName, tanker);
  ioInstance.to(`tanker:${tanker.id}`).emit(eventName, tanker);
  ioInstance.to('role:dispatcher').emit(eventName, tanker);
  ioInstance.to('role:admin').emit(eventName, tanker);
}

export function broadcastGPSLocation(location: {
  tanker_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_deg: number;
  order_id?: string | null;
}): void {
  if (!ioInstance) return;
  ioInstance.emit('tanker:location', location);
  if (location.order_id) {
    ioInstance.to(`order:${location.order_id}`).emit('tanker:location', location);
  }
}

export function broadcastDispensingTick(data: {
  order_id: string;
  tanker_id: string;
  litres_dispensed: number;
  litres_requested: number;
  flow_rate_lpm: number;
  amount: number;
  temperature_c: number;
  calibration_pct: number;
}): void {
  if (!ioInstance) return;
  ioInstance.emit('dispensing:tick', data);
  ioInstance.to(`order:${data.order_id}`).emit('dispensing:tick', data);
  ioInstance.to('role:dispatcher').emit('dispensing:tick', data);
}

export function broadcastInventoryUpdate(tank: any): void {
  if (!ioInstance) return;
  ioInstance.emit('inventory:updated', tank);
  ioInstance.to('role:station_owner').emit('inventory:updated', tank);
  ioInstance.to('role:admin').emit('inventory:updated', tank);
}

export function broadcastSafetyAlert(alert: any): void {
  if (!ioInstance) return;
  ioInstance.emit('safety:alert', alert);
  ioInstance.to('role:dispatcher').emit('safety:alert', alert);
  ioInstance.to('role:admin').emit('role:admin', alert);
}
