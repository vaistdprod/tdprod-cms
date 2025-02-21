import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and merges Tailwind classes using tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a value to a CSS unit string if it's a number
 */
export function toCSSUnit(value: string | number | undefined, unit = 'px'): string | undefined {
  if (typeof value === 'undefined') return undefined
  return typeof value === 'number' ? `${value}${unit}` : value
}

/**
 * Creates a unique ID with an optional prefix
 */
export function createId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Checks if a value is a valid CSS color (hex, rgb, rgba, hsl, hsla)
 */
export function isValidColor(color: string): boolean {
  const s = new Option().style
  s.color = color
  return s.color !== ''
}

/**
 * Converts a hex color to RGB values
 */
export function hexToRGB(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Converts RGB values to a hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Adjusts the brightness of a hex color
 * @param hex - Hex color code
 * @param percent - Percentage to adjust (-100 to 100)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRGB(hex)
  if (!rgb) return hex

  const { r, g, b } = rgb
  const amount = Math.round(2.55 * percent)
  
  const newR = Math.max(0, Math.min(255, r + amount))
  const newG = Math.max(0, Math.min(255, g + amount))
  const newB = Math.max(0, Math.min(255, b + amount))

  return rgbToHex(newR, newG, newB)
}

/**
 * Checks if a color is light or dark
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRGB(hex)
  if (!rgb) return true

  const { r, g, b } = rgb
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

/**
 * Gets a contrasting color (black or white) based on the input color
 */
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? '#000000' : '#ffffff'
}

/**
 * Validates a version string (semver)
 */
export function isValidVersion(version: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  return semverRegex.test(version)
}

/**
 * Compares two version strings
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split('.').map(Number)
  const v2Parts = v2.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1
    if (v1Parts[i] < v2Parts[i]) return -1
  }

  return 0
}
