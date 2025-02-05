import classNames from 'clsx'
import { IcBaselineMenuOpen } from 'components/universal/Icons'
import { CustomLogo as Logo } from 'components/universal/Logo'
import { useInitialData } from 'hooks/use-initial-data'
import { useSingleAndDoubleClick } from 'hooks/use-single-double-click'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'
import { useStore } from 'store'
import { NoSSR } from 'utils'

import { HeaderActionBasedOnRouterPath } from './HeaderActionBasedOnRouterPath'
import { HeaderDrawer } from './HeaderDrawer'
import { HeaderDrawerNavigation } from './HeaderDrawerNavigation'
import { MenuList } from './HeaderMenuList'
import styles from './index.module.css'

export const _Header: FC = observer(() => {
  const {
    seo: { title },
  } = useInitialData()
  const { appStore, userStore } = useStore()

  const router = useRouter()
  const clickFunc = useSingleAndDoubleClick(
    () => {
      router.push('/')
    },
    () => void router.push('/login'),
  )

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header
        className={classNames(
          styles['header'],
          !appStore.headerNav.show &&
            appStore.isOverFirstScreenHeight &&
            appStore.viewport.mobile
            ? styles['hide']
            : null,
        )}
      >
        <nav
          className={classNames(
            styles['nav-container'],
            'overflow-hidden',
            appStore.headerNav.show &&
              (appStore.scrollDirection == 'down' ||
                appStore.viewport.mobile) &&
              appStore.isOverPostTitleHeight
              ? styles['toggle']
              : null,
          )}
        >
          <div className={classNames(styles['head-swiper'], 'justify-between')}>
            <div
              className={
                'flex items-center justify-center cursor-pointer select-none'
              }
              onClick={clickFunc}
            >
              <div
                className={styles['header-logo']}
                onDoubleClick={() => {
                  if (!userStore.isLogged) {
                    router.push('/login')
                  }
                }}
              >
                <Logo />
              </div>
              <h1 className={styles['title']}>{title}</h1>
            </div>

            <div
              className={styles['more-button']}
              onClick={() => {
                setDrawerOpen(true)
              }}
            >
              <IcBaselineMenuOpen className="text-2xl" />
            </div>
            <MenuList />
          </div>
          {useMemo(
            () => (
              <div
                className={classNames(
                  styles['head-swiper'],
                  styles['swiper-metawrapper'],
                  'flex justify-between truncate',
                )}
              >
                <div className={styles['head-info']}>
                  <div className={styles['desc']}>
                    <div className={styles['meta']}>
                      {appStore.headerNav.meta}
                    </div>
                    <div className={styles['title']}>
                      {appStore.headerNav.title}
                    </div>
                  </div>
                </div>
                <div className={styles['right-wrapper']}>
                  <HeaderActionBasedOnRouterPath />
                </div>
              </div>
            ),
            [appStore.headerNav.meta, appStore.headerNav.title],
          )}
        </nav>
        <HeaderDrawer
          show={drawerOpen}
          onExit={() => {
            setDrawerOpen(false)
          }}
        >
          <HeaderDrawerNavigation />
        </HeaderDrawer>
      </header>
    </>
  )
})
export const Header = NoSSR(_Header)
