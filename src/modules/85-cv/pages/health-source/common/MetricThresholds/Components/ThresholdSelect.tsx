import React from 'react'
import { FormInput } from '@harness/uicore'
import type { ThresholdSelectProps } from '../../../AppDMetricThreshold.types'

export default function ThresholdSelect(props: ThresholdSelectProps): JSX.Element {
  return <FormInput.Select {...props} usePortal></FormInput.Select>
}
