import type { CopperLayerName } from "./colors"

export const COPPER_LAYER_ORDER: readonly CopperLayerName[] = [
  "top",
  "inner1",
  "inner2",
  "inner3",
  "inner4",
  "inner5",
  "inner6",
  "bottom",
] as const

export function isCopperLayerName(
  layer: unknown,
): layer is CopperLayerName {
  return (
    typeof layer === "string" &&
    COPPER_LAYER_ORDER.includes(layer as CopperLayerName)
  )
}

export function normalizeCopperLayerName(
  layer: unknown,
): CopperLayerName | undefined {
  if (isCopperLayerName(layer)) {
    return layer
  }

  if (layer && typeof layer === "object" && "name" in layer) {
    const name = (layer as { name?: unknown }).name
    if (isCopperLayerName(name)) {
      return name
    }
  }

  return undefined
}

export function compareCopperLayers(
  a: CopperLayerName,
  b: CopperLayerName,
): number {
  const indexA = COPPER_LAYER_ORDER.indexOf(a)
  const indexB = COPPER_LAYER_ORDER.indexOf(b)

  if (indexA === -1 || indexB === -1) {
    return 0
  }

  return indexB - indexA
}
