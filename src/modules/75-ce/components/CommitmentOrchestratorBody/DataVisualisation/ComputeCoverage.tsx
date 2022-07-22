/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FontVariation, Layout, Select, Tab, Tabs, Text } from '@harness/uicore'

const ComputeCoverage: React.FC = () => {
  return (
    <Container>
      <Layout.Horizontal flex>
        <Layout.Horizontal>
          <Text font={{ variation: FontVariation.BODY }}>Group by</Text>
          <Tabs id={'groups'}>
            <Tab id="commitmentType" title={'Commitment type'} panel={<Text>Commitment type</Text>} />
            <Tab id="instanceFamily" title={'Instance Family'} panel={<Text>Instance Family</Text>} />
            <Tab id="regions" title={'Regions'} panel={<Text>Regions</Text>} />
          </Tabs>
        </Layout.Horizontal>
        <Select items={[]} />
      </Layout.Horizontal>
    </Container>
  )
}

export default ComputeCoverage
