import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

export interface GupshupSendMessagePayload {
  destination: string; // Customer phone number (with country code, e.g., 919876543210)
  source: string; // Gupshup source number (your WhatsApp business number)
  message: string;
  messageType?: string; // text, image, document, audio, video
  mediaUrl?: string;
  caption?: string;
}

export interface GupshupSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class GupshupService {
  private readonly logger = new Logger(GupshupService.name);
  private readonly apiUrl =
    process.env.GUPSHUP_API_URL || "https://api.gupshup.io/wa/api/v1/msg";
  private readonly apiKey = process.env.GUPSHUP_API_KEY || "";
  private readonly appName = process.env.GUPSHUP_APP_NAME || "";
  private readonly sourceNumber = process.env.GUPSHUP_SOURCE_NUMBER || "";

  /**
   * Send a WhatsApp message via Gupshup API
   */
  async sendMessage(
    payload: GupshupSendMessagePayload
  ): Promise<GupshupSendResponse> {
    try {
      const messagePayload = this.buildMessagePayload(payload);

      this.logger.log(
        `Sending WhatsApp message to ${payload.destination} via Gupshup`
      );

      // const response = await axios.post(this.apiUrl, messagePayload, {
      //   headers: {
      //     "Content-Type": "application/x-www-form-urlencoded",
      //     apikey: this.apiKey,
      //   },
      // });
      const response = {
        data: { id: "gp_123", status: "submitted", message: "Success" },
      };
      if (response.data && response.data.status === "submitted") {
        this.logger.log(
          `Message sent successfully. Gupshup ID: ${response.data.id}`
        );
        return {
          success: true,
          messageId: response.data.id,
        };
      }

      this.logger.warn(`Gupshup response: ${JSON.stringify(response.data)}`);
      return {
        success: false,
        error: response.data?.message || "Unknown error from Gupshup",
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to send WhatsApp message: ${error.message}`,
        error.stack
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(
    destination: string,
    message: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      destination,
      source: this.sourceNumber,
      message,
      messageType: "text",
    });
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    destination: string,
    imageUrl: string,
    caption?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      destination,
      source: this.sourceNumber,
      message: "",
      messageType: "image",
      mediaUrl: imageUrl,
      caption,
    });
  }

  /**
   * Send a document message
   */
  async sendDocumentMessage(
    destination: string,
    documentUrl: string,
    caption?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      destination,
      source: this.sourceNumber,
      message: "",
      messageType: "document",
      mediaUrl: documentUrl,
      caption,
    });
  }

  /**
   * Build form-urlencoded payload for Gupshup API
   */
  private buildMessagePayload(
    payload: GupshupSendMessagePayload
  ): URLSearchParams {
    const params = new URLSearchParams();
    params.append("channel", "whatsapp");
    params.append("source", payload.source || this.sourceNumber);
    params.append("destination", payload.destination);
    params.append("src.name", this.appName);

    if (
      payload.messageType === "image" ||
      payload.messageType === "document" ||
      payload.messageType === "audio" ||
      payload.messageType === "video"
    ) {
      // Media message
      const messageObj: any = {
        type: payload.messageType,
        url: payload.mediaUrl,
      };
      if (payload.caption) {
        messageObj.caption = payload.caption;
      }
      if (payload.messageType === "document") {
        messageObj.filename = payload.caption || "document";
      }
      params.append("message", JSON.stringify(messageObj));
      params.append("message.payload.type", payload.messageType);
    } else {
      // Text message
      params.append(
        "message",
        JSON.stringify({
          type: "text",
          text: payload.message,
        })
      );
    }

    return params;
  }

  /**
   * Parse incoming webhook payload from Gupshup
   */
  parseInboundWebhook(body: any): {
    senderPhone: string;
    message: string;
    messageType: string;
    mediaUrl?: string;
    gupshupMessageId: string;
    timestamp: string;
    appName: string;
  } | null {
    try {
      // Gupshup webhook payload structure
      const payload = body.payload || body;

      if (!payload) {
        this.logger.warn("Empty webhook payload received");
        return null;
      }

      const messagePayload = payload.payload || {};
      const sender = payload.sender || {};

      return {
        senderPhone: sender.phone || payload.source || "",
        message:
          messagePayload.text ||
          messagePayload.caption ||
          messagePayload.url ||
          "",
        messageType: messagePayload.type || "text",
        mediaUrl: messagePayload.url || undefined,
        gupshupMessageId: payload.id || messagePayload.id || "",
        timestamp: payload.timestamp || new Date().toISOString(),
        appName: body.app || "",
      };
    } catch (error) {
      this.logger.error(
        `Error parsing webhook payload: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Parse message status/event webhook from Gupshup
   */
  parseStatusWebhook(body: any): {
    gupshupMessageId: string;
    status: string;
    destination: string;
    errorCode?: string;
    errorMessage?: string;
  } | null {
    try {
      const payload = body.payload || body;

      if (!payload) {
        return null;
      }

      return {
        gupshupMessageId: payload.id || payload.gsId || "",
        status: payload.type || payload.status || "",
        destination: payload.destination || "",
        errorCode: payload.payload?.code?.toString(),
        errorMessage: payload.payload?.reason || "",
      };
    } catch (error) {
      this.logger.error(
        `Error parsing status webhook: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Get the configured source number
   */
  getSourceNumber(): string {
    return this.sourceNumber;
  }
}
