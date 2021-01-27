import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { stringify } from 'yaml'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget, TestStepWidgetProps } from '../__tests__/StepTestUtil'
import { SaveCacheGCSStep as SaveCacheGCSStepComponent } from './SaveCacheGCSStep'

factory.registerStep(new SaveCacheGCSStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / SaveCacheGCSStep',
  // eslint-disable-next-line react/display-name
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const SaveCacheGCSStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{stringify(value)}</pre>
      </Card>
    </div>
  )
}

SaveCacheGCSStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.SaveCacheGCS,
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      bucket: 'Bucket',
      key: 'Key',
      sourcePaths: ['some/path'],
      target: 'Target',
      resources: {
        limits: {
          memory: '128Mi',
          cpu: '0.2'
        }
      }
    }
  },
  type: StepType.SaveCacheGCS,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.SaveCacheGCS,
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      key: RUNTIME_INPUT_VALUE,
      sourcePaths: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.SaveCacheGCS,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      key: RUNTIME_INPUT_VALUE,
      sourcePaths: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.name',
          localName: 'step.saveCacheGCS.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.timeout',
          localName: 'step.saveCacheGCS.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.connectorRef',
          localName: 'step.saveCacheGCS.spec.connectorRef'
        }
      },
      'step-bucket': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.bucket',
          localName: 'step.saveCacheGCS.spec.bucket'
        }
      },
      'step-key': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.key',
          localName: 'step.saveCacheGCS.spec.key'
        }
      },
      'step-sourcePaths': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.sourcePaths',
          localName: 'step.saveCacheGCS.spec.sourcePaths'
        }
      },
      'step-target': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.target',
          localName: 'step.saveCacheGCS.spec.target'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.pull',
      //     localName: 'step.saveCacheGCS.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.resources.limits.memory',
          localName: 'step.saveCacheGCS.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.resources.limits.cpu',
          localName: 'step.saveCacheGCS.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.SaveCacheGCS,
      identifier: 'saveCacheGCS',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        bucket: 'step-bucket',
        key: 'step-key',
        sourcePaths: 'step-sourcePaths',
        target: 'step-target',
        // TODO: Right now we do not support Image Pull Policy but will do in the future
        // pull: 'step-pull',
        resources: {
          limits: {
            memory: 'step-limitMemory',
            cpu: 'step-limitCPU'
          }
        }
      }
    }
  }
}
