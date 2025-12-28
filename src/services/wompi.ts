import { env } from "@/lib/env";

const WOMPI_API_URL =
  env.wompiEnv === "sandbox"
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";

interface CreateTransactionParams {
  amountInCents: number;
  currency: "COP";
  customerEmail: string;
  reference: string;
  paymentMethod: {
    type: "CARD" | "NEQUI" | "PSE";
    token?: string;
    phoneNumber?: string;
    userType?: number;
    financialInstitutionCode?: string;
  };
}

interface WompiTransaction {
  id: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  reference: string;
  amountInCents: number;
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.wompiPrivateKey}`,
    },
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      customer_email: params.customerEmail,
      reference: params.reference,
      payment_method: params.paymentMethod,
    }),
  });

  if (!response.ok) {
    throw new Error(`Payment failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getTransaction(
  transactionId: string
): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${env.wompiPrivateKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get transaction: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}
