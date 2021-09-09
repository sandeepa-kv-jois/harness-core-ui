import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'

export default function CDPipelineDeploymentList(): React.ReactElement {
  const { pipelineIdentifier, orgIdentifier, projectIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()

  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const history = useHistory()
  const { getString } = useStrings()
  useDocumentTitle([getString('pipelines'), getString('executionsText')])

  const onRunPipeline = (): void => {
    history.push(
      routes.toPipelineStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier,
        runPipeline: true
      })
    )
  }

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  useDocumentTitle([pipeline?.data?.name || getString('pipelines'), getString('executionsText')])

  return <PipelineDeploymentList showHealthAndExecution onRunPipeline={onRunPipeline} />
}
