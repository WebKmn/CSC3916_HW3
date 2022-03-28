const envPath = __dirname + "/../.env";
require('dotenv').config({path:envPath});

const User = require('../Users'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server');


chai.should();
chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@mail.com',
    password: 'password'
}

describe('signup sign in with JWT', () =>{
    after((done) =>{
        // db.userList = [];
        User.deleteOne({name: 'test'}, (err, user) =>{
            if(err) throw err;
        })
        done();
    });
    describe('/signup - post, /signin - post',()=>{
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
                           console.log(token);
                            done();
                        });
                });
        });
    });
});