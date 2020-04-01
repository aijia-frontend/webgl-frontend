const maxFromBits = (bits) => {
  return Math.pow(2, bits)
}

// const limitUI04 = maxFromBits(4)
const limitUI06 = maxFromBits(6)
const limitUI08 = maxFromBits(8)
const limitUI12 = maxFromBits(12)
// const limitUI14 = maxFromBits(14)
const limitUI16 = maxFromBits(16)
const limitUI32 = maxFromBits(32)
// const limitUI40 = maxFromBits(40)
// const limitUI48 = maxFromBits(48)

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomUI06 = () => {
  return getRandomInt(0, limitUI06 - 1)
}

const randomUI08 = () => {
  return getRandomInt(0, limitUI08 - 1)
}

const randomUI12 = () => {
  return getRandomInt(0, limitUI12 - 1)
}

const randomUI16 = () => {
  return getRandomInt(0, limitUI16 - 1)
}

const randomUI32 = () => {
  return getRandomInt(0, limitUI32 - 1)
}

const randomUI48 = () => {
  return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 48 - 30)) * (1 << 30)
}

const paddedString = (string, length, z) => {
  string = String(string)
  z = (!z) ? '0' : z
  let i = length - string.length
  for (; i > 0; i >>>= 1, z += z) {
    if (i & 1) {
      string = z + string
    }
  }
  return string
}

const fromParts = (timeLow, timeMid, timeHiAndVersion, clockSeqHiAndReserved, clockSeqLow, node) => {
  const hex = paddedString(timeLow.toString(16), 8) +
          '-' +
          paddedString(timeMid.toString(16), 4) +
          '-' +
          paddedString(timeHiAndVersion.toString(16), 4) +
          '-' +
          paddedString(clockSeqHiAndReserved.toString(16), 2) +
          paddedString(clockSeqLow.toString(16), 2) +
          '-' +
          paddedString(node.toString(16), 12)
  return hex
}

const UUID = {
  generate: () => {
    return fromParts(
      randomUI32(),
      randomUI16(),
      0x4000 | randomUI12(),
      0x80 | randomUI06(),
      randomUI08(),
      randomUI48()
    )
  },

  // addition by Ka-Jan to test for validity
  // Based on: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
  validate: (uuid) => {
    const testPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return testPattern.test(uuid)
  }
}

export default UUID
