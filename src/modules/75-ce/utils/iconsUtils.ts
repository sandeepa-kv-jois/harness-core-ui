export const getResourceIcon = (cloudProvider: string) => {
  switch (cloudProvider) {
    case 'CLUSTER':
      return 'service-kubernetes'

    case 'AWS':
      return 'service-aws'

    case 'AZURE':
      return 'service-azure'

    case 'GCP':
      return 'gcp'

    /* istanbul ignore next */
    default:
      return 'harness'
  }
}

export const getServiceIcons = (serviceProvider: string) => {
  switch (serviceProvider) {
    case 'RDS':
      return 'aws-rds'

    /* istanbul ignore next */
    default:
      return 'dashboard'
  }
}
