export const SITE_URL = "https://rileklu.higgsfield.app";

export const HOSTEX_PROPERTY_ID = 12469938;
export const HOSTEX_AIRBNB_LISTING_ID = "1077391045962444396";
// "Booking Site" custom channel (Query Custom Channels) — used to tag direct
// website reservations distinctly from Airbnb/Booking.com/etc.
export const HOSTEX_CUSTOM_CHANNEL_ID = 29;
// "Other" income method (Query Income Methods) — ToyyibPay isn't a listed
// method in Hostex; "Other" keeps it honest rather than mislabeling it.
export const HOSTEX_INCOME_METHOD_ID = 198;

export const TOYYIBPAY_BASE_URL = "https://toyyibpay.com"; // production
export const TOYYIBPAY_CATEGORY_CODE = "bv71exd1"; // "RilekLU Direct Bookings" (production category)

// Real amount every past booking has actually charged (confirmed from
// Hostex's reservation history) — used whenever Hostex's own listing price
// data doesn't carry a cleaning fee yet.
export const FALLBACK_CLEANING_FEE_MYR = 60;

// TEMPORARY, owner-requested: while testing the real production payment
// flow, every bill is charged RM1 regardless of the actual quote, so a real
// production charge can be verified end-to-end without paying full price.
// The site's displayed price and our own booking ledger still show the
// REAL computed total — only the amount ToyyibPay actually charges is
// overridden. This is live for every visitor right now, not just the
// owner's own test. MUST be set back to null before any real guest uses
// the site, or guests will be charged RM1 for a real reservation.
export const TESTING_FORCE_TOTAL_MYR: number | null = 1;
