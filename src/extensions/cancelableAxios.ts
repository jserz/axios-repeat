import { v4 as uuidv4 } from '@lukeed/uuid';
import axios, { AxiosAdapter, AxiosPromise, AxiosResponse } from 'axios';
import { IAxiosRequestConfigExtend, ICancelMap } from '../types';
import getAbsoluteUrl from '../utils/getAbsoluteUrl';

// 保存未完成的请求的取消对象
const axiosCancelMap: ICancelMap = {};
// 取消未完成的请求
function cancelAxios(key: string): void {
    if (axiosCancelMap[key]) {
        axiosCancelMap[key].cancel('isCanceledRequest');
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[axios-repeat]请求已被取消：${key}`);
        }
        delete axiosCancelMap[key];
    }
}
// 取消所有的请求，一般用于路由切换时，取消前一个路由未完成的请求
export function cancelAllAxios(): void {
    const axiosKeys = Object.keys(axiosCancelMap);
    axiosKeys.forEach((key) => {
        cancelAxios(key);
    });
}

//判断请求是否被取消
export function isCancel(value: any) {
    return axios.isCancel(value);
}

// 监控路由变化
function listenHrefChange() {
    let oldHref = document.location.href;
    window.addEventListener('load', () => {
        const body = document.querySelector('body');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (oldHref != document.location.href) {
                    oldHref = document.location.href;
                    // 取消所有未完成的请求
                    cancelAllAxios();
                }
            });
        });

        const config = {
            childList: true,
            subtree: true,
        };

        body && observer.observe(body, config);
    });
}
interface IOptions {
    // 切换路由时，是否可以取消所有未完成的请求
    switchRouteCancelable?: boolean;
}

// 可取消的请求
export function cancelableAxios(adapter: AxiosAdapter, options?: IOptions): AxiosAdapter {
    if (options?.switchRouteCancelable) {
        listenHrefChange();
    }
    return (config: IAxiosRequestConfigExtend): AxiosPromise<any> => {
        const { url, lockable, repeatCancelable } = config;
        const switchRouteCancelable =
            config.switchRouteCancelable === undefined
                ? options?.switchRouteCancelable
                : config.switchRouteCancelable;
        // 完整的请求地址
        let urlKey: string = getAbsoluteUrl(url || '');
        // 不支持取消或被锁定，直接返回
        if ((!repeatCancelable && !switchRouteCancelable) || lockable) {
            if (lockable && repeatCancelable && process.env.NODE_ENV === 'development') {
                console.warn(`[axios-repeat]当前请求被锁定，不能取消请求：${urlKey}`);
            }
            return adapter(config);
        }
        // 只有切换路由时才可以取消，则让 urlKey 唯一
        if (!repeatCancelable && switchRouteCancelable) {
            urlKey = `${urlKey}-${uuidv4()}`;
        }
        // 取消未完成的请求
        cancelAxios(urlKey);
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        axiosCancelMap[urlKey] = source;
        config.cancelToken = source.token;
        return adapter(config).then((res: AxiosResponse<any>) => {
            delete axiosCancelMap[urlKey];
            return res;
        });
    };
}
