/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FontVariation, Layout, PageBody, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Service } from 'services/lw'
import css from './RuleDetailsBody.module.scss'

interface RulesDetailsBodyProps {
  service?: Service
}

const RulesDetailsBody: React.FC<RulesDetailsBodyProps> = () => {
  const { getString } = useStrings()
  return (
    <PageBody className={css.ruleDetailsBody}>
      <Layout.Horizontal>
        <Container className={css.col1}>
          <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
        </Container>
        <div className={css.colDivider} />
        <Container className={css.col2}>
          <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
        </Container>
      </Layout.Horizontal>
    </PageBody>
  )
}

export default RulesDetailsBody
