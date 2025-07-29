export interface PaymentProvider {
  createInvoice(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<string>;

  verifyWebhookSignature(payload: any, signature: string): boolean;

  handleWebhook(payload: any): Promise<void>;
}
