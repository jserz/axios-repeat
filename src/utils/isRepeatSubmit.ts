// 判断是不是重复提交
export default function isRepeatSubmit(value: any): boolean {
    return !!(value && value.__IS_REPEAT_SUBMIT__)
}