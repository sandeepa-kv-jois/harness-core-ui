/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import K8sValuesYamlManifestContent from '../ManifestSourceRuntimeFields/K8sValuesYamlManifestContent'

export class ValuesYamlManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.Values

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <K8sValuesYamlManifestContent {...props} pathFieldlabel="common.git.filePath" />
  }
}
