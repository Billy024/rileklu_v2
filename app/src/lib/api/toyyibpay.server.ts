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

// billPayorInfo "1" PREFILLS AND LOCKS (readonly) the email/name/phone
// fields on ToyyibPay's hosted checkout with exactly what we send here —
// confirmed by inspecting the raw checkout HTML directly (billPayorInfo
// "0" discards whatever we send and leaves the fields blank/editable
// instead). So this must be the guest's real info collected on our own
// site beforehand, not a placeholder — createBill also rejects an empty
// billTo/billEmail/billPhone outright regardless of billPayorInfo.
export async function createToyyibPayBill(input: CreateBillInput): Promise<CreateBillResult> {
  const { TOYYIBPAY_SECRET_KEY } = bindings();
  if (!TOYYIBPAY_SECRET_KEY) return { ok: false, error: "toyyibpay_not_configured" };

  const body = new URLSearchParams({
    userSecretKey: TOYYIBPAY_SECRET_KEY,
    categoryCode: TOYYIBPAY_CATEGORY_CODE,
    billName: "RilekLU Booking",
    billDescription: `Stay ${input.orderId}`,
    billPriceSetting: "1", // fixed amount — guest can't edit it
    billPayorInfo: "1", // prefill + lock name/email/phone from what we send
    billAmount: String(Math.round(input.amountMyr * 100)), // sen
    billReturnUrl: input.returnUrl,
    billCallbackUrl: input.callbackUrl,
    billExternalReferenceNo: input.orderId,
    billPaymentChannel: "2", // FPX + card
    billTo: input.guestName,
    billEmail: input.guestEmail,
    billPhone: input.guestPhone,
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
  amountSen: number | null; // the REAL amount actually charged, not any quoted/intended amount
  transactionRef: string | null;
};

// Actively asks ToyyibPay whether a bill was actually paid (and for how
// much) — used as the return-page's own reconciliation check, since
// ToyyibPay does not retry a failed server-to-server callback on its own,
// and as the source of truth for the income ledger (records what was
// really charged, which can differ from the quoted amount during a test
// price override).
export async function getToyyibPayTransaction(billCode: string): Promise<ToyyibPayTransaction> {
  const empty: ToyyibPayTransaction = { status: "unknown", amountSen: null, transactionRef: null };
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
        billpaymentAmount?: string;
        billpaymentInvoiceNo?: string;
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
  const amountSen = record.billpaymentAmount
    ? Math.round(parseFloat(record.billpaymentAmount) * 100)
    : null;

  return { status, amountSen, transactionRef: record.billpaymentInvoiceNo ?? null };
}
