import React from 'react'
import { v5 as uuid } from 'uuid'
import { Select } from '@harness/uicore'
import { getItembyValue } from './AppDThresholdSelectUtils'
import type { SelectItem } from '../../../AppDMetricThreshold.types'
import css from '../../AppDMetricThresholdContent.module.scss'

export default function appDThresholdSelect(
  name: string,
  items?: SelectItem[],
  value: string,
  index: number,
  handleChange: (value: any) => void,
  error: string
): JSX.Element {
  // const id = React.useRef(uuid(name, value))
  if (!items) {
    // not returning null here as the FieldArray renderer throws type error
    return <></>
  }
  return (
    <Select
      items={items}
      key={`${name}-${index}-${value}`}
      className={css.appDMetricThresholdContentSelect}
      name={name}
      value={getItembyValue(items, value)}
      onChange={item => handleChange(item.value)}
    ></Select>
  )
}
