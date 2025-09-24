import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "lib"

test("soldermask layering keeps pads exposed while covering flagged traces", () => {
  const circuit: any[] = [
    {
      type: "pcb_board",
      pcb_board_id: "board0",
      center: { x: 0, y: 0 },
      width: 14,
      height: 10,
    },
    {
      type: "pcb_trace",
      pcb_trace_id: "trace_exposed",
      route: [
        { route_type: "wire", x: -4, y: -1.5, width: 0.4, layer: "top" },
        { route_type: "wire", x: -0.5, y: -1.5, width: 0.4, layer: "top" },
      ],
    },
    {
      type: "pcb_trace",
      pcb_trace_id: "trace_masked",
      is_covered_with_solder_mask: true,
      route: [
        { route_type: "wire", x: 0.5, y: -1.5, width: 0.4, layer: "top" },
        { route_type: "wire", x: 4, y: -1.5, width: 0.4, layer: "top" },
      ],
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_exposed",
      shape: "rect",
      layer: "top",
      x: -2,
      y: 2,
      width: 1.4,
      height: 1.4,
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_masked",
      shape: "rect",
      layer: "top",
      x: 2,
      y: 2,
      width: 1.4,
      height: 1.4,
      is_covered_with_solder_mask: true,
    },
  ]

  const svg = convertCircuitJsonToPcbSvg(circuit, {
    colorOverrides: {
      copper: { top: "#ff0000" },
      soldermask: { top: "#008000" },
    },
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
