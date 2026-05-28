import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  namespace: "/chat",
  transports: ["websocket", "polling"],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map of agentId -> Set of socket IDs (to handle multiple tabs)
  private agentSockets: Map<string, Set<string>> = new Map();

  afterInit(server: Server) {
    this.logger.log("Chat WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    console.log(`ChatGateway: Client ${client.id} connected to /chat`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up socket from our tracking map
    for (const [agentId, sockets] of this.agentSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.agentSockets.delete(agentId);
        }
        break;
      }
    }
  }

  /**
   * Agent registers themselves
   */
  @SubscribeMessage("register_agent")
  handleRegisterAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agent_id: any }
  ) {
    // Handle both direct ID or object with agent_id
    const agentIdRaw = typeof data === "object" ? data.agent_id : data;
    const agentId = agentIdRaw ? String(agentIdRaw) : null;

    if (!agentId || agentId === "undefined" || agentId === "null") {
      client.emit("error", { message: "valid agent_id is required" });
      return;
    }

    // 1. Add to our internal tracking map
    if (!this.agentSockets.has(agentId)) {
      this.agentSockets.set(agentId, new Set());
    }
    this.agentSockets.get(agentId).add(client.id);

    // 2. Join the Socket.IO room
    const agentRoom = `agent_${agentId}`;
    client.join(agentRoom);

    console.log(
      `ChatGateway: Agent ${agentId} registered socket ${client.id} in room ${agentRoom}`
    );
    this.logger.log(`Agent ${agentId} registered in room ${agentRoom}`);

    client.emit("registered", {
      message: `Success! You are now listening for messages sent to agent ${agentId}`,
      agent_id: agentId,
      socket_id: client.id,
      room: agentRoom,
      tip: "Ensure this ID matches the User ID from your Login token",
    });
  }

  /**
   * Unregister agent - leaves the agent room and removes from tracking
   */
  @SubscribeMessage("unregister_agent")
  handleUnregisterAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agent_id: any }
  ) {
    const agentIdRaw = typeof data === "object" ? data.agent_id : data;
    const agentId = agentIdRaw ? String(agentIdRaw) : null;

    if (agentId) {
      const agentRoom = `agent_${agentId}`;
      client.leave(agentRoom);

      const sockets = this.agentSockets.get(agentId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.agentSockets.delete(agentId);
        }
      }

      this.logger.log(`Agent ${agentId} unregistered socket ${client.id}`);
      client.emit("unregistered", { agent_id: agentId, room: agentRoom });
    }
  }

  /**
   * Leave all rooms except the default socket ID room
   */
  @SubscribeMessage("leave_all_rooms")
  handleLeaveAllRooms(@ConnectedSocket() client: Socket) {
    const rooms = Array.from(client.rooms);
    rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
      }
    });
    this.logger.log(`Socket ${client.id} left all rooms`);
    client.emit("left_all_rooms", { message: "Successfully left all rooms" });
  }

  /**
   * DEBUG ONLY: Disconnect all sockets in this namespace
   */
  @SubscribeMessage("disconnect_all_debug")
  handleDisconnectAll() {
    this.logger.warn("DEBUG: Disconnecting all sockets in /chat namespace");
    if (this.server) {
      this.server.disconnectSockets();
    }
    this.agentSockets.clear();
  }

  /**
   * Check which rooms the current socket is in
   */
  @SubscribeMessage("check_rooms")
  handleCheckRooms(@ConnectedSocket() client: Socket) {
    const rooms = Array.from(client.rooms);
    console.log(`ChatGateway: Socket ${client.id} belongs to rooms:`, rooms);
    client.emit("rooms_list", {
      socket_id: client.id,
      your_rooms: rooms,
    });
  }

  /**
   * Emission Method called by ChatService
   */
  emitNewMessage(agentId: any, messageData: any) {
    if (!this.server) {
      this.logger.error("WebSocket server not initialized!");
      return;
    }

    const strAgentId = String(agentId);
    const agentRoom = `agent_${strAgentId}`;

    console.log(
      `ChatGateway: Preparing to emit message to agent ${strAgentId}`
    );

    // Method 1: Emit to Room (standard way)
    this.server.to(agentRoom).emit("new_message", messageData);

    // Method 2: Direct emission to individual Socket IDs (Reliable Fallback)
    const sockets = this.agentSockets.get(strAgentId);
    // if (sockets && sockets.size > 0) {
    //   console.log(
    //     `ChatGateway: Found ${sockets.size} active socket(s) for agent ${strAgentId}. Emitting directly.`
    //   );
    //   sockets.forEach((socketId) => {
    //     this.server.to(socketId).emit("new_message", messageData);
    //   });
    // } else {
    //   console.log(
    //     `ChatGateway: No active sockets found in tracking map for agent ${strAgentId}`
    //   );
    // }

    // DEBUG BROADCAST: So you can see the data in Postman regardless of rooms
    // this.server.emit("debug_all_messages", {
    //   info: "If you see this but NOT new_message, your registered agent_id is wrong",
    //   target_agent_id: strAgentId,
    //   target_room: agentRoom,
    //   tracked_sockets_count: sockets ? sockets.size : 0,
    //   messageData,
    // });
  }

  /**
   * Broadcast Test event
   */
  @SubscribeMessage("broadcast_test")
  handleBroadcastTest(@ConnectedSocket() client: Socket) {
    console.log(`ChatGateway: Received broadcast_test from ${client.id}`);
    this.server.emit("new_message", {
      id: 999,
      message: "Broadcast test successful!",
      direction: "outbound",
      created_at: new Date(),
    });
  }

  /**
   * Ping/Pong Test
   */
  @SubscribeMessage("ping_test")
  handlePingTest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.emit("pong_test", {
      message: "Pong! Server is listening.",
      data: data,
    });
  }

  emitInboundMessage(messageData: any) {
    this.server.emit("inbound_message", messageData);
  }

  emitMessageStatusUpdate(agentId: number, statusData: any) {
    const agentRoom = `agent_${String(agentId)}`;
    this.server.to(agentRoom).emit("message_status_update", statusData);

    // Direct emission fallback
    const sockets = this.agentSockets.get(String(agentId));
    if (sockets) {
      sockets.forEach((sid) =>
        this.server.to(sid).emit("message_status_update", statusData)
      );
    }
  }

  getOnlineAgentsCount(): number {
    return this.agentSockets.size;
  }

  isAgentOnline(agentId: number): boolean {
    return this.agentSockets.has(String(agentId));
  }
}
