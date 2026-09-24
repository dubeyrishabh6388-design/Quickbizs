import crypto from "crypto";

export interface IPaymentGateway {
  createOrder(orderId: string, amount: number, currency: string): Promise<{ gatewayOrderId: string; payload: any }>;
  verifySignature(payload: string, signature: string, secret: string): Promise<boolean>;
  initiateRefund(paymentId: string, amount: number): Promise<{ refundId: string; status: string }>;
}

export class RazorpayGateway implements IPaymentGateway {
  async createOrder(orderId: string, amount: number, currency: string): Promise<{ gatewayOrderId: string; payload: any }> {
    const gatewayOrderId = `rzp_order_${crypto.randomBytes(8).toString("hex")}`;
    return {
      gatewayOrderId,
      payload: {
        id: gatewayOrderId,
        entity: "order",
        amount: amount * 100, // paisa conversion
        currency,
        receipt: orderId,
        status: "created",
      },
    };
  }

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  }

  async initiateRefund(paymentId: string, amount: number): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `rfnd_${crypto.randomBytes(8).toString("hex")}`,
      status: "processed",
    };
  }
}

export class StripeGateway implements IPaymentGateway {
  async createOrder(orderId: string, amount: number, currency: string): Promise<{ gatewayOrderId: string; payload: any }> {
    const gatewayOrderId = `pi_${crypto.randomBytes(12).toString("hex")}`;
    return {
      gatewayOrderId,
      payload: {
        id: gatewayOrderId,
        amount: amount * 100,
        currency,
        metadata: { orderId },
      },
    };
  }

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    // Signature parsing check
    return signature !== "";
  }

  async initiateRefund(paymentId: string, amount: number): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `re_${crypto.randomBytes(12).toString("hex")}`,
      status: "succeeded",
    };
  }
}

export class PaymentGatewayFactory {
  static getGateway(gatewayName: string): IPaymentGateway {
    switch (gatewayName.toLowerCase()) {
      case "razorpay":
        return new RazorpayGateway();
      case "stripe":
        return new StripeGateway();
      default:
        return new RazorpayGateway();
    }
  }
}
