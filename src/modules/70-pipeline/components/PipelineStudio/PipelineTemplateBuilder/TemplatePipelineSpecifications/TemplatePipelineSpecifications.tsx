/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, debounce, defaultTo, isEqual, merge, noop, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import React from 'react'
import { parse } from 'yaml'
import { Container, Formik, FormikForm, Heading, Layout, PageError } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import type { FormikProps, FormikErrors } from 'formik'
import { useToaster } from '@common/exports'
import { setTemplateInputs, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PageSpinner } from '@common/components'
import { PipelineInputSetFormInternal } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Error, PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { validatePipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import css from './TemplatePipelineSpecifications.module.scss'

export function TemplatePipelineSpecifications(): JSX.Element {
  const {
    state: { pipeline, schemaErrors, gitDetails },
    allowableTypes,
    updatePipeline,
    isReadonly
  } = usePipelineContext()
  const queryParams = useParams<ProjectPathProps>()
  const templateRef = getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const scope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const { showError } = useToaster()
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const formRefDom = React.useRef<HTMLElement | undefined>()
  const [inputsTemplate, setInputsTemplate] = React.useState<PipelineInfoConfig>()
  const [allValues, setAllValues] = React.useState<PipelineInfoConfig>()
  const [initialValues, setInitialValues] = React.useState<PipelineInfoConfig>()
  const [formikErrors, setFormikErrors] = React.useState<FormikErrors<PipelineInfoConfig>>()
  const [showFormError, setShowFormError] = React.useState<boolean>()

  const onChange = React.useCallback(
    debounce(async (values: PipelineInfoConfig): Promise<void> => {
      await updatePipeline({ ...pipeline, ...values })
    }, 300),
    [pipeline, updatePipeline]
  )

  const {
    data: templateResponse,
    error: templateError,
    refetch: refetchTemplate,
    loading: templateLoading
  } = useGetTemplate({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    }
  })

  const {
    data: templateInputSetYaml,
    error: templateInputSetError,
    refetch: refetchTemplateInputSet,
    loading: templateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    try {
      const templateInputs = parse(defaultTo(templateInputSetYaml?.data, ''))
      setInputsTemplate(templateInputs)
      setFormikErrors({})
    } catch (error) {
      showError(error.message, undefined, 'template.parse.inputSet.error')
    }
  }, [templateInputSetYaml?.data])

  React.useEffect(() => {
    if (templateResponse?.data?.yaml) {
      setAllValues(parse(templateResponse?.data?.yaml)?.template.spec)
    }
  }, [templateResponse?.data?.yaml])

  React.useEffect(() => {
    try {
      const mergedTemplateInputs = merge({}, inputsTemplate, pipeline.template?.templateInputs)
      setTemplateInputs(pipeline, mergedTemplateInputs)
      updatePipeline(pipeline)
      setInitialValues(cloneDeep(pipeline))
    } catch (error) {
      showError(error.message, undefined, 'template.parse.inputSet.error')
    }
  }, [inputsTemplate])

  React.useEffect(() => {
    if (schemaErrors) {
      formikRef.current?.submitForm()
      setShowFormError(true)
    }
  }, [schemaErrors])

  const validateForm = (values: PipelineInfoConfig) => {
    if (
      isEqual(values.template?.templateRef, pipeline.template?.templateRef) &&
      isEqual(values.template?.versionLabel, pipeline.template?.versionLabel) &&
      inputsTemplate
    ) {
      onChange?.(values)
      const errorsResponse = validatePipeline({
        pipeline: values.template?.templateInputs as PipelineInfoConfig,
        template: inputsTemplate,
        originalPipeline: allValues,
        getString,
        viewType: StepViewType.DeploymentForm
      })
      const newFormikErrors = set({}, TEMPLATE_INPUT_PATH, errorsResponse)
      setFormikErrors(newFormikErrors)
      return newFormikErrors
    } else {
      setFormikErrors({})
      return {}
    }
  }

  const refetch = () => {
    refetchTemplate()
    refetchTemplateInputSet()
  }

  return (
    <Container className={css.contentSection} height={'100%'} background={Color.FORM_BG}>
      {(templateLoading || templateInputSetLoading) && <PageSpinner />}
      {!templateLoading && !templateInputSetLoading && (templateError || templateInputSetError) && (
        <PageError
          message={
            defaultTo((templateError?.data as Error)?.message, templateError?.message) ||
            defaultTo((templateInputSetError?.data as Error)?.message, templateInputSetError?.message)
          }
          onClick={() => refetch()}
        />
      )}
      {!templateLoading &&
        !templateInputSetLoading &&
        !templateError &&
        !templateInputSetError &&
        inputsTemplate &&
        allValues &&
        initialValues && (
          <>
            {showFormError && formikErrors && <ErrorsStrip formErrors={formikErrors} domRef={formRefDom} />}
            <Formik<PipelineInfoConfig>
              initialValues={initialValues}
              formName="templateStageOverview"
              onSubmit={noop}
              validate={validateForm}
            >
              {(formik: FormikProps<PipelineInfoConfig>) => {
                formikRef.current = formik
                return (
                  <FormikForm>
                    <Container
                      className={css.inputsContainer}
                      ref={ref => {
                        formRefDom.current = ref as HTMLElement
                      }}
                    >
                      <Layout.Vertical padding={{ bottom: 'large' }} spacing={'xlarge'}>
                        <Heading level={5} color={Color.BLACK}>
                          Template Inputs
                        </Heading>
                        <Container>
                          <PipelineInputSetFormInternal
                            template={inputsTemplate}
                            originalPipeline={allValues}
                            path={TEMPLATE_INPUT_PATH}
                            readonly={isReadonly}
                            viewType={StepViewType.InputSet}
                            allowableTypes={allowableTypes}
                          />
                        </Container>
                      </Layout.Vertical>
                    </Container>
                  </FormikForm>
                )
              }}
            </Formik>
          </>
        )}
    </Container>
  )
}
