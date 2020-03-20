const factory = {
  registries: [],
  regist (items) {
    /* eslint-disable no-return-assign */
    items.forEach(item => this.registries[item.type] = item.handler)
  },
  create (item) {
    /* eslint-disable no-new */
    new this.registries[item.type]()
  }
}

export default factory
