import React, { useCallback } from 'react'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import {
  PageTemplateSummaryResponse,
  TemplateFilterProperties,
  TemplateSummaryResponse,
  useGetTemplateList
} from 'services/template-ng'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { RenderColumnTemplate } from './TemplateResourceModal'

const TemplateResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [templateData, setData] = React.useState<PageTemplateSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadTemplates,
    cancel
  } = useGetTemplateList({
    queryParams: {
      templateListType: 'All',
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      size: 10,
      ...(isGitSyncEnabled ? { getDistinctFromBranches: true } : {})
    }
  })

  const fetchTemplates = useCallback(async () => {
    cancel()
    const filter = {
      filterType: 'Template',
      templateIdentifiers: identifiers
    } as TemplateFilterProperties

    setData(await (await reloadTemplates(filter)).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountIdentifier, projectIdentifier, orgIdentifier, module])

  const templateContentData: TemplateSummaryResponse[] = templateData?.content || []

  return templateData && !loading ? (
    <StaticResourceRenderer
      data={templateContentData as ResourceHandlerTableData[]}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: getString('common.pipeline'),
          id: 'name',
          accessor: 'name' as any,
          Cell: RenderColumnTemplate,
          width: '40%',
          disableSortBy: true
        }
      ]}
    />
  ) : (
    <PageSpinner />
  )
}

export default TemplateResourceRenderer
