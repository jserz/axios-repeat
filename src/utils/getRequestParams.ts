import parse from 'url-parse';

// 获取请求参数
export default function getRequestParams(url: string, method: string, postData: any, params?: any): any {
    const parseUrlObj: parse = parse(url);
    // 获取查询参数
    const queryParams = { ...parseUrlObj.query, ...(params || {}) };
    const requestParams = method.toLowerCase() === 'get' ? queryParams : postData;
    return requestParams;
}
