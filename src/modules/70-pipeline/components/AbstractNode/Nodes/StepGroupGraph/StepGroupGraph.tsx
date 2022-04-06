/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { DiagramType, Event } from '@pipeline/components/Diagram'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import type { GetNodeMethod, NodeDetails, NodeIds, PipelineGraphState, SVGPathRecord } from '../../types'
import { NodeType } from '../../types'
import css from './StepGroupGraph.module.scss'
interface StepGroupGraphProps {
  id?: string
  data?: any[]
  getNode: GetNodeMethod
  getDefaultNode(): NodeDetails | null
  selectedNodeId?: string
  uniqueNodeIds?: NodeIds
  fireEvent: (event: any) => void
  startEndNodeNeeded?: boolean
  updateSVGLinks?: (svgPath: string[]) => void
  prevNodeIdentifier?: string
  identifier?: string
  isNodeCollapsed: boolean
  updateGraphLinks: () => void
  readonly?: boolean
  hideLinks?: boolean
  hideAdd?: boolean
}

interface LayoutStyles {
  height: string
  width: string
  marginLeft?: string
}

const getNestedStepGroupHeight = (steps?: any[]): number => {
  let maxParalellNodesCount = 0
  steps?.forEach(step => {
    if (step?.parallel) {
      maxParalellNodesCount = Math.max(maxParalellNodesCount, step.parallel.length)
    }
  })
  return maxParalellNodesCount
}

const getCalculatedStyles = (data: PipelineGraphState[]): LayoutStyles => {
  let width = 0
  let maxChildLength = 0
  data.forEach(node => {
    const childSteps = get(node, 'data.step.data.stepGroup.steps')
    if (childSteps) {
      const count = getNestedStepGroupHeight(childSteps)
      maxChildLength = Math.max(maxChildLength, count)
      width += childSteps.length * 170
    }
    if (node.children?.length && data.length > 1) {
      width += 40
    }
    width += 150
    maxChildLength = Math.max(maxChildLength, node?.children?.length || 0)
  })
  return { height: `${(maxChildLength + 1) * 100}px`, width: `${width - 80}px` } // 80 is link gap that we dont need for last stepgroup node
}

function StepGroupGraph(props: StepGroupGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 'auto', width: 'auto' })
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    if (props?.data?.length) {
      setState(getPipelineGraphData(props.data))
    }
  }, [treeRectangle, props.data])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      setLayoutStyles(getCalculatedStyles(state))
    }
  }, [state, props?.isNodeCollapsed])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      props?.updateGraphLinks?.()
    }
  }, [layoutStyles])

  const setSVGLinks = (): void => {
    if (props.hideLinks) {
      return
    }
    const SVGLinks = getSVGLinksFromPipeline(state)
    const firstNodeIdentifier = state?.[0]?.id
    const lastNodeIdentifier = state?.[state?.length - 1]?.id
    const parentElement = graphRef.current?.querySelector('#tree-container') as HTMLDivElement
    const finalPaths = [
      ...SVGLinks,
      getFinalSVGArrowPath(props?.id, firstNodeIdentifier as string, {
        direction: 'ltl',
        parentElement
      }),
      getFinalSVGArrowPath(lastNodeIdentifier as string, props?.id, {
        direction: 'rtr',
        parentElement
      })
    ]
    return setSvgPath(finalPaths)
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  return (
    <div className={css.main} style={layoutStyles} ref={graphRef}>
      <SVGComponent svgPath={svgPath} className={cx(css.stepGroupSvg)} />
      {props?.data?.length ? (
        <>
          <PipelineGraphRecursive
            getDefaultNode={props?.getDefaultNode}
            parentIdentifier={props?.identifier}
            fireEvent={props.fireEvent}
            getNode={props.getNode}
            nodes={state}
            selectedNode={defaultTo(props?.selectedNodeId, '')}
            startEndNodeNeeded={false}
            readonly={props.readonly}
            optimizeRender={false}
          />
        </>
      ) : (
        !props.hideAdd &&
        CreateNode &&
        !props.readonly && (
          <CreateNode
            {...props}
            isInsideStepGroup={true}
            onClick={(event: any) => {
              props?.fireEvent?.({
                type: Event.ClickNode,
                target: event.target,
                data: {
                  identifier: props?.identifier,
                  parentIdentifier: props?.identifier,
                  entityType: DiagramType.CreateNew,
                  node: props
                }
              })
            }}
            name={null}
          />
        )
      )}
    </div>
  )
}

export default StepGroupGraph
