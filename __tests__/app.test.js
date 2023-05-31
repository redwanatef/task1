const request = require('supertest');
const app = require('../app');

describe("GET /products", () => {
    it('responds with a welcome message', async () => {
        const response = await request(app).get('/products/10/50');
        expect(response.status).toBe(200);
        expect(response.body.totalPages).toBe(20);
    });
})