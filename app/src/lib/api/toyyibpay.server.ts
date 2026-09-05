import { bindings } from "../bindings.server";
import { TOYYIBPAY_BASE_URL, TOYYIBPAY_CATEGORY_CODE } from "../site-config";

export type CreateBillInput = {
  orderId: string;
  amountMyr: number; // whole MYR — converted to sen internally
  returnUrl: string;
  callbackUrl: string;
};

export type CreateBillResult =
  { ok: true; billCode: string; paymentUrl: string } | { ok: false; error: string };

// No guest name/email/phone here on purpose: ToyyibPay's hosted checkout
// does not actually prefill from billTo/billEmail/billPhone (confirmed
// live), so there's nothing to gain from collecting that info on our own
// site first. billPayorInfo "1" makes ToyyibPay itself require and collect
// it, and getToyyibPayTransaction reads back whatever the guest actually
// entered there afterwards.
export async function createToyyibPayBill(input: CreateBillInput): Promise<CreateBillResult> {
  const { TOYYIBPAY_SECRET_KEY } = bindings();
  if (!TOYYIBPAY_SECRET_KEY) return { ok: false, error: "toyyibpay_not_configured" };

  const body = new URLSearchParams({
    userSecretKey: TOYYIBPAY_SECRET_KEY,
    categoryCode: TOYYIBPAY_CATEGORY_CODE,
    billName: "RilekLU Booking",
    billDescription: `Stay ${input.orderId}`,
    billPriceSetting: "1", // fixed amount — guest can't edit it
    billPayorInfo: "1", // require name/email/phone — ToyyibPay is the only place collecting it
    billAmount: String(Math.round(input.amountMyr * 100)), // sen
    billReturnUrl: input.returnUrl,
    billCallbackUrl: input.callbackUrl,
    billExternalReferenceNo: input.orderId,
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

export type ToyyibPayTransaction = {
  status: BillTransactionStatus;
  payerName: string | null;
  payerEmail: string | null;
  payerPhone: string | null;
};

// Actively asks ToyyibPay whether a bill was actually paid, AND reads back
// the name/email/phone the guest typed into ToyyibPay's own checkout form —
// this is the guest's real contact info, since we no longer collect it on
// our own site (see createToyyibPayBill). Used both by the return page's
// reconciliation and, indirectly, by whichever confirmation path calls
// finalizeBooking, since that's what actually needs this info for the
// Hostex reservation.
export async function getToyyibPayTransaction(billCode: string): Promise<ToyyibPayTransaction> {
  const empty: ToyyibPayTransaction = {
    status: "unknown",
    payerName: null,
    payerEmail: null,
    payerPhone: null,
  };
  const { TOYYIBPAY_SECRET_KEY } = bindings();
  if (!TOYYIBPAY_SECRET_KEY) return empty;

  const body = new URLSearchParams({ userSecretKey: TOYYIBPAY_SECRET_KEY, billCode });
  const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/getBillTransactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return empty;

  const json = (await res.json()) as
    | Array<{
        billpaymentStatus?: string;
        billTo?: string;
        billEmail?: string;
        billPhone?: string;
      }>
    | unknown;
  const record = Array.isArray(json) ? json[0] : undefined;
  if (!record) return empty;

  const statusCode = record.billpaymentStatus;
  const status: BillTransactionStatus =
    statusCode === "1"
      ? "success"
      : statusCode === "3"
        ? "failed"
        : statusCode
          ? "pending"
          : "unknown";

  return {
    status,
    payerName: record.billTo?.trim() || null,
    payerEmail: record.billEmail?.trim() || null,
    payerPhone: record.billPhone?.trim() || null,
  };
}
