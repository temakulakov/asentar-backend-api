export class CreatePaymentDto {
  userId: string;
  amount: number;
  currency?: string;
  // дополнительные поля, например planId, duration и т.п.
}
