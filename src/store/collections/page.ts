/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { apiClient } from 'utils'

import { PageModel } from '@mx-space/api-client'

import { Store } from '../helper/base'
import { FetchOption } from '../types/options'

export class PageStore extends Store<PageModel> {
  public slugToIdMap = new Map<string, string>()

  async fetchBySlug(slug: string, options: FetchOption = {}) {
    if (!options.force && this.has(this.slugToIdMap.get(slug)!)) {
      return this.get(this.slugToIdMap.get(slug)!)!
    }
    const data = await apiClient.page.getBySlug(slug)
    this.add(data)
    this.slugToIdMap.set(data.slug, data.id)
    return data
  }
}
