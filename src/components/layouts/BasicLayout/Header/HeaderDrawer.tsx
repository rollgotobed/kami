import classNames from 'clsx'
import { LaTimes } from 'components/universal/Icons'
import { OverLay } from 'components/universal/Overlay'
import { useRouter } from 'next/router'
import React, { FC, Fragment, memo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NoSSR } from 'utils'
import styles from './index.module.css'

const _HeaderDrawer: FC<{ show: boolean; onExit: () => void }> = memo(
  ({ children, onExit, show }) => {
    const router = useRouter()
    useEffect(() => {
      const handler = () => {
        onExit()
      }
      router.events.on('routeChangeStart', handler)

      return () => {
        router.events.off('routeChangeStart', handler)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])
    return createPortal(
      <Fragment>
        <OverLay show={show} onClose={onExit}></OverLay>
        <div
          className={classNames(styles['drawer'], show ? styles['show'] : null)}
        >
          <div className="pb-4 text-right">
            <span className={'p-4 inline-block -mr-5 -mt-4'} onClick={onExit}>
              <LaTimes />
            </span>
          </div>

          {children}
        </div>
      </Fragment>,
      document.body,
    )
  },
)
export const HeaderDrawer = NoSSR(_HeaderDrawer)
