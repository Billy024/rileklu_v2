export const SITE_URL = "https://rileklu.higgsfield.app";

export const HOSTEX_PROPERTY_ID = 12469938;
export const HOSTEX_AIRBNB_LISTING_ID = "1077391045962444396";
// "Booking Site" custom channel (Query Custom Channels) — used to tag direct
// website reservations distinctly from Airbnb/Booking.com/etc.
export const HOSTEX_CUSTOM_CHANNEL_ID = 29;
// "Other" income method (Query Income Methods) — ToyyibPay isn't a listed
// method in Hostex; "Other" keeps it honest rather than mislabeling it.
export const HOSTEX_INCOME_METHOD_ID = 198;

export const TOYYIBPAY_BASE_URL = "https://dev.toyyibpay.com"; // sandbox
export const TOYYIBPAY_CATEGORY_CODE = "x8faplr3"; // "RilekLU Direct Bookings"

// Real amount every past booking has actually charged (confirmed from
// Hostex's reservation history) — used whenever Hostex's own listing price
// data doesn't carry a cleaning fee yet.
export const FALLBACK_CLEANING_FEE_MYR = 60;
