const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Recipes', () => {

  before(function(){
    return runServer();
  });

  after(function(){
    return closeServer();
  });

  it('Should list recipes on GET', () => {
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');

        res.body.length.should.be.at.least(1);

        let expectedKeys = ['id', 'name', 'ingredients'];
        res.body.map(item => {
          item.should.be.an('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('Should add an item on POST', () => {
    const newRecipe = {name: 'chicken alfredo', ingredients: ['chicken breast', 'garlic', 'heavy cream', 'parmesan cheese']};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res){
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.an('object');
        res.body.should.include.keys('id', 'ingredients', 'name');
        res.body.should.not.be.null;

        res.body.should.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
      });
  });

  it('should update items on PUT', () => {
    const updateData = {
      name: 'chicken and rice',
      ingredients: ['chicken', 'rice']
    };
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData) 
      })
      .then(function(res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('object');
        res.body.should.deep.equal(updateData);
      });
  });

  it('should delete items on DELETE', () => {
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res){
        res.should.have.status(204);
      });
  });
});