// app/exchange/utils.ts
export function copy(text: string) {
  if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  }
}
