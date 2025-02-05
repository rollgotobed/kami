import { NoteTimelineList } from 'components/in-page/NoteTimelineList'
import { FaRegularBookmark, FaSolidBookmark } from 'components/universal/Icons'
import { BottomUpTransitionView } from 'components/universal/Transition/bottom-up'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { ReactNode, forwardRef, useCallback } from 'react'
import { useStore } from 'store'
import { resolveUrl } from 'utils'
import { apiClient } from 'utils/client'

interface NoteLayoutProps {
  title: string
  tips?: string
  date: string

  id: string
  children?: ReactNode
}

export const NoteLayout = observer<NoteLayoutProps, HTMLElement>(
  forwardRef((props, ref) => {
    const { date, id, title, tips, children } = props
    const dateFormat = dayjs(date).locale('cn').format('YYYY年M月D日 dddd')
    const {
      userStore: { isLogged, url },
      noteStore,
    } = useStore()
    const note = noteStore.get(id)
    const bookmark = note?.hasMemory
    const onMarkToggle = useCallback(async () => {
      await apiClient.note.proxy(id).patch({ data: { hasMemory: !bookmark } })
    }, [bookmark, id])
    const noAppear = globalThis.location ? location.hash : false
    return (
      <main className="max-w-[50em] relative is-note" ref={ref}>
        <BottomUpTransitionView
          id={id}
          in={true}
          appear={!noAppear}
          mountOnEnter
          unmountOnExit
          timeout={0}
        >
          <div className={'note-article relative'}>
            <div className="title-headline text-light-brown dark:text-shizuku-text">
              <span className="inline-flex items-center">
                <time className="font-medium">{dateFormat}</time>
                <div className="ml-4 inline-block">
                  {isLogged ? (
                    bookmark ? (
                      <FaSolidBookmark
                        className="text-red cursor-pointer"
                        onClick={onMarkToggle}
                      />
                    ) : (
                      <FaRegularBookmark
                        className="cursor-pointer"
                        onClick={onMarkToggle}
                      />
                    )
                  ) : bookmark ? (
                    <FaSolidBookmark className="text-red" />
                  ) : null}
                </div>
              </span>
            </div>
            <div>
              <h1
                title={tips}
                className="text-center !mt-4 !before:hidden headline text-brown dark:text-shizuku-text"
              >
                {title}
                {isLogged && url ? (
                  <a
                    className="edit-link"
                    target="_blank"
                    href={resolveUrl(`/#/notes/edit?id=${id}`, url.adminUrl)!}
                  >
                    编辑
                  </a>
                ) : null}
              </h1>

              {children}
            </div>
          </div>
        </BottomUpTransitionView>

        <NoteTimelineList noteId={id} />
      </main>
    )
  }),
)
