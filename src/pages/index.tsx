import {
  faBookOpen,
  faHeart,
  faPencilAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { AggregateTop } from '@mx-space/api-client'
import { useInitialData, useThemeConfig } from 'common/hooks/use-initial-data'
import { useStore } from 'common/store'
import { FontIcon } from 'components/FontIcon'
import SectionNews, {
  SectionCard,
  SectionNewsProps,
} from 'components/SectionNews'
import configs from 'configs'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Router from 'next/router'
import QueueAnim from 'rc-queue-anim'
import Texty from 'rc-texty'
import React, { FC, useEffect, useRef, useState } from 'react'
import { apiClient } from 'utils/client'
import { message } from 'utils/message'
import { observer } from 'utils/mobx'
import { FriendsSection } from '../components/SectionNews/friend'
import { SectionWrap } from '../components/SectionNews/section'
import { getRandomImage, NoSSR } from '../utils'
import { stopEventDefault } from '../utils/dom'
import '../utils/message'
import service from '../utils/request'

const IndexView: NextPage<AggregateTop> = (props) => {
  const { userStore, appStore } = useStore()
  const { name, introduce, master } = userStore
  const { avatar } = master
  const { description } = appStore

  const { user } = useInitialData()

  const [say, setSay] = useState('')

  useEffect(() => {
    apiClient.say.getRandom().then(({ data }) => {
      if (!data) {
        return
      }
      setSay(`${data.text}  ——${data.author ?? data.source ?? '站长说'}`)
    })
  }, [])
  const initData = useInitialData()
  return (
    <main>
      <NextSeo
        title={initData.seo.title + ' · ' + initData.seo.description}
        description={initData.seo.description}
      />
      <section className="kami-intro">
        <div className="intro-avatar ">
          <img
            src={user.avatar || avatar}
            alt={name}
            style={{ width: '100%' }}
          />
        </div>
        <div className="intro-info">
          <h1>
            <Texty type={'mask-bottom'} mode={'smooth'}>
              {name}
            </Texty>
          </h1>
          <div className="paragraph">
            <Texty
              type={'mask-bottom'}
              mode={'smooth'}
              delay={500}
              duration={10}
            >
              {introduce || description}
            </Texty>
          </div>
          <Social />
        </div>
      </section>

      <div className="paragraph" style={{ color: '#aaa', marginTop: '-3rem' }}>
        <Texty appear leave={false} type={'alpha'}>
          {say}
        </Texty>
      </div>

      <Sections {...props} />
    </main>
  )
}
enum ContentType {
  Note,
  Post,
  Say,
  // Project,
}

function buildRoute<T extends { id: string } & { nid?: number }>(
  type: keyof typeof ContentType,
  obj: T,
): { as: string; href: string } {
  switch (type) {
    case 'Post': {
      const { slug, category } = obj as any
      return {
        as: `/posts/${category.slug}/${slug}`,
        href: `/posts/[category]/[slug]`,
      }
    }
    case 'Note': {
      const { nid } = obj
      return {
        as: `/notes/${nid}`,
        href: `/notes/[id]`,
      }
    }
    case 'Say': {
      return { as: `/says`, href: `/says` }
    }
    // case 'Project': {
    //   const { id } = obj
    //   return { as: `/projects/${id}`, href: `/projects/[id]` }
    // }
  }
}

const _Sections: FC<AggregateTop> = ({ notes, posts }) => {
  const config = useThemeConfig()
  const randomImages = config.site.figure.length
    ? config.site.figure
    : getRandomImage()
  const images = [...randomImages]

  const sections = useRef({
    postSection: {
      title: '最新博文',
      icon: faBookOpen,
      moreUrl: 'posts',
      content: posts.slice(0, 4).map((p) => {
        return {
          title: p.title,
          background: images.pop(),
          id: p.id,
          ...buildRoute('Post', p),
        }
      }),
    } as SectionNewsProps,
    noteSection: {
      title: '随便写写',
      icon: faPencilAlt,
      moreUrl: 'notes',
      content: notes.slice(0, 4).map((n) => {
        return {
          title: n.title,
          background: images.pop(),
          id: n.id,
          ...buildRoute('Note', n),
        }
      }),
    } as SectionNewsProps,
  })

  const [like, setLike] = useState(0)
  useEffect(() => {
    service.get('like_this').then((number) => {
      setLike(~~number)
    })
  }, [])

  return (
    <section className="kami-news" style={{ minHeight: '34rem' }}>
      <QueueAnim
        className="demo-content"
        delay={1200}
        duration={500}
        animConfig={[
          { opacity: [1, 0], translateY: [0, 50] },
          { opacity: [1, 0], translateY: [0, -50] },
        ]}
      >
        {[
          <SectionNews {...sections.current.postSection} key={1} />,
          <SectionNews {...sections.current.noteSection} key={2} />,
          <SectionWrap
            {...{
              title: '朋友们',
              moreUrl: 'friends',
              icon: faUsers,
            }}
            key={3}
          >
            <FriendsSection />
          </SectionWrap>,
          <SectionWrap
            {...{
              title: '了解更多',
              icon: faHeart,
              showMoreIcon: false,
            }}
            key={4}
          >
            <SectionCard
              {...{
                title: '留言',
                desc: '你的话对我很重要',
                src: images.pop() as string,
                href: '/message',
                onClick: (e) => {
                  stopEventDefault(e)
                  Router.push('/[page]', '/message')
                },
              }}
            />
            <SectionCard
              {...{
                title: '关于',
                desc: '这里有我的小秘密',
                src: images.pop() as string,
                href: '/about',
                onClick: (e) => {
                  stopEventDefault(e)
                  Router.push('/[page]', '/about')
                },
              }}
            />
            <SectionCard
              {...{
                title: `点赞 (${like})`,
                desc: '如果你喜欢的话点个赞呗',
                src: images.pop() as string,
                href: '/like_this',
                onClick: (e) => {
                  stopEventDefault(e)
                  service
                    .post(
                      'like_this?ts=' +
                        ((performance.now() + performance.timeOrigin) | 0),
                      null,
                    )
                    .then(() => {
                      message.success('感谢喜欢 ❤️')
                      setLike(like + 1)
                    })
                },
              }}
            />
            <SectionCard
              {...{
                title: '订阅',
                desc: '关注订阅不迷路哦',
                src: images.pop() as string,
                href: '/feed',
              }}
            />
          </SectionWrap>,
        ]}
      </QueueAnim>
    </section>
  )
}

const Sections = NoSSR(_Sections)

const Social = NoSSR(() => {
  return (
    <QueueAnim
      delay={500}
      duration={500}
      animConfig={{ opacity: [1, 0], translateY: [0, 50] }}
    >
      <div className="social-icons" key={'a'}>
        {configs.social.map((item) => {
          return (
            <a
              href={item.url}
              target="_blank"
              ks-text={item.title}
              ks-tag="bottom"
              key={item.title}
              style={item.color ? { color: item.color } : {}}
            >
              <FontIcon icon={item.icon} />
            </a>
          )
        })}
      </div>
    </QueueAnim>
  )
})

IndexView.getInitialProps = async () => {
  const aggregateData = await apiClient.aggregate.getTop()

  return aggregateData
}

export default observer(IndexView)
