import cacheJob from './cache'

const CACHE_JOB_SPEC = '0 */2 * * * *'

export default {
  startAll () {
    cacheJob.schedule(CACHE_JOB_SPEC)
  }
}
