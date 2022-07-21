/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, FontVariation, Layout, PageHeader, Text } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import CommitmentOrchestrationBody from '@ce/components/CommitmentOrchestratorBody/CommitmentOrchestratorBody'

const CommitmentOrchestration: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container>
      <PageHeader
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Text font={{ variation: FontVariation.H4 }}>{getString('ce.commitmentOrchestration.sideNavLabel')}</Text>
        }
        toolbar={
          <Layout.Horizontal>
            <Button variation={ButtonVariation.PRIMARY} icon="nav-settings">
              {getString('common.setup')}
            </Button>
          </Layout.Horizontal>
        }
      />
      <CommitmentOrchestrationBody />
    </Container>
  )
}

export default CommitmentOrchestration
