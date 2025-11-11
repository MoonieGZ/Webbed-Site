/**
 * Client-side cookie utility functions
 */

export function setCookie(name: string, value: string, days: number = 1) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  // URL-encode the value to handle special characters (;, =, spaces, etc.)
  const encodedValue = encodeURIComponent(value)
  document.cookie = `${name}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const cookieValue = c.substring(nameEQ.length, c.length)
      try {
        // URL-decode the value to restore original characters
        return decodeURIComponent(cookieValue)
      } catch (e) {
        // If decoding fails (e.g., cookie was set before encoding was added),
        // return the raw value as fallback
        return cookieValue
      }
    }
  }
  return null
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
