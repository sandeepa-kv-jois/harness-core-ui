import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'

export default function CIPipelineDeploymentList(): React.ReactElement {
  const { pipelineIdentifier, orgIdentifier, projectIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()

  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()

  const history = useHistory()
  const onRunPipeline = (): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier
      })
    )
  }

  return <PipelineDeploymentList showHealthAndExecution onRunPipeline={onRunPipeline} />
}
