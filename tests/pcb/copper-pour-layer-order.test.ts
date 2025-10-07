import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "lib"

const board = {
  type: "pcb_board" as const,
  pcb_board_id: "board",
  center: { x: 0, y: 0 },
  width: 10,
  height: 10,
}

test("top copper pour renders above bottom copper pour", () => {
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

  const topIndex = svg.indexOf('data-layer="top"')
  const bottomIndex = svg.indexOf('data-layer="bottom"')

  expect(topIndex).toBeGreaterThan(-1)
  expect(bottomIndex).toBeGreaterThan(-1)
  expect(topIndex).toBeLessThan(bottomIndex)
})

test("copper features render from top layer to bottom layer", () => {
  const orderedLayers = [
    "top",
    "inner1",
    "inner2",
    "inner3",
    "inner4",
    "inner5",
    "inner6",
    "bottom",
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
