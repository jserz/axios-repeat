import { ICacheItem } from '../types';

// 删除缓存项
export default function deleteCacheItem(cachePool: ICacheItem[], urlKey: string): void {
    const findIndex = cachePool.findIndex(item => item.urlKey === urlKey);
    if (findIndex > -1) {
        cachePool.splice(findIndex, 1);
    }
}
