import api from './index'
import { axios } from '@/utils/request'

/**
 * @description 用户登录
 * @returns {*}
 */
export function login (parameter) {
  return axios({
    url: api.Login,
    method: 'post',
    data: parameter
  })
}
export function logout () {
  return axios({
    url: api.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
