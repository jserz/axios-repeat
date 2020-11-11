import parse from 'url-parse';

// 获取请求的绝对地址
export default function getAbsoluteUrl(url: string): string {
    const parseUrlObj: parse = parse(url);
    return `${parseUrlObj.origin}${parseUrlObj.pathname}`;
}
