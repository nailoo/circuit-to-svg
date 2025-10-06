import type { PCBTrace } from "circuit-json"
import { pairs } from "lib/utils/pairs"
import type { INode as SvgObject } from "svgson"
import { applyToPoint } from "transformation-matrix"
import { layerNameToColor } from "../layer-name-to-color"
import {
  compareCopperLayers,
  normalizeCopperLayerName,
} from "../layer-order"
import type { CopperLayerName } from "../colors"
import type { PcbContext } from "../convert-circuit-json-to-pcb-svg"

export function createSvgObjectsFromPcbTrace(
  trace: PCBTrace,
  ctx: PcbContext,
): SvgObject[] {
  const { transform, layer: layerFilter, colorMap, renderSolderMask } = ctx
  if (!trace.route || !Array.isArray(trace.route) || trace.route.length < 2)
    return []

  const segments = pairs(trace.route)
  const svgObjects: SvgObject[] = []

  for (const [start, end] of segments) {
    const startPoint = applyToPoint(transform, [start.x, start.y])
    const endPoint = applyToPoint(transform, [end.x, end.y])

    const possibleLayers: unknown[] = []
    if ("layer" in start) possibleLayers.push(start.layer)
    if ("layer" in end) possibleLayers.push(end.layer)
    if ("from_layer" in start) possibleLayers.push(start.from_layer)
    if ("from_layer" in end) possibleLayers.push(end.from_layer)
    if ("to_layer" in start) possibleLayers.push(start.to_layer)
    if ("to_layer" in end) possibleLayers.push(end.to_layer)

    let layer: CopperLayerName | undefined
    for (const candidate of possibleLayers) {
      const normalized = normalizeCopperLayerName(candidate)
      if (normalized) {
        layer = normalized
        break
      }
    }

    if (!layer) continue
    if (layerFilter && layer !== layerFilter) continue

    const copperColor = layerNameToColor(layer, colorMap)
    const maskColor =
      colorMap.soldermask[layer as keyof typeof colorMap.soldermask] ??
      copperColor

    const traceWidth =
      "width" in start ? start.width : "width" in end ? end.width : null

    const width = traceWidth
      ? (traceWidth * Math.abs(transform.a)).toString()
      : "0.3"

    if (renderSolderMask) {
      const copperObject: SvgObject = {
        name: "path",
        type: "element",
        value: "",
        children: [],
        attributes: {
          class: "pcb-trace",
          stroke: copperColor,
          fill: "none",
          d: `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
          "stroke-width": width,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "shape-rendering": "crispEdges",
          "data-layer": layer,
        },
      }

      const maskObject: SvgObject = {
        name: "path",
        type: "element",
        value: "",
        children: [],
        attributes: {
          class: "pcb-soldermask",
          stroke: maskColor,
          fill: "none",
          d: `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
          "stroke-width": width,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "shape-rendering": "crispEdges",
          "data-layer": layer,
        },
      }

      svgObjects.push(maskObject, copperObject)
    } else {
      const maskOnlyObject: SvgObject = {
        name: "path",
        type: "element",
        value: "",
        children: [],
        attributes: {
          class: "pcb-trace",
          stroke: maskColor,
          fill: "none",
          d: `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
          "stroke-width": width,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "shape-rendering": "crispEdges",
          "data-layer": layer,
        },
      }

      svgObjects.push(maskOnlyObject)
    }
  }

  svgObjects.sort((a, b) => {
    const layerA = normalizeCopperLayerName(a.attributes["data-layer"])
    const layerB = normalizeCopperLayerName(b.attributes["data-layer"])

    if (layerA && layerB && layerA !== layerB) {
      return compareCopperLayers(layerA, layerB)
    }
    return 0
  })

  return svgObjects
}
