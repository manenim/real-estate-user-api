const { getUserById, register } = require('../api.js') 


test('Responses is an object', () => {
    expect(typeof getUserById()).toBe('object')
})


describe('API functions', () => {
    let mockEvent;

    beforeEach(() => {
        mockEvent = {
            body: JSON.stringify({
                userId: '1234',
                name: 'Test User',
                email: 'test@test.com',
                role: 'renter',
                propertyId: 'abcd'
            }),
            pathParameters: {
                userId: '1234',
                propertyId: 'abcd'
            }
        };
    });

    describe('register()', () => {
        it('should create a user', async () => {
            const response = await register(mockEvent);
            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toMatchObject({
                message: 'Successfully created user.'
            });
        });
    });
});
