import { observer } from 'mobx-react-lite'
import {
  FC,
  Fragment,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { message } from 'react-message-popup'
import { apiClient } from 'utils/client'

import { CommentModel, Pager } from '@mx-space/api-client'

import { useStore } from '../../../store'
import { NoSSR, flattenChildren } from '../../../utils'
import { Pagination } from '../../universal/Pagination'
import { CommentBox } from './box'
import { Comments } from './comments'
import styles from './index.module.css'
import { CommentLoading } from './loading'

export type CommentType = 'Note' | 'Post' | 'Page'

export const CommentContext = createContext({
  type: '' as CommentType,
  refresh: {} as (page?: number, size?: number, force?: boolean) => any,
  collection: new Map<string, Omit<CommentModel, 'children'>>(),
})

export const openCommentMessage = async () => {
  const { destory } = await message.loading({
    content: '发送中',
    duration: 20000,
  })

  return {
    success: () => {
      destory()
      message.success({ content: '成功啦', duration: 2000 })
    },
    error: () => {
      destory()
      message.error({ content: '失败了, 555', duration: 2000 })
    },
  }
}

interface CommentWrapProps {
  type: CommentType
  id: string
  allowComment: boolean
}

const _CommentWrap: FC<CommentWrapProps> = observer((props) => {
  const { type, id, allowComment } = props
  const [comments, setComments] = useState([] as CommentModel[])
  const [page, setPage] = useState({} as Pager)
  const { userStore } = useStore()
  const logged = userStore.isLogged
  const collection = useMemo(
    () => new Map<string, Omit<CommentModel, 'children'>>(),
    [],
  )

  const fetchComments = useCallback(
    (page = 1, size = 10) => {
      apiClient.comment
        .getByRefId(id, { page, size })

        .then(({ data, pagination: page }) => {
          collection.clear()

          flattenChildren(data as CommentModel[]).forEach((i) => {
            collection.set(i.id, i)
          })

          setComments(data)
          setPage(page)
          setCommentShow(true)
        })
    },
    [collection, id],
  )

  const handleComment = useCallback(
    async (model) => {
      const { success, error } = await openCommentMessage()
      try {
        if (logged) {
          await apiClient.comment.proxy.master.comment(id).post({
            params: {
              ref: type,
              ts: Date.now(),
            },
            data: { ...model },
          })
        } else {
          await apiClient.comment.comment(id, model)
        }
        requestAnimationFrame(() => {
          success()
          fetchComments()
        })
      } catch (e) {
        error()

        console.error(e)
      }
    },
    [fetchComments, id, logged, type],
  )

  const [commentShow, setCommentShow] = useState(false)

  const { ref } = useInView({
    threshold: 0.5,
    onChange(inView) {
      if (inView && !commentShow) {
        fetchComments()
      }
    },
  })

  useEffect(() => {
    setComments([])
    setCommentShow(false)
  }, [id])

  useEffect(() => {
    if (location.hash.includes('comments')) {
      requestAnimationFrame(() => {
        document.getElementById('comments')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
  }, [id])
  return (
    <div className={styles.wrap} ref={ref} data-hide-print id="comments">
      <CommentContext.Provider
        value={{ type, refresh: fetchComments, collection }}
      >
        {allowComment && (
          <h1 className="headline">
            {comments.length
              ? `共有${comments.length}条评论`
              : '亲亲留个评论再走呗'}
          </h1>
        )}

        {allowComment ? (
          <CommentBox onSubmit={handleComment} />
        ) : (
          <h1 className="headline">主人禁止了评论</h1>
        )}
        <span id="comment-anchor"></span>
        {commentShow ? (
          <Fragment>
            <Comments comments={comments} id={id} />
            <div className="text-center">
              {page && page.totalPage !== 0 && page.total !== undefined && (
                <Pagination
                  hideOnSinglePage
                  current={page.currentPage || 1}
                  onChange={(page) => {
                    document.getElementById('comment-anchor')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                    requestAnimationFrame(() => {
                      fetchComments(page)
                    })
                  }}
                  total={page.totalPage}
                />
              )}
            </div>
          </Fragment>
        ) : (
          <CommentLoading />
        )}
      </CommentContext.Provider>
    </div>
  )
})

const CommentWrap = NoSSR(_CommentWrap)
export { CommentWrap as CommentLazy }
export const minHeightProperty = { minHeight: '400px' }

export default CommentWrap
