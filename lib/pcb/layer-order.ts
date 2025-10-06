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

const CANONICAL_LAYER_LOOKUP = COPPER_LAYER_ORDER.reduce(
  (acc, layer) => {
    acc.set(layer, layer)
    acc.set(layer.toLowerCase(), layer)
    return acc
  },
  new Map<string, CopperLayerName>(),
)

const INNER_LAYER_REGEX = /^inner\s*0*(\d+)$/

function canonicalizeLayerName(
  value: string,
): CopperLayerName | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const lower = trimmed.toLowerCase()

  const directMatch = CANONICAL_LAYER_LOOKUP.get(lower)
  if (directMatch) return directMatch

  const compact = lower.replace(/[^a-z0-9]/g, "")
  if (!compact) return undefined

  const canonicalFromCompact = CANONICAL_LAYER_LOOKUP.get(compact)
  if (canonicalFromCompact) return canonicalFromCompact

  const innerMatch = compact.match(INNER_LAYER_REGEX)
  if (!innerMatch) return undefined

  const innerIndex = Number(innerMatch[1])
  if (!Number.isFinite(innerIndex) || innerIndex <= 0) return undefined

  const canonical = `inner${innerIndex}` as CopperLayerName
  return CANONICAL_LAYER_LOOKUP.get(canonical)
}

export function isCopperLayerName(
  layer: unknown,
): layer is CopperLayerName {
  if (typeof layer !== "string") return false

  return Boolean(canonicalizeLayerName(layer))
}

export function normalizeCopperLayerName(
  layer: unknown,
): CopperLayerName | undefined {
  if (typeof layer === "string") {
    return canonicalizeLayerName(layer)
  }

  if (layer && typeof layer === "object" && "name" in layer) {
    const name = (layer as { name?: unknown }).name
    if (typeof name === "string") {
      return canonicalizeLayerName(name)
    }
  }

  return undefined
}

export function compareCopperLayers(
  a: CopperLayerName,
  b: CopperLayerName,
): number {
  return COPPER_LAYER_PRIORITY[a] - COPPER_LAYER_PRIORITY[b]
}
