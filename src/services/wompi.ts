import { env } from "@/lib/env";
import crypto from "crypto";

// Wompi API URLs
const WOMPI_SANDBOX_URL = "https://sandbox.wompi.co/v1";
const WOMPI_PRODUCTION_URL = "https://production.wompi.co/v1";

function getBaseUrl(): string {
  return env.wompiEnv === "production" ? WOMPI_PRODUCTION_URL : WOMPI_SANDBOX_URL;
}

// Types
export interface WompiTransaction {
  id: string;
  reference: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method_type?: string;
  created_at: string;
}

export interface CreateTransactionParams {
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

export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: WompiTransaction;
  };
  signature: {
    checksum: string;
    properties: string[];
  };
  timestamp: number;
  sent_at: string;
}

/**
 * Generate a unique reference for the transaction
 */
export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MC-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create integrity signature for Wompi checkout widget
 */
export function createIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = "COP"
): string {
  const integritySecret = env.wompiEventsSecret;
  const stringToSign = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash("sha256").update(stringToSign).digest("hex");
}

/**
 * Verify webhook signature from Wompi
 */
export function verifyWebhookSignature(event: WompiWebhookEvent): boolean {
  try {
    const { signature, data, timestamp } = event;
    const transaction = data.transaction;

    // Build the string to sign based on the properties
    const values = signature.properties.map((prop) => {
      const parts = prop.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = { transaction, timestamp };
      for (const part of parts) {
        value = value?.[part];
      }
      return String(value);
    });

    const stringToSign = values.join("") + env.wompiEventsSecret;
    const calculatedChecksum = crypto
      .createHash("sha256")
      .update(stringToSign)
      .digest("hex");

    return calculatedChecksum === signature.checksum;
  } catch {
    return false;
  }
}

/**
 * Create a transaction via API
 */
export async function createTransaction(
  params: CreateTransactionParams
): Promise<WompiTransaction> {
  const response = await fetch(`${getBaseUrl()}/transactions`, {
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
    const error = await response.text();
    throw new Error(`Payment failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<WompiTransaction> {
  const response = await fetch(`${getBaseUrl()}/transactions/${transactionId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.wompiPrivateKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get transaction: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get transaction by reference
 */
export async function getTransactionByReference(
  reference: string
): Promise<WompiTransaction | null> {
  const response = await fetch(
    `${getBaseUrl()}/transactions?reference=${encodeURIComponent(reference)}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.wompiPrivateKey}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

/**
 * Get acceptance token for the merchant (needed for widget)
 */
export async function getAcceptanceToken(): Promise<{
  acceptanceToken: string;
  permalink: string;
}> {
  const response = await fetch(`${getBaseUrl()}/merchants/${env.wompiPublicKey}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get merchant info");
  }

  const data = await response.json();
  return {
    acceptanceToken: data.data.presigned_acceptance.acceptance_token,
    permalink: data.data.presigned_acceptance.permalink,
  };
}

/**
 * Map Wompi status to our PaymentStatus enum
 */
export function mapWompiStatus(
  wompiStatus: WompiTransaction["status"]
): "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" {
  return wompiStatus;
}
