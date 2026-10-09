/**
 * True in the single-page preview build (`npm run build:artifact`): there is
 * no server behind it, so feeds stay on demo data and server-only actions hide.
 */
export const IS_PREVIEW = import.meta.env.MODE === "artifact";
