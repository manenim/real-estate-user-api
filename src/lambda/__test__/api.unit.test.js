const {  getUserById  } = require('../api.js') 


test('Responses is an object', () => {
    expect(typeof getUserById()).toBe('object')
})
