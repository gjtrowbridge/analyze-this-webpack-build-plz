import { ReactElement, ReactNode } from 'react'


export function LoadingBoundary(props: {
  isLoading: boolean,
  element: ReactNode | null,
}) {
  const { isLoading, element } = props
  if (isLoading) {
    return (
      <div style={{ height: "100%", width: "100%", textAlign: "center"}}>Loading...</div>
    )
  }
  return element
}
