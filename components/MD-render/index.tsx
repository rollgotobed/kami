import { ImageLazyWithPopup } from 'components/Image'
import Toc from 'components/Toc'
import React, { createElement, DOMAttributes, FC, memo, ReactType } from 'react'
import ReactMarkdown, { ReactMarkdownProps } from 'react-markdown'
import CodeBlock from '../CodeBlock'
import { observer } from 'mobx-react'
import { useStore } from 'store'

interface MdProps extends ReactMarkdownProps {
  value: string
  showTOC?: boolean
  [key: string]: any
  style?: React.CSSProperties
  readonly renderers?: { [nodeType: string]: ReactType }
}

const Heading: FC<{ level: 1 | 2 | 3 | 4 | 5 | 6; key?: number }> = (props) => {
  return createElement<DOMAttributes<HTMLHeadingElement>, HTMLHeadingElement>(
    `h${props.level}`,
    { id: props.children?.[0].props.value } as any,
    props.children,
  )
}

const Markdown: FC<MdProps> = observer((props) => {
  const { value, renderers, style, ...rest } = props
  const { appStore } = useStore()
  const { viewport } = appStore
  return (
    <>
      <div id="write" style={style}>
        <ReactMarkdown
          source={value}
          {...rest}
          renderers={{
            code: CodeBlock,
            pre: CodeBlock,
            image: ImageLazyWithPopup,
            heading: Heading,
            ...renderers,
          }}
        />
        {props.showTOC && !viewport.mobile && !viewport.pad ? <Toc /> : null}
      </div>
    </>
  )
})

export default memo(Markdown)
