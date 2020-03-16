import { axios } from '@/utils/request'

/**
 * @description 注册用户
 * @param { name:string,phone:string,pwd:string,code:string }  用户名,手机号,密码,验证码
 * @returns {*}
 */
export function register ({ mobile, password, password2, captcha }) {
  return axios({
    url: '/users',
    method: 'post',
    data: { mobile, password, captcha }
  })
}
