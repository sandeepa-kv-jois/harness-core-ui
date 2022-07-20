/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { PipelineType, PipelinePathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FilterDTO, GetListOfExecutionsQueryParams, useGetFilterList } from 'services/pipeline-ng'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { StringUtils } from '@common/exports'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import type { QueryParams, QuickStatusParam, StringQueryParams } from '../types'

export function processQueryParams(params: StringQueryParams & GitQueryParams) {
  let filters = {}

  try {
    filters = params.filters ? JSON.parse(params.filters) : undefined
  } catch (_e) {
    // do nothing
  }

  return {
    ...params,
    page: parseInt(params.page || '1', 10),
    size: parseInt(params.size || '20', 10),
    sort: [],
    status: ((Array.isArray(params.status) ? params.status : [params.status]) as QuickStatusParam)?.filter(p => p),
    myDeployments: !!params.myDeployments,
    searchTerm: params.searchTerm,
    filters,
    repoIdentifier: params.repoIdentifier,
    repoName: params.repoName,
    branch: params.branch,
    connectorRef: params.connectorRef,
    storeType: params.storeType
  }
}

interface ExecutionListFilterContext {
  filterList: FilterDTO[]
  isFetchingFilterList: boolean
  refetchFilterList: () => Promise<void>
  clearFilter: () => void
  /**
   *  Response filtered due any of the applied filters, search etc
   */
  isAnyFilterApplied: boolean
  /**
   *  has one of the saved filters been applied
   */
  isSavedFilterApplied: boolean
  /**
   *  processed query params. Ex tranform to boolean and number types
   */
  queryParams: QueryParams
}

const ExecutionListFilterContext = React.createContext({} as ExecutionListFilterContext)

export function ExecutionListFilterContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useQueryParams<QueryParams & GitQueryParams>({ processQueryParams })
  const { replaceQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()

  const { filterIdentifier, myDeployments, status, searchTerm } = queryParams
  const isAnyFilterApplied =
    myDeployments ||
    (Array.isArray(status) && status.length > 0) ||
    [(queryParams.pipelineIdentifier, queryParams.filters, filterIdentifier, searchTerm)].some(
      filter => filter !== undefined
    )

  const {
    data: filterData,
    loading: isFetchingFilterList,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'PipelineExecution'
    }
  })

  const clearFilter = () => replaceQueryParams({})

  return (
    <ExecutionListFilterContext.Provider
      value={{
        filterList: filterData?.data?.content || [],
        isFetchingFilterList,
        refetchFilterList,
        isAnyFilterApplied,
        isSavedFilterApplied:
          !!filterIdentifier && filterIdentifier !== StringUtils.getIdentifierFromName(UNSAVED_FILTER),
        queryParams,
        clearFilter
      }}
    >
      {children}
    </ExecutionListFilterContext.Provider>
  )
}

export function useExecutionListFilterContext(): ExecutionListFilterContext {
  return React.useContext(ExecutionListFilterContext)
}
