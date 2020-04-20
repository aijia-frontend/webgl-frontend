import BaseHandler from './baseHandler'
import DataStore from '../models/dataStore'
import _last from 'lodash/last'
import _cloneDeep from 'lodash/cloneDeep'
import NewAreaHandler from './newAreaHandler'

const NewJointHandler = BaseHandler.extend({
  initialize (attrs) {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  createJoint (data) {
    // data.walls = data.walls.map(item => DataStore.get(item.uid))
    const walls = data.walls.map(item => item.uid)
    const joint = DataStore.create({
      type: 'joint',
      data: {
        position: data.position,
        walls: walls
      }
    })

    this.updateWalls(data.walls, joint)
    this.getChains(joint)
    this.createArea()
    return joint
  },

  updateWalls (walls, joint) {
    walls.forEach(wall => {
      wall.addJoint(joint.uid)
    })
  },

  createArea (joint) {
    this.chains.map(chain => {
      const newAreaHandler = new NewAreaHandler(this.attrs)
      newAreaHandler.run(chain)
    })
  },

  /*
   chain: {
     joints: [],
     walls: []
   }
 */
  getChains (jointStart) {
    this.chains = []
    console.time('chains')
    this.getChain({
      joints: [jointStart],
      walls: []
    })
    console.timeEnd('chains')
    console.log('闭合链路有：', this.chains)
  },

  /*
   *@Date: 2020-04-13
   *@Description: 更新链路
   *@Author: helloc
   *@Params:
   *
   *============== 步骤 ==============
   * 1. 查找下一个节点
   * 2. 若存在下一个节点
   *    a. 若下一个节点与当前链路的第一个节点一样 则结束当前链路，当前链路已闭合
   *    b. 否则 插入节点 继续更新当前链路
   * 3. 结束当前链路，当前链路不会闭合
  */

  getChain (chain) {
    const nextLinks = this.findNextLink(chain)
    if (!nextLinks.length) {
      // 结束，未闭合
    } else {
      nextLinks.forEach(nextLink => {
        const newChain = _cloneDeep(chain)
        if (newChain.joints[0].uid === nextLink.joint.uid) {
          // 结束，闭合
          newChain.walls.push(nextLink.wall)
          this.addColl(this.chains, newChain)
        } else {
          this.addLink(newChain, nextLink)
          // 继续 查找下一环
          this.getChain(newChain)
        }
      })
    }
  },

  addColl (coll, chain) {
    const jointsStr = chain.joints.map(item => item.uid).sort().join('')
    const _chain = coll.find(item => {
      const _jointsStr = item.joints.map(item => item.uid).sort().join('')
      return _jointsStr === jointsStr
    })
    if (!_chain) coll.push(chain)
  },

  addLink (chain, link) {
    chain.joints.push(link.joint)
    chain.walls.push(link.wall)
  },

  /*
   *@Date: 2020-04-13
   *@Description: 获取下一个节点
   *@Author: helloc
   *@Params:
   *
   *============== 步骤 ==============
   * 1. 使用最后一个joint取所有线：过滤掉 jonits没有2个的 和 链路中已存在的
   * 2. 收集每面墙的另一个joint作为下个节点
  */
  findNextLink (chain) {
    const _joint = _last(chain.joints)
    const wall = _last(chain.walls)
    let walls = _joint.walls().filter(item => item.joints().length === 2)
    if (wall) {
      walls = walls.filter(item => item.uid !== wall.uid)
    }
    const joints = []
    walls.forEach(wall => {
      const joint = wall.joints().find(item => item.uid !== _joint.uid)
      joints.push({
        joint,
        wall
      })
    })
    return joints
  },

  run (data) {
    return this.createJoint(data)
  }
})

export default NewJointHandler
