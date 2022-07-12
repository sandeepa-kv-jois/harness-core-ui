/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Color, FontVariation, Layout, Text } from '@harness/uicore'
import copy from 'clipboard-copy'
import css from './CommandBlock.module.scss'

interface CommandBlockProps {
  commandSnippet: string
  allowCopy?: boolean
}

const CommandBlock: React.FC<CommandBlockProps> = ({ commandSnippet, allowCopy }) => {
  const [openTooltip, setOpenTooltip] = useState(false)

  const showCopySuccess = () => {
    setOpenTooltip(true)
    setTimeout(() => {
      setOpenTooltip(false)
    }, 1000)
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} className={css.commandBlock}>
      <Text font={{ variation: FontVariation.YAML }}>{commandSnippet}</Text>
      {allowCopy && (
        <Button
          minimal
          icon="duplicate"
          iconProps={{ color: Color.PRIMARY_7 }}
          onClick={() => {
            copy(commandSnippet)
            showCopySuccess()
          }}
          tooltip={'Copied'}
          tooltipProps={{ isOpen: openTooltip, isDark: true }}
        />
      )}
    </Layout.Horizontal>
  )
}

export default CommandBlock
