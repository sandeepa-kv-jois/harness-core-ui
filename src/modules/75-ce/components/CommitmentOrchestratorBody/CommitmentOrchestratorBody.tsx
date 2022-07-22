/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Page } from '@harness/uicore'
import PageFilterPanel from './PageFilterPanel'
import EnableBanner from './EnableBanner'
import ComputedDataWidgetsRow from './ComputedDataWidgetsRow'
import DataVisualisationContainer from './DataVisualisation/DataVisualisationContainer'
import css from './CommitmentOrchestrationBody.module.scss'

const CommitmentOrchestrationBody: React.FC = () => {
  return (
    <Page.Body className={css.commitmentBody}>
      <PageFilterPanel />
      <ComputedDataWidgetsRow />
      <EnableBanner />
      <DataVisualisationContainer />
    </Page.Body>
  )
}

export default CommitmentOrchestrationBody
