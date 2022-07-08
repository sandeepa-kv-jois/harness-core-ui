/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import type { Service } from 'services/lw'
import { useStrings } from 'framework/strings'
import css from './RuleDetailsBody.module.scss'

interface RuleDetailsTabContainerProps {
  service?: Service
}

const RuleDetailsTabContainer: React.FC<RuleDetailsTabContainerProps> = ({ service }) => {
  const { getString } = useStrings()
  return (
    <Container className={css.tabRowContainer}>
      {!service ? (
        <Icon name="spinner" />
      ) : (
        <>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.H5 }}>Rule Details</Text>
            <Layout.Horizontal>
              <Text>{getString('ce.co.ruleDetailsHeader.idleTime')}</Text>
              <Text>{`${service.idle_time_mins} min`}</Text>
            </Layout.Horizontal>
            <Layout.Horizontal>
              <Text>Instance type</Text>
              <Text>Spot</Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </>
      )}
    </Container>
  )
}

export default RuleDetailsTabContainer
