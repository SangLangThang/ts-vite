import { DATA_BATTLE_SKILL, DATA_WARP } from './constant2'

export const SKILLS = DATA_BATTLE_SKILL.map((item) => ({
  value: `${item[0]}`,
  label: `${item[1]}`
}))

const graphData: { [key: number]: number[] } = {}
for (const [src, _, dest] of DATA_WARP) {
  if (!(src in graphData)) graphData[src] = []
  if (!(dest in graphData)) graphData[dest] = []
  graphData[src].push(dest)
}

export const graph = graphData
