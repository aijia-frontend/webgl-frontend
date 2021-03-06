import JigCmd from '@/common/jigCmd'
import windowJig from './windowJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import NewSymbolHandler from '../handler/newSymbolHandler'
import Vue from 'vue'
const vue = new Vue()

const AddWindow = JigCmd.extend({
  jigType: windowJig,

  initialize (attrs, options) {
    this.attrs = attrs
    this.options = options
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const position = data.position
    data.width = parseInt(CST.mm.toLogical(data.width))
    data.deepth = parseInt(CST.mm.toLogical(data.deepth))
    data.position = CST.toLogical(data.position, { tag: 'point', origin: DataStore.origin })
    data.angle = CST.toLogical(data.angle, { tag: 'angle' })

    const handler = new NewSymbolHandler(this.attrs)
    handler.run(data)

    JigCmd.prototype.onEnd.apply(this, arguments)

    vue.$bus.$emit('addWindow', this.attrs, Object.assign(this.options, { position, wall: null }))
  }
})

export default AddWindow
