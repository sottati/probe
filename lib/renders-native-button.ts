import * as React from "react"

type RenderProp =
  | React.ReactElement
  | ((...args: never[]) => React.ReactElement)
  | undefined

type CompositeResolver = (element: React.ReactElement) => boolean | undefined

export function rendersNativeButton(
  render: RenderProp,
  resolveComposite?: CompositeResolver,
): boolean {
  if (render == null) {
    return true
  }
  if (typeof render === "function") {
    return false
  }
  if (!React.isValidElement(render)) {
    return true
  }
  if (render.type === "button") {
    return true
  }

  const composite = resolveComposite?.(render)
  if (composite !== undefined) {
    return composite
  }

  return false
}
