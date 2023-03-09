const { getUserById, register } = require('../api.js') 


test('Responses is an object', () => {
    expect(typeof getUserById()).toBe('object')
})
