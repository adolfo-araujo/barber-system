/** Aceita apenas caminhos internos como destino após o login (evita open redirect). */
export function safeCallbackUrl(value: string | string[] | undefined): string {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}
