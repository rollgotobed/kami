import { InitialContext } from 'context/initial-data'
import { useContext } from 'react'

export const useInitialData = () => {
  return useContext(InitialContext).aggregateData
}

export const useThemeConfig = () => {
  const config = useContext(InitialContext).config

  return config
}

export { useThemeConfig as useKamiConfig }
