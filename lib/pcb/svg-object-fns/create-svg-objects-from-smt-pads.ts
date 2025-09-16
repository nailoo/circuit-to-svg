import type { PcbSmtPad } from "circuit-json"
import { applyToPoint } from "transformation-matrix"
import { layerNameToColor } from "../layer-name-to-color"
import type { PcbContext } from "../convert-circuit-json-to-pcb-svg"

export function createSvgObjectsFromSmtPad(
  pad: PcbSmtPad,
  ctx: PcbContext,
): any {
  const { transform, layer: layerFilter, colorMap } = ctx

  if (layerFilter && pad.layer !== layerFilter) return []

  const isCoveredWithSolderMask = Boolean(
    (pad as any)?.is_covered_with_solder_mask,
  )

  const solderMaskColor =
    colorMap.soldermask[
      pad.layer as keyof typeof colorMap.soldermask
    ] ?? colorMap.soldermask.top

  if (pad.shape === "rect" || pad.shape === "rotated_rect") {
    const width = pad.width * Math.abs(transform.a)
    const height = pad.height * Math.abs(transform.d)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])
    const scaledBorderRadius =
      ((pad as any).rect_border_radius ?? 0) * Math.abs(transform.a)

    if (pad.shape === "rotated_rect" && pad.ccw_rotation) {
      const elements = [
        {
          name: "rect",
          type: "element",
          attributes: {
            class: "pcb-pad",
            fill: layerNameToColor(pad.layer, colorMap),
            x: (-width / 2).toString(),
            y: (-height / 2).toString(),
            width: width.toString(),
            height: height.toString(),
            transform: `translate(${x} ${y}) rotate(${-pad.ccw_rotation})`,
            "data-layer": pad.layer,
            ...(scaledBorderRadius
              ? {
                  rx: scaledBorderRadius.toString(),
                  ry: scaledBorderRadius.toString(),
                }
              : {}),
          },
        },
      ]

      if (isCoveredWithSolderMask) {
        const padAttributes = elements[0].attributes as Record<string, string>

        elements.push({
          name: "rect",
          type: "element",
          attributes: {
            class: "pcb-solder-mask",
            fill: solderMaskColor,
            x: padAttributes.x,
            y: padAttributes.y,
            width: padAttributes.width,
            height: padAttributes.height,
            "data-layer": pad.layer,
            ...(padAttributes.transform
              ? { transform: padAttributes.transform }
              : {}),
            ...(padAttributes.rx ? { rx: padAttributes.rx } : {}),
            ...(padAttributes.ry ? { ry: padAttributes.ry } : {}),
          },
        })
      }

      return elements
    }

    const elements = [
      {
        name: "rect",
        type: "element",
        attributes: {
          class: "pcb-pad",
          fill: layerNameToColor(pad.layer, colorMap),
          x: (x - width / 2).toString(),
          y: (y - height / 2).toString(),
          width: width.toString(),
          height: height.toString(),
          "data-layer": pad.layer,
          ...(scaledBorderRadius
            ? {
                rx: scaledBorderRadius.toString(),
                ry: scaledBorderRadius.toString(),
              }
            : {}),
        },
      },
    ]

    if (isCoveredWithSolderMask) {
      const padAttributes = elements[0].attributes as Record<string, string>

      elements.push({
        name: "rect",
        type: "element",
        attributes: {
          class: "pcb-solder-mask",
          fill: solderMaskColor,
          x: padAttributes.x,
          y: padAttributes.y,
          width: padAttributes.width,
          height: padAttributes.height,
          "data-layer": pad.layer,
          ...(padAttributes.rx ? { rx: padAttributes.rx } : {}),
          ...(padAttributes.ry ? { ry: padAttributes.ry } : {}),
        },
      })
    }

    return elements
  }

  if (pad.shape === "pill") {
    const width = pad.width * Math.abs(transform.a)
    const height = pad.height * Math.abs(transform.d)
    const radius = pad.radius * Math.abs(transform.a)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    const elements = [
      {
        name: "rect",
        type: "element",
        attributes: {
          class: "pcb-pad",
          fill: layerNameToColor(pad.layer, colorMap),
          x: (x - width / 2).toString(),
          y: (y - height / 2).toString(),
          width: width.toString(),
          height: height.toString(),
          rx: radius.toString(),
          ry: radius.toString(),
          "data-layer": pad.layer,
        },
      },
    ]

    if (isCoveredWithSolderMask) {
      const padAttributes = elements[0].attributes as Record<string, string>

      elements.push({
        name: "rect",
        type: "element",
        attributes: {
          class: "pcb-solder-mask",
          fill: solderMaskColor,
          x: padAttributes.x,
          y: padAttributes.y,
          width: padAttributes.width,
          height: padAttributes.height,
          rx: padAttributes.rx,
          ry: padAttributes.ry,
          "data-layer": pad.layer,
        },
      })
    }

    return elements
  }
  if (pad.shape === "circle") {
    const radius = pad.radius * Math.abs(transform.a)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    const elements = [
      {
        name: "circle",
        type: "element",
        attributes: {
          class: "pcb-pad",
          fill: layerNameToColor(pad.layer, colorMap),
          cx: x.toString(),
          cy: y.toString(),
          r: radius.toString(),
          "data-layer": pad.layer,
        },
      },
    ]

    if (isCoveredWithSolderMask) {
      const padAttributes = elements[0].attributes as Record<string, string>

      elements.push({
        name: "circle",
        type: "element",
        attributes: {
          class: "pcb-solder-mask",
          fill: solderMaskColor,
          cx: padAttributes.cx,
          cy: padAttributes.cy,
          r: padAttributes.r,
          "data-layer": pad.layer,
        },
      })
    }

    return elements
  }

  if (pad.shape === "polygon") {
    const points = (pad.points ?? []).map((point) =>
      applyToPoint(transform, [point.x, point.y]),
    )

    const elements = [
      {
        name: "polygon",
        type: "element",
        attributes: {
          class: "pcb-pad",
          fill: layerNameToColor(pad.layer, colorMap),
          points: points.map((p) => p.join(",")).join(" "),
          "data-layer": pad.layer,
        },
      },
    ]

    if (isCoveredWithSolderMask) {
      const padAttributes = elements[0].attributes as Record<string, string>

      elements.push({
        name: "polygon",
        type: "element",
        attributes: {
          class: "pcb-solder-mask",
          fill: solderMaskColor,
          points: padAttributes.points,
          "data-layer": pad.layer,
        },
      })
    }

    return elements
  }

  // TODO: Implement SMT pad circles/ovals etc.
  return []
}
