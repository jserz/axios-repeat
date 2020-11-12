import axios, { AxiosAdapter, AxiosPromise } from 'axios';
import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import { v4 as uuidv4 } from '@lukeed/uuid';
import { IAxiosRequestConfigExtend, ICancelMap } from '../types';

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

// 可取消的请求
export function cancelableAxios(adapter: AxiosAdapter): AxiosAdapter {
    return (config: IAxiosRequestConfigExtend): AxiosPromise<any> => {
        const { url, lockable, cancelable, onlySwitchRouteCancelable } = config;
        // 完整的请求地址
        let urlKey: string = getAbsoluteUrl(url || '');
        // 不支持取消或被锁定，直接返回
        if ((!cancelable && !onlySwitchRouteCancelable) || lockable) {
            if (
                lockable &&
                (cancelable || onlySwitchRouteCancelable) &&
                process.env.NODE_ENV === 'development'
            ) {
                console.warn(`[axios-repeat]当前请求被锁定，不能取消请求：${urlKey}`);
            }
            return adapter(config);
        }
        // 只有切换路由时才可以取消，则让 urlKey 唯一 
        if (!cancelable && onlySwitchRouteCancelable) {
            urlKey = `${urlKey}-${uuidv4()}`;
        }
        // 取消未完成的请求
        cancelAxios(urlKey);
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        axiosCancelMap[urlKey] = source;
        config.cancelToken = source.token;
        return adapter(config).finally(() => {
            delete axiosCancelMap[urlKey];
        });
    };
}
