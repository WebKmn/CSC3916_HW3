const envPath = __dirname + "/../.env";
require('dotenv').config({path:envPath});
db = require('../db')();
const chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server');

chai.should();
chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@mail.com',
    password: 'password'
}

describe('signup signin and call movies with JWT', () =>{
    beforeEach((done) =>{
        db.userList = [];
        done();
    });
    after((done) =>{
        db.userList = [];
        done();
    });
    describe('/signup - post, /signin - post, /movies - put',()=>{
        it('should signup, login and save token', (done) =>{
           // signup
            chai.request(server)
                .post('/signup')
                .send(login_details)
                .end((err, res) =>{
                   res.should.have.status(200);
                   res.body.success.should.eql(true);

                   // login and get Token
                    chai.request(server)
                        .post('/signin')
                        .send(login_details)
                        .end((err, res) =>{
                           res.should.have.status(200);
                           res.body.should.have.property('token');

                           let token = res.body.token;
                           // use token to call movie put route
                            chai.request(server)
                                .put('/movies')
                                .set('Authorization', token)
                                .send({echo: ''})
                                .end((err, res) =>{
                                   res.should.have.status(200);
                                   res.body.body.should.have.property('echo');
                                   done();
                                });
                        });
                });
        });
    });
    describe('/movies - delete using basic Auth', () =>{
       it('should delete movie with basic auth', (done) =>{
           let user = {
               username: 'email@mail.com',
               password: 'password'
           };

           db.save(user);
           chai.request(server)
               .delete('/movies')
               .auth('email@mail.com', 'password')
               .send({echo:''})
               .end((err, res) =>{
                   res.should.have.status(200);
                   done();
               });
       });
    });
});