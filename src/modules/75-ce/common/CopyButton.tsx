/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonProps, Color } from '@harness/uicore'
import copy from 'clipboard-copy'

interface CopyButtonProps extends ButtonProps {
  textToCopy: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, ...rest }) => {
  const [openTooltip, setOpenTooltip] = useState(false)

  const showCopySuccess = () => {
    setOpenTooltip(true)
    setTimeout(() => {
      setOpenTooltip(false)
    }, 1000)
  }

  return (
    <Button
      minimal
      icon="duplicate"
      iconProps={{ color: Color.PRIMARY_7 }}
      onClick={() => {
        copy(textToCopy)
        showCopySuccess()
      }}
      tooltip={'Copied'}
      tooltipProps={{ isOpen: openTooltip, isDark: true }}
      {...rest}
    />
  )
}

export default CopyButton
