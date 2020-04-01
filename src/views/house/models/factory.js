
const Factory = {
  registries: [],
  regist (items) {
    /* eslint-disable no-return-assign */
    items.forEach(item => this.registries[item.type] = item)
  },
  create (item) {
    /* eslint-disable no-new */
    return new this.registries[item.type](item.data)
  }
}

export default Factory
