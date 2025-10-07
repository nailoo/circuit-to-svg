import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "lib"

const board = {
  type: "pcb_board" as const,
  pcb_board_id: "board",
  center: { x: 0, y: 0 },
  width: 10,
  height: 10,
}

test("bottom copper pour renders above top copper pour", () => {
  const svg = convertCircuitJsonToPcbSvg([
    board,
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: "pour_top",
      layer: "top",
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 6,
      height: 6,
    },
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: "pour_bottom",
      layer: "bottom",
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 6,
      height: 6,
    },
  ] as any)

  const bottomIndex = svg.indexOf('data-layer="bottom"')
  const topIndex = svg.indexOf('data-layer="top"')

  expect(topIndex).toBeGreaterThan(-1)
  expect(bottomIndex).toBeGreaterThan(-1)
  expect(bottomIndex).toBeLessThan(topIndex)
})

test("copper features render from bottom layer to top layer", () => {
  const orderedLayers = [
    "bottom",
    "inner6",
    "inner5",
    "inner4",
    "inner3",
    "inner2",
    "inner1",
    "top",
  ] as const

  const pours = orderedLayers
    .slice()
    .reverse()
    .map((layer, index) => ({
      type: "pcb_copper_pour" as const,
      pcb_copper_pour_id: `pour_${layer}_${index}`,
      layer,
      shape: "rect" as const,
      center: { x: 0, y: 0 },
      width: 6,
      height: 6,
    }))

  const svg = convertCircuitJsonToPcbSvg([board, ...pours] as any)

  const layerPositions = orderedLayers.map((layer) => ({
    layer,
    index: svg.indexOf(`data-layer="${layer}"`),
  }))

  for (const { index } of layerPositions) {
    expect(index).toBeGreaterThan(-1)
  }

  for (let i = 0; i < layerPositions.length - 1; i += 1) {
    expect(layerPositions[i]!.index).toBeLessThan(layerPositions[i + 1]!.index)
  }
})
