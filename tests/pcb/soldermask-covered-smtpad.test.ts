import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "lib"

test("solder mask renders for each SMT pad shape and stays below other copper", () => {
  const circuit: any = [
    {
      type: "pcb_board",
      pcb_board_id: "board0",
      center: { x: 0, y: 0 },
      width: 12,
      height: 8,
    },
    {
      type: "pcb_trace",
      pcb_trace_id: "trace0",
      route: [
        { route_type: "wire", x: -5, y: 0, width: 0.35, layer: "top" },
        { route_type: "wire", x: -0.8, y: 0, width: 0.35, layer: "top" },
        { route_type: "wire", x: 0, y: 0, width: 0.35, layer: "top" },
        { route_type: "wire", x: 3.2, y: 0.8, width: 0.35, layer: "top" },
      ],
    },
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "via_trace_end",
      shape: "circle",
      x: 3.2,
      y: 0.8,
      outer_diameter: 1.4,
      hole_diameter: 0.6,
      layers: ["top", "bottom"],
    },
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "via_mask_overlay",
      shape: "circle",
      x: 0,
      y: 0,
      outer_diameter: 1.6,
      hole_diameter: 0.7,
      layers: ["top", "bottom"],
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_rect",
      shape: "rect",
      layer: "top",
      x: -3.5,
      y: 1.8,
      width: 1.6,
      height: 1.1,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_rotated_rect",
      shape: "rotated_rect",
      layer: "top",
      x: 0,
      y: 0,
      width: 2,
      height: 1.1,
      rect_border_radius: 0.15,
      ccw_rotation: 30,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_pill",
      shape: "pill",
      layer: "top",
      x: 3.5,
      y: 1.8,
      width: 2.4,
      height: 1,
      radius: 0.5,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_circle",
      shape: "circle",
      layer: "top",
      x: -2.2,
      y: -1.8,
      radius: 0.75,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_polygon",
      shape: "polygon",
      layer: "top",
      points: [
        { x: 1.4, y: -2.7 },
        { x: 2.6, y: -3 },
        { x: 3.3, y: -2.3 },
        { x: 2.7, y: -1.2 },
        { x: 1.6, y: -1.4 },
      ],
      is_covered_with_solder_mask: true,
    },
  ]

  const svg = convertCircuitJsonToPcbSvg(circuit, {
    colorOverrides: {
      soldermask: { top: "rgb(18, 82, 50)" },
      copper: { top: "rgb(210, 58, 58)" },
    },
  })
  expect(svg).toMatchSvgSnapshot(import.meta.path)

  const maskCount = (svg.match(/pcb-solder-mask/g) ?? []).length
  expect(maskCount).toBe(5)

  const firstMaskIndex = svg.indexOf("pcb-solder-mask")
  const firstPlatedHoleIndex = svg.indexOf("pcb-hole-outer")
  expect(firstMaskIndex).toBeGreaterThanOrEqual(0)
  expect(firstPlatedHoleIndex).toBeGreaterThan(firstMaskIndex)
})
