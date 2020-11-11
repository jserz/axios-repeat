import { AxiosRequestConfig, CancelTokenSource } from 'axios';

// 缓存项的数据结构
export interface ICacheItem {
    // urlKey 为请求地址
    urlKey: string;
    // 过期时间，值是时间戳
    expireTime: number;
    // 请求参数
    params: any;
    // 请求响应的 promise，利用 promise 可以多次获取响应结果的特点来缓存数据
    responsePromise: Promise<any>;
}

// 可缓存配置参数
export interface ICacheableOptions {
    // 缓存请求的过期间隔，单位毫秒
    cacheTimeout?: number;
    // 获取数据之后是否能缓存
    isNeedCache?(res: any): boolean;
    // 最多缓存的数据条数, 默认 50 条
    maxCahceNumber?: number;
}

export interface IRequestingUrls {
    [key: string]: boolean;
}

export interface ICancelMap {
    [key: string]: CancelTokenSource
}

// 扩展 AxiosRequestConfig 接口
export interface IAxiosRequestConfigExtend extends AxiosRequestConfig {
    // 是否不能重复请求
    lockable?: boolean;
    // 不能重复提交请求时，是否为入列的提交请求
    isEnqueueSubmit?: boolean;
    // 是否可以取消请求
    cancelable?: boolean;
    // 是否只有切换路由时才可以取消
    onlySwitchRouteCancelable?: boolean;
    // 是否可以缓存请求
    cacheable?: boolean;
    // 是否强制更新缓存
    forceUpdate?: boolean;
}

// 缓存数据函数的参数
export interface ICacheDataArguments {
    // 缓存池
    cachePool: ICacheItem[];
    // 完整的请求地址
    urlKey: string;
    // 可缓存配置参数
    options?: ICacheableOptions;
    // 请求参数
    requestParams: any;
    // 请求响应 Promise
    responsePromise: Promise<any>;
}
