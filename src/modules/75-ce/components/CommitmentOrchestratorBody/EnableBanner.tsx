/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './CommitmentOrchestrationBody.module.scss'

const EnableBanner: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.bodyWidgetsContainer, css.enableBanner)}>
      <Layout.Horizontal flex>
        <Layout.Horizontal>
          <Container>
            <Text inline font={{ variation: FontVariation.H6 }}>
              {'Enable Harness Commitment Orchestrator to save upto '}
            </Text>
            <Text inline font={{ variation: FontVariation.H4 }} color={Color.PRIMARY_7}>
              {formatCost(3645.87, { decimalPoints: 2 })}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }}>
              {' additionally (61%) per month on your Compute Spend.'}
            </Text>
          </Container>
        </Layout.Horizontal>
        <Button variation={ButtonVariation.PRIMARY} icon="nav-settings">
          {getString('common.setup')}
        </Button>
      </Layout.Horizontal>
    </Container>
  )
}

export default EnableBanner
