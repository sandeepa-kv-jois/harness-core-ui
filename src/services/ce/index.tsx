/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface AwsTemplateURLResponse {
  data?: {
    cloudFormationTemplateLink?: string
    externalId?: string
    harnessAccountId?: string
    stackLaunchTemplateLink?: string
  }
  status?: string
}

export interface AzureStaticAPIResponse {
  data?: string
  status?: string
}

export interface GetScheduledReportsQueryParams {
  viewId?: string
  reportId?: string
}

export interface GetScheduledReportsPathParams {
  accountId: string
}

export type GetScheduledReportsProps = Omit<
  GetProps<void, void, GetScheduledReportsQueryParams, GetScheduledReportsPathParams>,
  'path'
> &
  GetScheduledReportsPathParams

export const GetScheduledReports = ({ accountId, ...props }: GetScheduledReportsProps) => (
  <Get<void, void, GetScheduledReportsQueryParams, GetScheduledReportsPathParams>
    path={`/ceReportSchedule/${accountId}`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseGetScheduledReportsProps = Omit<
  UseGetProps<void, void, GetScheduledReportsQueryParams, GetScheduledReportsPathParams>,
  'path'
> &
  GetScheduledReportsPathParams

export const useGetScheduledReports = ({ accountId, ...props }: UseGetScheduledReportsProps) =>
  useGet<void, void, GetScheduledReportsQueryParams, GetScheduledReportsPathParams>(
    (paramsInPath: GetScheduledReportsPathParams) => `/ceReportSchedule/${paramsInPath.accountId}`,
    { base: getConfig('ccm/api'), pathParams: { accountId }, ...props }
  )

export type AzureStaticAPIProps = Omit<GetProps<AzureStaticAPIResponse, unknown, void, void>, 'path'>

/**
 * Azure Static API for connector
 *
 * Azure Static API for connector
 */
export const AzureStaticAPI = (props: AzureStaticAPIProps) => (
  <Get<AzureStaticAPIResponse, unknown, void, void>
    path={`/connector/azureappclientid`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseAzureStaticAPIProps = Omit<UseGetProps<AzureStaticAPIResponse, unknown, void, void>, 'path'>

/**
 * Azure Static API for connector
 *
 * Azure Static API for connector
 */
export const useAzureStaticAPI = (props: UseAzureStaticAPIProps) =>
  useGet<AzureStaticAPIResponse, unknown, void, void>(`/connector/azureappclientid`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface DownloadYamlQueryParams {
  accountId: string
  connectorIdentifier: string
}

export type DownloadYamlProps = Omit<MutateProps<void, unknown, DownloadYamlQueryParams, void, void>, 'path' | 'verb'>

/**
 * Downloads YAML file for connector
 *
 * Downloads YAML file for connector
 */
export const DownloadYaml = (props: DownloadYamlProps) => (
  <Mutate<void, unknown, DownloadYamlQueryParams, void, void>
    verb="POST"
    path={`/yaml/generate-cost-optimisation-yaml`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseDownloadYamlProps = Omit<
  UseMutateProps<void, unknown, DownloadYamlQueryParams, void, void>,
  'path' | 'verb'
>

/**
 * Downloads YAML file for connector
 *
 * Downloads YAML file for connector
 */
export const useDownloadYaml = (props: UseDownloadYamlProps) =>
  useMutate<void, unknown, DownloadYamlQueryParams, void, void>('POST', `/yaml/generate-cost-optimisation-yaml`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface AwsUrlTemplateQueryParams {
  accountIdentifier: string
}

export type AwsUrlTemplateProps = Omit<
  GetProps<AwsTemplateURLResponse, unknown, AwsUrlTemplateQueryParams, void>,
  'path'
>

/**
 * Gets AWS Template for connector
 *
 * Gets AWS Template for connector
 */
export const AwsUrlTemplate = (props: AwsUrlTemplateProps) => (
  <Get<AwsTemplateURLResponse, unknown, AwsUrlTemplateQueryParams, void>
    path={`connector/awsaccountconnectiondetail`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseAwsUrlTemplateProps = Omit<
  UseGetProps<AwsTemplateURLResponse, unknown, AwsUrlTemplateQueryParams, void>,
  'path'
>

/**
 * Gets AWS Template for connector
 *
 * Gets AWS Template for connector
 */
export const useAwsUrlTemplate = (props: UseAwsUrlTemplateProps) =>
  useGet<AwsTemplateURLResponse, unknown, AwsUrlTemplateQueryParams, void>(`connector/awsaccountconnectiondetail`, {
    base: getConfig('ccm/api'),
    ...props
  })
