const envPath = __dirname + "/../.env";
require('dotenv').config({path:envPath});

const User = require('../schemas/Users'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server');


chai.should();
chai.use(chaiHttp);

let register_details = {
    name: 'test',
    username: 'email@mail.com',
    password: 'password'
};

let login_details = {
    username: 'email@mail.com',
    password: 'password'
};

let movie_details = {
    title: 'testMovie',
    releaseDate: '2011-05-10',
    genre: 'Drama',
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
    title: 'testMovie',
    releaseDate: '2005-01-04',
    genre: 'Horror',
    actors: [
        {
            actorName: 'Actor3',
            characterName: 'Bruce'
        },
        {
            actorName: 'Actor4',
            characterName: 'IP Man'
        },
        {
            actorName: 'Actor5',
            characterName: 'No Man'
        }
    ]
};

describe('Server CRUD Testing', () =>{
    after((done) =>{
        User.deleteOne({name: 'test'}, (err) =>{
            if(err) throw err;
        })
        done();
    });

    describe('Register',()=> {
        it('Should signup a new User and save to DB.', (done) => {
            // signup
            chai.request(server)
                .post('/signup')
                .send(register_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.eql(true);
                    done();
                });
        });
    });

    describe('Sign in', () => {
        it('Should login a saved User and save JWT Token.', (done) => {
            // sign in
            chai.request(server)
                .post('/signin')
                .send(login_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('token');
                    this.token = res.body.token;
                    done();
                });
        });

    });

    describe('Get Movies', () => {
        it('Should get all Movies from DB.', (done) => {
            // Read all movies
            chai.request(server)
                .get('/movies')
                .set('Authorization', this.token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.eql(true);
                    res.body.should.have.property('movies');
                    done();
                });
        });
    });

    describe('Post Movie', ()=> {
        it('Should post a new Movie to DB.', (done) => {
            chai.request(server)
                .post('/movies')
                .set('Authorization', this.token)
                .send(movie_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.eql(true);
                    done();
                });
        });
    });

    describe('Update Movie', () => {
        it('Should find and update a saved Movie in DB.', (done) => {
            chai.request(server)
                .put('/movies')
                .set('Authorization', this.token)
                .send(update_movie)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.eql(true);
                    done();
                });
        });
    });

    describe('Delete Movie', () => {
        it('Should find and delete a saved Movie in DB', (done) => {
            chai.request(server)
                .delete('/movies')
                .set('Authorization', this.token)
                .send({title: 'testMovie'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.eql(true);
                    done();
                });
        });
    });
});