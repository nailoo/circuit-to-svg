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

const COPPER_LAYER_PRIORITY = new Map(
  COPPER_LAYER_ORDER.map((layer, index) => [
    layer,
    COPPER_LAYER_ORDER.length - index - 1,
  ] satisfies [CopperLayerName, number]),
)

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
  if (typeof layer === "string" && isCopperLayerName(layer)) {
    return layer
  }

  if (layer && typeof layer === "object" && "name" in layer) {
    const name = (layer as { name?: unknown }).name
    if (typeof name === "string" && isCopperLayerName(name)) {
      return name
    }
  }

  return undefined
}

export function compareCopperLayers(
  a: CopperLayerName,
  b: CopperLayerName,
): number {
  const priorityA = COPPER_LAYER_PRIORITY.get(a)
  const priorityB = COPPER_LAYER_PRIORITY.get(b)

  if (priorityA === undefined || priorityB === undefined) {
    return 0
  }

  return priorityA - priorityB
}
