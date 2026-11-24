import "server-only";

export function getCheckoutPauseMessage() {
  return process.env.CHECKOUT_PAUSED === "true" ? "Online payments are temporarily paused." : null;
}
