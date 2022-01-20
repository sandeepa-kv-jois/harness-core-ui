/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'

import { getConfig, getUsingFetch, GetUsingFetchProps } from '../config'
export interface Error {
  /**
   * Details about the error encountered
   */
  error_msg?: string
}

export interface Line {
  /**
   * Represents severity of the log (eg INFO, etc)
   */
  level?: string
  /**
   * Position of the log line
   */
  pos?: number
  /**
   * Actual message that needs to be displayed
   */
  out?: string
  /**
   * Timestamp at which the log was written
   */
  time?: string
  args?: {
    [key: string]: string
  }
}

/**
 * Token used for authentication
 */
export type Token = string

export interface GetTokenQueryParams {
  /**
   * Account ID to generate a token for
   */
  accountID: string
}

export type GetTokenProps = Omit<GetProps<void, void, GetTokenQueryParams, void>, 'path'>

/**
 * Generate token
 *
 * Generate an account level token to be used for log APIs
 */
export const GetToken = (props: GetTokenProps) => (
  <Get<void, void, GetTokenQueryParams, void> path="/token" base={getConfig('log-service')} {...props} />
)

export type UseGetTokenProps = Omit<UseGetProps<void, void, GetTokenQueryParams, void>, 'path'>

/**
 * Generate token
 *
 * Generate an account level token to be used for log APIs
 */
export const useGetToken = (props: UseGetTokenProps) =>
  useGet<void, void, GetTokenQueryParams, void>(`/token`, { base: getConfig('log-service'), ...props })

/**
 * Generate token
 *
 * Generate an account level token to be used for log APIs
 */
export const getTokenPromise = (
  props: GetUsingFetchProps<void, void, GetTokenQueryParams, void>,
  signal?: RequestInit['signal']
) => getUsingFetch<void, void, GetTokenQueryParams, void>(getConfig('log-service'), `/token`, props, signal)

export interface LogStreamQueryParams {
  /**
   * Account ID to retrieve logs for
   */
  accountID: string
  /**
   * Unique key to retrieve logs for
   */
  key: string
  /**
   * Account level token to ensure allowed access
   */
  'X-Harness-Token': string
}

export type LogStreamProps = Omit<GetProps<Line, Error, LogStreamQueryParams, void>, 'path'>

/**
 * Stream log response
 *
 * Stream back log response using server sent events (SSE)
 */
export const LogStream = (props: LogStreamProps) => (
  <Get<Line, Error, LogStreamQueryParams, void> path="/stream" base={getConfig('log-service')} {...props} />
)

export type UseLogStreamProps = Omit<UseGetProps<Line, Error, LogStreamQueryParams, void>, 'path'>

/**
 * Stream log response
 *
 * Stream back log response using server sent events (SSE)
 */
export const useLogStream = (props: UseLogStreamProps) =>
  useGet<Line, Error, LogStreamQueryParams, void>(`/stream`, { base: getConfig('log-service'), ...props })

/**
 * Stream log response
 *
 * Stream back log response using server sent events (SSE)
 */
export const logStreamPromise = (
  props: GetUsingFetchProps<Line, Error, LogStreamQueryParams, void>,
  signal?: RequestInit['signal']
) => getUsingFetch<Line, Error, LogStreamQueryParams, void>(getConfig('log-service'), `/stream`, props, signal)

export interface LogBlobQueryParams {
  /**
   * Account ID to retrieve logs for
   */
  accountID: string
  /**
   * Unique key to retrieve logs for
   */
  key: string
  /**
   * Account level token to ensure allowed access
   */
  'X-Harness-Token': string
}

export type LogBlobProps = Omit<GetProps<void, void, LogBlobQueryParams, void>, 'path'>

/**
 * Get log response from blob
 *
 * Retrieve log response from blob storage
 */
export const LogBlob = (props: LogBlobProps) => (
  <Get<void, void, LogBlobQueryParams, void> path="/blob" base={getConfig('log-service')} {...props} />
)

export type UseLogBlobProps = Omit<UseGetProps<void, void, LogBlobQueryParams, void>, 'path'>

/**
 * Get log response from blob
 *
 * Retrieve log response from blob storage
 */
export const useLogBlob = (props: UseLogBlobProps) =>
  useGet<void, void, LogBlobQueryParams, void>(`/blob`, { base: getConfig('log-service'), ...props })

/**
 * Get log response from blob
 *
 * Retrieve log response from blob storage
 */
export const logBlobPromise = (
  props: GetUsingFetchProps<void, void, LogBlobQueryParams, void>,
  signal?: RequestInit['signal']
) => getUsingFetch<void, void, LogBlobQueryParams, void>(getConfig('log-service'), `/blob`, props, signal)
