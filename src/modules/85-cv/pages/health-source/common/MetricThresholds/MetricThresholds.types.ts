import type { SelectOption, SelectProps } from '@harness/uicore'

export interface SelectItem {
  label: string
  value: string
}

export interface ThresholdCriteriaPropsType {
  criteriaType: string | null
  index: number
  thresholdTypeName: string
  replaceFn: (value: any) => void
  criteriaPercentageType?: string
}

export type ThresholdSelectProps = {
  name: string
  items: SelectItem[]
  onChange?: (value: SelectOption) => void
  key?: string
  disabled?: boolean
  className?: string
} & SelectProps
