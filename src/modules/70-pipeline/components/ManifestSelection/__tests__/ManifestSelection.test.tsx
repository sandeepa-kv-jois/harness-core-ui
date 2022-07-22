/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  findByText,
  fireEvent,
  findAllByText,
  waitFor,
  getByText,
  queryByAttribute,
  act,
  findByTestId
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'

import type { ManifestConfigWrapper, ServiceDefinition } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import ManifestSelection from '../ManifestSelection'
import ManifestListView from '../ManifestListView/ManifestListView'
import pipelineContextMock from './pipeline_mock.json'
import gitOpsEnabledPipeline from './gitops_pipeline.json'
import connectorsData from './connectors_mock.json'
import { addManifestUpdateStageArg } from './helper'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

const getGitOpsContextValue = (): PipelineContextInterface => {
  return {
    ...gitOpsEnabledPipeline,
    getStageFromPipeline: jest.fn(() => {
      return { stage: gitOpsEnabledPipeline.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
const manifestListCommonProps = {
  updateStage: jest.fn(),
  refetchConnectors: jest.fn(),
  updateManifestList: jest.fn(),
  removeManifestConfig: jest.fn(),
  attachPathYaml: jest.fn(),
  removeValuesYaml: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[]
}

describe('ManifestSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders add Manifest option without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Wizard popover`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const manifestTypes = await waitFor(() =>
      findAllByText(portal as HTMLElement, 'pipeline.manifestTypeLabels.K8sManifest')
    )
    expect(manifestTypes).toBeDefined()
    fireEvent.click(manifestTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()
  })

  test(`renders manifest selection when isForOverrideSets is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()

    const listOfManifests =
      pipelineContextMock.state.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets.map(
        elem => elem.overrideSets.overrideSet.manifests
      )[0]
    expect(listOfManifests.length).toEqual(4)
  })

  test(`renders manifest selection when isForPredefinedSets is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
  })

  test(`renders manifest selection when overrideSetIdentifier and identifierName has some value`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType="Kubernetes"
            isPropagating={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders manifest selection when isPropagating is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType="Kubernetes"
            isPropagating={true}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
  })

  test(`renders Manifest Listview without crashing`, () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      connectors: undefined,
      isReadonly: false,
      listOfManifests: [],
      deploymentType: 'Kubernetes' as ServiceDefinition['type']
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Listview with connectors Data`, () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      connectors: connectorsData.data as any,
      isReadonly: false,
      listOfManifests: [],
      deploymentType: 'Kubernetes' as ServiceDefinition['type']
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Listview with overrideSetIdentifier, isPropagating, isForOverrideSets`, () => {
    const props = {
      isPropagating: true,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      isForOverrideSets: true,
      identifierName: '',
      isForPredefinedSets: false,
      connectors: connectorsData.data as any,
      isReadonly: false,
      listOfManifests: [],
      deploymentType: 'Kubernetes' as ServiceDefinition['type']
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`delete manifest list works correctly`, async () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      connectors: connectorsData.data as any,
      isReadonly: false,
      deploymentType: 'Kubernetes' as ServiceDefinition['type'],
      listOfManifests: [
        {
          manifest: {
            identifier: 'idtest',
            type: 'K8sManifest',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'account.Rohan_Github_ALL_HANDS',
                  gitFetchType: 'Branch',
                  paths: ['path'],
                  branch: 'master'
                }
              },
              skipResourceVersioning: false
            }
          }
        } as ManifestConfigWrapper
      ]
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} />
      </TestWrapper>
    )

    const deleteManifestBtn = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteManifestBtn).toBeDefined()
    fireEvent.click(deleteManifestBtn)

    expect(container).toMatchSnapshot()
  })

  test(`edit manifest list works correctly`, async () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      identifierName: '',
      connectors: connectorsData.data as any,
      isReadonly: false,
      deploymentType: 'Kubernetes' as ServiceDefinition['type'],
      listOfManifests: [
        {
          manifest: {
            identifier: 'id77',
            type: 'Kustomize',
            spec: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: 'account.Testbitbucke',
                  gitFetchType: 'Branch',
                  folderPath: 'test',
                  branch: 'master'
                }
              },
              pluginPath: 'path',
              skipResourceVersioning: false
            }
          }
        } as ManifestConfigWrapper
      ]
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} />
      </TestWrapper>
    )

    const editManifestBtn = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editManifestBtn).toBeDefined()
    fireEvent.click(editManifestBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`manifest listview when isForOverrideSets is true`, async () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock.state.pipeline,
      stage: pipelineContextMock.state.pipeline.stages[0],
      isForOverrideSets: true,
      identifierName: '',
      connectors: connectorsData.data as any,
      isReadonly: false,
      listOfManifests: [],
      deploymentType: 'Kubernetes' as ServiceDefinition['type']
    }

    const listOfManifests = props.stage.stage.spec.serviceConfig.serviceDefinition.spec
      .manifestOverrideSets as ManifestConfigWrapper[]
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} {...manifestListCommonProps} listOfManifests={listOfManifests} />
      </TestWrapper>
    )

    const editManifestBtn = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editManifestBtn).toBeDefined()
    fireEvent.click(editManifestBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
  })

  test('when gitopsenabled is true', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getGitOpsContextValue()}>
          <ManifestSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('is manifest type list containing required types for Amazon ECS', async () => {
    const context = {
      ...pipelineContextMock,
      getStageFromPipeline: jest.fn(() => {
        return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
      })
    } as any

    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: { NG_AZURE: true, CUSTOM_ARTIFACT_NG: true }
        }}
      >
        <PipelineContext.Provider value={context}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType={ServiceDeploymentType.ECS}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addManifestButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addManifestButton).toBeDefined()
    fireEvent.click(addManifestButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const manifestFirstStepTitle = await waitFor(() =>
      findByText(portal, 'pipeline.manifestType.specifyManifestRepoType')
    )
    expect(manifestFirstStepTitle).toBeDefined()

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    // EcsTaskDefinition, EcsServiceDefinition, EcsScalingPolicyDefinition and EcsScalableTargetDefinition should be rendered
    const EcsTaskDefinition = queryByValueAttribute('EcsTaskDefinition')
    expect(EcsTaskDefinition).not.toBeNull()
    const EcsServiceDefinition = queryByValueAttribute('EcsServiceDefinition')
    expect(EcsServiceDefinition).not.toBeNull()
    const EcsScalingPolicyDefinition = queryByValueAttribute('EcsScalingPolicyDefinition')
    expect(EcsScalingPolicyDefinition).not.toBeNull()
    const EcsScalableTargetDefinition = queryByValueAttribute('EcsScalableTargetDefinition')
    expect(EcsScalableTargetDefinition).not.toBeNull()

    // K8sManifest, Values, HelmChart, Kustomize, OpenshiftTemplate, OpenshiftParam, KustomizePatches, ServerlessAwsLambda should NOT be rendered
    const K8sManifest = queryByValueAttribute('K8sManifest')
    expect(K8sManifest).toBeNull()
    const Values = queryByValueAttribute('Values')
    expect(Values).toBeNull()
    const HelmChart = queryByValueAttribute('HelmChart')
    expect(HelmChart).toBeNull()
    const Kustomize = queryByValueAttribute('Kustomize')
    expect(Kustomize).toBeNull()
    const OpenshiftTemplate = queryByValueAttribute('OpenshiftTemplate')
    expect(OpenshiftTemplate).toBeNull()
    const OpenshiftParam = queryByValueAttribute('OpenshiftParam')
    expect(OpenshiftParam).toBeNull()
    const KustomizePatches = queryByValueAttribute('KustomizePatches')
    expect(KustomizePatches).toBeNull()
    const ServerlessAwsLambda = queryByValueAttribute('ServerlessAwsLambda')
    expect(ServerlessAwsLambda).toBeNull()
  })

  test('for Amazon ECS deployment type, add EcsTaskDefinition manifest', async () => {
    const updateStage = jest.fn()
    const context = {
      ...pipelineContextMock,
      getStageFromPipeline: jest.fn(() => {
        return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
      }),
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      updateStage
    } as any

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType={ServiceDeploymentType.ECS}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addManifestButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addManifestButton).toBeDefined()
    fireEvent.click(addManifestButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const manifestFirstStepTitle = await waitFor(() =>
      findByText(portal, 'pipeline.manifestType.specifyManifestRepoType')
    )
    expect(manifestFirstStepTitle).toBeDefined()

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const EcsTaskDefinition = queryByValueAttribute('EcsTaskDefinition')
    expect(EcsTaskDefinition).not.toBeNull()
    userEvent.click(EcsTaskDefinition!)
    const firstStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(firstStepContinueButton).not.toBeDisabled())
    userEvent.click(firstStepContinueButton)

    await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
    const Git = queryByValueAttribute('Git')
    expect(Git).not.toBeNull()
    const GitLab = queryByValueAttribute('GitLab')
    expect(GitLab).not.toBeNull()
    const Bitbucket = queryByValueAttribute('Bitbucket')
    expect(Bitbucket).not.toBeNull()

    userEvent.click(Git!)
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
      const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
      expect(githubConnector1).toBeTruthy()
      const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
      expect(githubConnector2).toBeTruthy()
      userEvent.click(githubConnector1)
      const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
      await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))
    })
    const secondStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)
    await waitFor(() => expect(getByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
    })
    const submitButton = getByText(portal, 'submit').parentElement as HTMLElement
    userEvent.click(submitButton)
    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(addManifestUpdateStageArg)
    })
  })
})
