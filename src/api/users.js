import { axios } from '@/utils/request'
const api = {
  users: '/users'
}

export default api
/**
 * @description 查询所有用户
 */
export function queryUsers (parameter = {}) {
  return axios({
    url: '/queryPagingList',
    method: 'get',
    params: parameter
  })
}

export function enDisabledUser (parameter) {
  return axios({
    url: '/enDisabledUser',
    method: 'post',
    data: parameter
  })
}

export function destroy (id) {
  return axios({
    url: `/users/${id}`,
    method: 'delete'
  })
}
