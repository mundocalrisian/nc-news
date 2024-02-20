const app = require('../app.js')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data/index.js')
const db = require('../db/connection.js')

beforeEach(() => seed(data))
afterAll(() => db.end)

describe('APP', () => {
    describe('GET /api/healthcheck', () => {
        test('should respond with a 200 status and a message confirming functionality', () => {
            return request(app)
            .get('/api/healthcheck')
            .expect(200)
            .then((repsonse) => {
                expect(repsonse.body).toHaveProperty('msg', 'Healthcheck ok')
            })
        });
    });
    describe('GET /api/topics', () => {
        test('should repsond with a 200 status', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response) => {
                expect(response.body).toHaveProperty('topics')
                const topicsArray = response.body.topics
                expect(topicsArray).toHaveLength(3)
                topicsArray.forEach((topic) => {
                    expect(topic).toHaveProperty('description', expect.any(String))
                    expect(topic).toHaveProperty('slug', expect.any(String))
                })
            })
        });
    });
    describe('GET /api', () => {
        test('should return an object with all available endpoints and a description, query and example', () => {
            return request(app)
            .get('/api')
            .expect(200)
            .then((response) => {
                const endpointsObj = response.body.endpoints
                expect(endpointsObj).toHaveProperty('GET /api', expect.any(Object))
                expect(endpointsObj).toHaveProperty('GET /api/topics', expect.any(Object))
                expect(endpointsObj).toHaveProperty('GET /api/articles', expect.any(Object))
                for (const endpoint in endpointsObj) {
                    expect(endpointsObj[endpoint]).toHaveProperty('description', expect.any(String))
                    expect(endpointsObj[endpoint]).toHaveProperty('queries', expect.any(Array))
                    expect(endpointsObj[endpoint]).toHaveProperty('exampleResponse', expect.any(Object))
                }
            })
        });
    });
    describe('GET /api/articles/:article_id', () => {
        test('should repsond with a status 200 and an object with the appropriate keys', () => {
            return request(app)
            .get('/api/articles/3')
            .expect(200)
            .then((response) => {
                expect(response.body.article).toHaveProperty('author', expect.any(String))
                expect(response.body.article).toHaveProperty('title', expect.any(String))
                expect(response.body.article).toHaveProperty('article_id', 3)
                expect(response.body.article).toHaveProperty('body', expect.any(String))
                expect(response.body.article).toHaveProperty('topic', expect.any(String))
                expect(response.body.article).toHaveProperty('created_at', expect.any(String))
                expect(response.body.article).toHaveProperty('votes', expect.any(Number))
                expect(response.body.article).toHaveProperty('article_img_url', expect.any(String))
        })
    });
        test('should repsond with a 404 status when a valid but non-existent id is requested', () => {
            return request(app)
            .get('/api/articles/99999')
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('article does not exist')
            })
        });
        test('should repsond with a 400 status when an invalid endpoint is requested', () => {
            return request(app)
            .get('/api/articles/not_an_article')
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request')
            })
        });
    });
    describe('GET /api/articles', () => {
        test('should respond with a 200 status and an array of article objects with the appropriate keys', () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then((response) => {
                expect(response.body).toHaveProperty('articles')
                const articlesArray = response.body.articles
                expect(articlesArray.length).toBe(13)
                articlesArray.forEach((article) => {
                    const expectedArticle = {
                        'author': expect.any(String),
                        'title': expect.any(String),
                        'article_id': expect.any(Number),
                        'topic': expect.any(String),
                        'created_at': expect.any(String),
                        'votes': expect.any(Number),
                        'article_img_url': expect.any(String),
                        'comment_count': expect.any(Number)
                    }
                    expect(article).toMatchObject(expectedArticle)
                    expect(article).not.toHaveProperty('body')
                })
                expect(articlesArray).toBeSortedBy('created_at', {descending: true})
            })
        });
    });
});