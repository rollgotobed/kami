import { MaidianAction } from 'constants/maidian'
import { OverLay } from 'components/universal/Overlay'
import { useAnalyze } from 'hooks/use-analyze'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { useStore } from 'store'

export const BanCopy: FC = observer((props) => {
  const { userStore } = useStore()
  const isLogged = userStore.isLogged
  const [showCopyWarn, setShowCopyWarn] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { event } = useAnalyze()
  const router = useRouter()
  useEffect(() => {
    if (!ref.current) {
      return
    }
    const $el = ref.current
    $el.oncopy = (e) => {
      if (isLogged) {
        return
      }
      e.preventDefault()
      setShowCopyWarn(true)
      event({ action: MaidianAction.BanCopy, label: router.asPath })
    }

    return () => {
      $el.oncopy = null
    }
  }, [event, isLogged, router.asPath])
  return (
    <>
      <div ref={ref}>{props.children}</div>
      <OverLay
        onClose={() => {
          setShowCopyWarn(false)
        }}
        show={showCopyWarn}
        center
      >
        <h1 className={'mt-0 text-red pointer-events-none'}>注意: </h1>
        <div className="my-3 text-white text-opacity-80 pointer-events-none">
          <p>本文章为站长原创, 保留版权所有, 禁止复制.</p>
        </div>
      </OverLay>
    </>
  )
})
