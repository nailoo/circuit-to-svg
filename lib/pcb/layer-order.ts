import type { CopperLayerName } from "./colors"

export const COPPER_LAYER_ORDER: readonly CopperLayerName[] = [
  "bottom",
  "inner6",
  "inner5",
  "inner4",
  "inner3",
  "inner2",
  "inner1",
  "top",
] as const

const COPPER_LAYER_PRIORITY: Record<CopperLayerName, number> =
  COPPER_LAYER_ORDER.reduce(
    (acc, layer, index) => {
      acc[layer] = index
      return acc
    },
    {} as Record<CopperLayerName, number>,
  )

export function isCopperLayerName(
  layer: unknown,
): layer is CopperLayerName {
  if (typeof layer !== "string") return false

  return (COPPER_LAYER_ORDER as readonly string[]).includes(layer)
}

export function normalizeCopperLayerName(
  layer: unknown,
): CopperLayerName | undefined {
  if (typeof layer === "string") {
    return isCopperLayerName(layer) ? layer : undefined
  }

  if (layer && typeof layer === "object" && "name" in layer) {
    const name = (layer as { name?: unknown }).name
    return typeof name === "string" && isCopperLayerName(name)
      ? name
      : undefined
  }

  return undefined
}

export function compareCopperLayers(
  a: CopperLayerName,
  b: CopperLayerName,
): number {
  return COPPER_LAYER_PRIORITY[a] - COPPER_LAYER_PRIORITY[b]
}
