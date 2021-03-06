# axios-repeat

对重复的 axios 请求的处理，包括取消请求、锁定请求、缓存请求。

## 功能

-   切换路由时，取消所有未完成的请求
-   重复请求时，取消未完成的前请求
-   锁定请求，防止重复提交请求
-   缓存请求数据

## 安装

```
yarn add axios-repeat

或

npm install axios-repeat
```

## 示例

### 封装 axios

```js
// http.js
import axios from 'axios';
import {
    lockableAxios,
    isRepeatSubmit,
    cancelableAxios,
    isCancel,
    cacheableAxios,
} from 'axios-repeat';

// 适配器，可以是自定义或用 axios 默认的
let adapter = axios.defaults.adapter;
// 锁定请求扩展，锁定请求完成之前不能再发起请求，用于防止重复提交请求
adapter = lockableAxios(adapter);
// 取消请求扩展，如果前一个请求没有完成，后一个请求又发起，则会取消前一个请求
adapter = cancelableAxios(adapter, {
    // 切换路由时，取消所有未完成的请求
    switchRouteCancelable: true,
});
// 缓存请求扩展，如果前一个请求已经完成，同时后一个请求和前一个请求参数相同，则可以取缓存数据
adapter = cacheableAxios(adapter, {
    // 缓存请求的过期间隔，单位毫秒，默认 2分钟（120000ms）
    cacheTimeout: 120000,
    // 获取数据之后是否需要缓存
    isNeedCache: (res) => {
        return res.success;
    },
    // 最多缓存的数据条数, 默认 50 条
    maxCahceNumber: 50,
});

const http = axios.create({ adapter });

export default function ajax(config) {
    return http({ ...config })
        .then((res) => {
            return res.data;
        })
        .catch((error) => {
            if (isCancel(error)) {
                console.log('请求已经取消');
            }
            if (isRepeatSubmit(error)) {
                console.log('请不要重复提交请求');
            }
        });
}
```

### 使用

-   可以取消的请求

```js
import ajax from './http.js'

// 可取消的查询请求
const queryData = data => {
    return ajax({
        url: '/api/query-data'
        method: 'get'
        params: data,
        // 重复时，取消前请求
        repeatCancelable: true,
    });
}

queryData() // 当前请求会被取消

queryData()
```

-   不可重复提交的请求

```js
import ajax from './http.js'

// 可锁定的提交请求
const postData = data => {
    return ajax({
        url: '/api/post-data'
        method: 'post'
        data,
        // 表示不可重复提交
        lockable: true,
    });
}

postData({ a: 'xxx'} );

postData({ a: 'xxx'} ); // 当前请求不能发起

```

-   可缓存的请求

```js
import ajax from './http.js'

// 可缓存的查询请求
const getCity = data => {
    return ajax({
        url: '/api/get-city'
        method: 'get'
        params: data,
        // 表示可以缓存请求
        cacheable: true,
    });
}

getCity().then(() => {
    getCity(); // 当前请求会直接去缓存数据
})


```

## axios-repeat api

### axios 扩展

#### 取消请求扩展

-   cancelableAxios(axiosAdapter, options): 取消请求的扩展
    - axiosAdapter：自定义或用 axios 默认的适配器
    - options
        - switchRouteCancelable：切换路由时，是否取消所有未完成的请求
-   cancelAllAxios(): 取消所有未完成的请求
-   isCancel(error): 判断该请求是否被取消，在 catch 中，通过 error 判断
    - error：报错对象

#### 锁定请求扩展

-   lockableAxios(axiosAdapter): 不能重复提交请求的扩展
    - axiosAdapter：自定义或用 axios 默认的适配器
-   deleteLockedUrl(url): 手动删除请求，入列的提交请求需要使用
    - url：string，请求地址
-   isRepeatSubmit(error): 判断该请求是否因为重复提交被阻止，在 catch 中，通过 error 判断
    - error：报错对象

#### 缓存请求扩展

-   cacheableAxios(axiosAdapter, options)：缓存请求的扩展
    - axiosAdapter：自定义或用 axios 默认的适配器
    - options
        - cacheTimeout：boolean，缓存请求的过期间隔，单位毫秒，默认为 2 分钟（120000 ms）
        - isNeedCache：(res: any) => boolean, 获取数据之后是否能缓存
        - maxCahceNumber: number，最多缓存的数据条数, 默认 50 条
-   deleteCacheItem(url): 删除缓存项
    - url：string，请求地址

## 请求配置（config）

```js

const requestExtensionsConfig = {
    // 重复时，取消未完成的前请求
    repeatCancelable: boolean,
    // 切换路由时，是否取消所有未完成的请求
    switchRouteCancelable: boolean,
    // 是否不能重复提交请求
    lockable: boolean,
    // lockable 为 true 时，该请求是否为入队列的提交请求（就是提交结果需要异步获取），如果是，则提交完成后需要手动删除请求
    isEnqueueSubmit: boolean
    // 是否可以缓存请求
    cacheable: boolean,
    // cacheable 为 true 时，是否强制更新缓存数据
    forceUpdate: boolean,
}

// axios
ajax({
    ...axios.config,
    ...requestExtensionsConfig,
})
```
