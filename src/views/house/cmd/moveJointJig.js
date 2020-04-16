import MoveJig from './moveJig'

const MoveJointJig = MoveJig.extend({
  initialize () {
    MoveJig.prototype.initialize.apply(this, arguments)
  }
})

export default MoveJointJig
