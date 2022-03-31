const envPath = __dirname + "/../.env";
require('dotenv').config({path:envPath});

const User = require('../schemas/Users'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server');


chai.should();
chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@mail.com',
    password: 'password'
};

let movie_details = {
    title: 'testMovie5',
    releaseDate: '2011-05-10',
    genre: 'Thriller',
    actors: [
        {
            actorName: 'Actor1',
            characterName: 'Galaxy Man'
        },
        {
            actorName: 'Actor2',
            characterName: 'Pixel Man'
        },
        {
            actorName: 'Actor3',
            characterName: 'iPhone Man'
        }
    ]
};

let update_movie = {
    title: 'testMovie2',
    releaseDate: '2005-01-04',
    genre: 'Thriller',
    actors: [
        {
            actorName: 'Actor1',
            characterName: 'Galaxy Man'
        },
        {
            actorName: 'Actor2',
            characterName: 'Pixel Man'
        },
        {
            actorName: 'Actor3',
            characterName: 'No name Man'
        }
    ]
};

describe('signup sign in with JWT', () =>{
    after((done) =>{
        User.deleteOne({name: 'test'}, (err) =>{
            if(err) throw err;
        })
        done();
    });
    describe('/signup, /signin, CRUD - /movies',()=> {
        it('signup, login,save token and use it on /movies', (done) => {
           // signup
            chai.request(server)
                .post('/signup')
                .send(login_details)
                .end((err, res) => {
                   res.should.have.status(200);
                   res.body.success.should.eql(true);

                   // login and get Token
                    chai.request(server)
                        .post('/signin')
                        .send(login_details)
                        .end((err, res) => {
                           res.should.have.status(200);
                           res.body.should.have.property('token');
                           let token = res.body.token;

                           // use token for CRUD on movies routes
                            // Creat and save a movie
                           chai.request(server)
                               .post('/movies')
                               .set('Authorization', token)
                               .send(movie_details)
                               .end((err, res) => {
                                   res.should.have.status(200);
                                   res.body.success.should.eql(true);
                                   // done();
                               });

                            // Read and get all movies
                            chai.request(server)
                                .get('/movies')
                                .set('Authorization', token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.success.should.eql(true);
                                    res.body.should.have.property('movies');
                                    // done();
                                });

                            // Delete a movie
                            chai.request(server)
                                .delete('/movies')
                                .set('Authorization', token)
                                .send({title: 'testMovie5'})
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.success.should.eql(true);
                                    // done();
                                });

                            // Update a movie
                            chai.request(server)
                                .put('/movies')
                                .set('Authorization', token)
                                .send(update_movie)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.success.should.eql(true);
                                    done();
                                });
                        });
                });
        });
    });
});