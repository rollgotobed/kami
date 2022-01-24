import { FavoriteBangumiType } from '@mx-space/extra'
import { Loading } from 'components/universal/Loading'
import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { message } from 'react-message-popup'
import { useStore } from 'store'
import { ImageLazy } from '../../components/universal/Image'
import { Seo } from '../../components/universal/Seo'

const BangumiView: NextPage = () => {
  const [data, setData] = useState<null | FavoriteBangumiType[]>(null)
  const { userStore } = useStore()
  const master = userStore.master

  useEffect(() => {
    if (!master) {
      return
    }
    console.log(JSON.stringify(master.socialIds), JSON.stringify(master))

    const ids = master.socialIds
    if (!ids || !ids.bilibili) {
      message.error('没有配置 哔哩哔哩 ID')
      return
    }
    fetch('/api/bilibili/bangumi?uid=' + ids.bilibili)
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => {
        message.error(err.message)
      })
  }, [master])

  if (!data) {
    return <Loading />
  }
  return (
    <main>
      <Head>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <Seo title="追番" description="追番" />
      <section className={'kami-bangumi'}>
        <div className="grid grid-cols-4 <md:grid-cols-2 gap-8">
          {data.map((bangumi) => {
            return (
              <div key={bangumi.id}>
                <a
                  className="bangumi-item"
                  href={`https://www.bilibili.com/bangumi/media/md${bangumi.id}`}
                  target="_blank"
                  rel="nofollow"
                  data-total={bangumi.count}
                  style={{ position: 'relative' }}
                >
                  <ImageLazy
                    height={'100%'}
                    width={'100%'}
                    src={
                      'https://i0.wp.com/' +
                      bangumi.cover.replace(/^https?:\/\//, '')
                    }
                  />
                  <h4>
                    {bangumi.title}
                    <div className="bangumi-status">
                      <div className="bangumi-status-bar"></div>
                      <p>{bangumi.countText ?? 'N/A'}</p>
                    </div>
                  </h4>
                </a>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default observer(BangumiView)