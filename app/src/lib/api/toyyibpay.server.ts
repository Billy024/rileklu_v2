import { bindings } from "../bindings.server";
import { TOYYIBPAY_BASE_URL, TOYYIBPAY_CATEGORY_CODE } from "../site-config";

export type CreateBillInput = {
  orderId: string;
  amountMyr: number; // whole MYR — converted to sen internally
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  returnUrl: string;
  callbackUrl: string;
};

export type CreateBillResult =
  { ok: true; billCode: string; paymentUrl: string } | { ok: false; error: string };

export async function createToyyibPayBill(input: CreateBillInput): Promise<CreateBillResult> {
  const { TOYYIBPAY_SECRET_KEY } = bindings();
  if (!TOYYIBPAY_SECRET_KEY) return { ok: false, error: "toyyibpay_not_configured" };

  const body = new URLSearchParams({
    userSecretKey: TOYYIBPAY_SECRET_KEY,
    categoryCode: TOYYIBPAY_CATEGORY_CODE,
    billName: "RilekLU Booking",
    billDescription: `Stay ${input.orderId}`,
    billPriceSetting: "1", // fixed amount — guest can't edit it
    billPayorInfo: "1",
    billAmount: String(Math.round(input.amountMyr * 100)), // sen
    billReturnUrl: input.returnUrl,
    billCallbackUrl: input.callbackUrl,
    billExternalReferenceNo: input.orderId,
    billTo: input.guestName,
    billEmail: input.guestEmail,
    billPhone: input.guestPhone,
    billPaymentChannel: "2", // FPX + card
  });

  const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createBill`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return { ok: false, error: `toyyibpay_create_bill_${res.status}` };

  const json = (await res.json()) as Array<{ BillCode?: string }> | { msg?: string };
  const billCode = Array.isArray(json) ? json[0]?.BillCode : undefined;
  if (!billCode) return { ok: false, error: "toyyibpay_create_bill_failed" };

  return { ok: true, billCode, paymentUrl: `${TOYYIBPAY_BASE_URL}/${billCode}` };
}

export type BillTransactionStatus = "success" | "pending" | "failed" | "unknown";

// Actively asks ToyyibPay whether a bill was actually paid — used as the
// return-page's own reconciliation check, since ToyyibPay does not retry a
// failed server-to-server callback on its own.
export async function getToyyibPayBillStatus(billCode: string): Promise<BillTransactionStatus> {
  const { TOYYIBPAY_SECRET_KEY } = bindings();
  if (!TOYYIBPAY_SECRET_KEY) return "unknown";

  const body = new URLSearchParams({ userSecretKey: TOYYIBPAY_SECRET_KEY, billCode });
  const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/getBillTransactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return "unknown";

  const json = (await res.json()) as Array<{ billpaymentStatus?: string }> | unknown;
  const status = Array.isArray(json) ? json[0]?.billpaymentStatus : undefined;
  if (status === "1") return "success";
  if (status === "3") return "failed";
  if (status === "2" || status === "4") return "pending";
  return "unknown";
}
