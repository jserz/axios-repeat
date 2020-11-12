import cloneDeep from 'lodash.clonedeep';
import deleteCacheItem from './deleteCacheItem';
import { ICacheItem, ICacheDataArguments } from '../types';

// 默认缓存时间为 2 分钟(120000 ms)
export const twoMimutes = 2 * 60 * 1000;

// 添加缓存项
export default function addCacheItem(config: ICacheDataArguments): ICacheItem[] {
    const { cachePool, urlKey, options, requestParams, responsePromise } = config;
    const { cacheTimeout = twoMimutes, maxCahceNumber = 50 } = options || {};
    // 复制缓存池
    const newCachePool: ICacheItem[] = [...cachePool];
    // 删除旧的缓存，防止出现多条同一接口的缓存
    deleteCacheItem(newCachePool, urlKey);
    // 缓存数据达到最大条数时，删除第一条
    if (newCachePool.length === maxCahceNumber) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[axios-repeat]缓存数据已经超过 ${maxCahceNumber} 条，删除最先缓存的数据：${urlKey}`);
        }
        newCachePool.shift();
    }
    // 缓存请求信息
    newCachePool.push({
        urlKey,
        responsePromise,
        params: cloneDeep(requestParams),
        expireTime: Date.now() + (+cacheTimeout || twoMimutes),
    });
    return newCachePool;
}
