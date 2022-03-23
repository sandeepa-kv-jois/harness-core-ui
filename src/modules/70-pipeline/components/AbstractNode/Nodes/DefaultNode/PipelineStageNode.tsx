/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { IconName } from '@wings-software/uicore'
import { Icon, Text, Color, Button, ButtonVariation } from '@wings-software/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import SVGMarker from '../SVGMarker'
import { NodeType } from '../../Node'
// import CreateNode from '../CreateNode/CreateNodeStage'
import css from './DefaultNode.module.scss'

const CODE_ICON: IconName = 'command-echo'

function PipelineStageNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component

  const stageStatus = props?.status || (props?.data?.step?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stageStatus,
    ExecutionPipelineNodeType.NORMAL
  )

  return (
    <div
      className={cx(css.defaultNode, 'default-node', {
        draggable: !props.readonly
      })}
      onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
      onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent({
          type: Event.ClickNode,
          data: {
            entityType: DiagramType.Default,
            ...props
          }
        })
      }}
      onMouseDown={e => e.stopPropagation()}
      onDragOver={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent({
          type: Event.DropNodeEvent,
          data: {
            entityType: DiagramType.Default,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
    >
      <div className={cx(css.markerStart, css.stageMarker)}>
        <SVGMarker />
      </div>
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={!props.readonly}
        className={cx(css.defaultCard, {
          [css.selected]: props?.isSelected,
          [css.failed]: stageStatus === ExecutionStatusEnum.Failed,
          [css.runningNode]: stageStatus === ExecutionStatusEnum.Running
        })}
        style={{
          width: 90,
          height: 40
        }}
        onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
        onMouseEnter={event => {
          event.stopPropagation()

          props?.fireEvent({
            type: Event.MouseEnterNode,
            target: event.target,
            data: { ...props }
          })
        }}
        onMouseLeave={event => {
          allowAdd && setVisibilityOfAdd(false)
          event.stopPropagation()
          setVisibilityOfAdd(false)
          props?.fireEvent({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: { ...props }
          })
        }}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          // if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className="execution-running-animation" />
        {props.icon && (
          <Icon
            size={28}
            name={props.icon}
            inverse={props?.isSelected || (stageStatus as string) === ExecutionStatusEnum.Failed}
          />
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={css.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {props?.data?.tertiaryIcon && <Icon name={props?.data?.tertiaryIcon} size={13} className={css.tertiaryIcon} />}
        {CODE_ICON && <Icon className={css.codeIcon} size={8} name={CODE_ICON} />}
        <Button
          className={cx(css.closeNode, { [css.readonly]: props.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
          iconProps={{ size: 10 }}
          onMouseDown={e => {
            e.stopPropagation()
            props?.fireEvent({
              type: Event.RemoveNode,
              data: {
                identifier: props?.identifier,
                node: props
              }
            })
          }}
          withoutCurrentColor={true}
        />
      </div>
      <div className={cx(css.markerEnd, css.stageMarker)}>
        <SVGMarker />
      </div>

      {props.name && (
        <Text
          width={90}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && CreateNode && !props.readonly && (
        <CreateNode
          onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
          onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            })
          }}
          className={cx(css.addNode, css.stageAddNode, { [css.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !props.readonly && (
        <div
          data-linkid={props?.identifier}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
              data: {
                entityType: DiagramType.Link,
                node: props,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                identifier: props?.identifier
              }
            })
          }}
          onDragOver={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(true)
          }}
          onDragLeave={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(false)
          }}
          onDrop={event => {
            event.stopPropagation()
            setShowAddLink(false)
            props?.fireEvent({
              type: Event.DropLinkEvent,
              data: {
                linkBeforeStepGroup: false,
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              }
            })
          }}
          className={cx(css.addNodeIcon, css.left, css.stageAddIcon, {
            [css.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {!props?.nextNode && props?.parentIdentifier && !props.isParallelNode && !props.readonly && (
        <div
          data-linkid={props?.identifier}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
              data: {
                linkBeforeStepGroup: true,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Link,
                identifier: props?.identifier,
                node: props
              }
            })
          }}
          onDragOver={event => {
            event.stopPropagation()
            event.preventDefault()
          }}
          onDrop={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.DropLinkEvent,
              data: {
                linkBeforeStepGroup: true,
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              }
            })
          }}
          className={cx(css.addNodeIcon, css.right, css.stageAddIcon, {
            [css.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
    </div>
  )
}

export default PipelineStageNode
