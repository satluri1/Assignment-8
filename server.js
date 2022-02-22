var express = require('express');
var app = express();
var port = 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
var mariadb = require('mariadb');
app.use(express.json());
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const axios = require('axios');

const pool = mariadb.createPool({
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'sample',
   port: 3306,
   connectionLimit: 5
});

const options = {
    swaggerDefinition: {
      info: {
        title: 'Assignment 08',
        version: '1.0.0',
        description: 'ITIS-6177 Assignment-8',
      },
      host:'157.245.91.188:3000',
      basePath: '/',
    },
    apis: ['./server.js'],
  };

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());

/**
 * @swagger
 * /company:
 *     get: 
 *       description: Fetch all companies
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all companies from the company table
 *           500:
 *              description: Internal server error
 * 
 */

app.get('/company', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from company")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        })
    });
    
});

/**
 * @swagger
 * /foods:
 *     get: 
 *       description: Fetch all food details
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all food details from the foods table
 *           500:
 *              description: Internal server error
 * 
 */

 app.get('/foods', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from foods")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        })
    });
    
});

/**
 * @swagger
 * /student:
 *     get: 
 *       description: Fetch all students
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all students from the student table
 *           500:
 *              description: Internal server error
 * 
 */

 app.get('/student', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from student")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        })
    });
    
});

/**
 * @swagger
 * definitions:
 *  Company:
 *   type: object
 *   properties:
 *    id:
 *     type: string
 *     description: Id of the company
 *     example: '123'
 *    name:
 *     type: string
 *     description: name of the company
 *     example: 'Tata'
 *    City:
 *     type: string
 *     description: city where company located
 *     example: 'Hyderabad'
 *  Company_for_update:
 *   type: object
 *   properties:
 *    name:
 *     type: string
 *     description: name of the company
 *     example: 'Tata'
 *    City:
 *     type: string
 *     description: city where company located
 *     example: 'Hyderabad'
 */

/**
 * @swagger
 * /company:
 *  post:
 *   summary: create company
 *   description: Insert new record in company table
 *   parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      description: body of the company
 *      schema:
 *       $ref: '#/definitions/Company'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/Company'
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */


 app.post('/company',

 check('id').isLength({
    max: 6
}).withMessage('Id  should have max length of 6').not().isEmpty().trim(),
check('name').isLength({
    max: 25
}).withMessage('Company name should have max length of 25').not().isEmpty().trim(),
check('City').isLength({
    max: 25
}).withMessage('Company city should have max length of 25').not().isEmpty().trim(),
 
 (req, res) => {
    const errors = validationResult(req);
    const { id, name, City } = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }


    pool.getConnection()
    .then(conn => {
        conn.query(`select * from company where company_id = '${id}'`).then((result) => {
            if(result.length > 0){    
            res.json("Comapany Id already existed");
          }
          else {
    
      conn.query('INSERT INTO `company` (`COMPANY_ID`, `COMPANY_NAME`, `COMPANY_CITY`) VALUES (?, ?, ?)',
      [id, name, City])
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        })
    }
    });
});
});

/**
 * @swagger
 * /company/{companyid}:
 *  delete:
 *   summary: delete company
 *   description: delete record from company table
 *   parameters:
 *    - in: path
 *      name: companyid
 *      schema:
 *       type: String
 *      required: true
 *      description: id of the company
 *      example: '123'
 *   responses:
 *    200:
 *     description: Record deleted
 *    500:
 *     description: Error occured while deleting
 */

 app.delete('/company/:companyid', 
 check('companyid').isLength({
    max: 6
}).withMessage('Id  should have max length of 6').not().isEmpty().trim(),
 
 (req, res) => {
   const id =  req.params.companyid
    //const { id, name, City } = req.body;
   // console.log("Id: " + id);
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({
        
        errors: errors.array()
    });
}
  


    pool.getConnection()
    .then(conn => {
        conn.query(`select * from company where company_id = '${id}'`).then((result) => {
            if(result.length == 0){    
            res.json("Comapany not found");
          }
          else {
    
      conn.query(`DELETE FROM company WHERE company_id = '${id}'`)
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        })
    
}
});
});
 });


/**
 * @swagger
 * /company:
 *  put:
 *   summary: create or update company
 *   description: create or update record in company table
 *   parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      description: body of the company
 *      schema:
 *       $ref: '#/definitions/Company'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/Company'
 *   responses:
 *    200:
 *     description: created or updated successfully
 *    500:
 *     description : error occured while creating or updating
 */

 app.put('/company', 
 
 check('id').isLength({
    max: 6
}).withMessage('Id  should have max length of 6').not().isEmpty().trim(),
check('name').isLength({
    max: 25
}).withMessage('Company name should have max length of 25').not().isEmpty().trim(),
check('City').isLength({
    max: 25
}).withMessage('Company city should have max length of 25').not().isEmpty().trim(),
 
 
 
 (req, res) => {
    console.log(req.body);
    const { id, name, City } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }



    pool.getConnection()
    .then(conn => {

      conn.query(`select * from company where company_id = '${id}'`).then((result) => {
      if(result.length == 0){    
      conn.query('INSERT INTO `company` (`COMPANY_ID`, `COMPANY_NAME`, `COMPANY_CITY`) VALUES (?, ?, ?)',
      [id, name, City])
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        });
    }
    else {
        conn.query(`update company set company_name = '${name}', company_city = '${City}' where company_id = '${id}'`)
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-By', 'SR');
          res.json(rows);
        });

    }
    });
});
});

/**
 * @swagger
 * /company/{companyid}:
 *    patch:
 *      description: Update a record from company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Updated record from company table
 *          500:
 *              descriptiom: Error occured while updating 
 *      parameters:
 *          - name: companyid
 *            in: path
 *            required: true
 *            type: string
 *          - name: company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company_for_update'
 *
 */

app.patch('/company/:companyid', 

   
check('companyid').isLength({
    max: 6
}).withMessage('Id  should have max length of 6').not().isEmpty().trim(),
check('name').isLength({
    max: 25
}).withMessage('Company name should have max length of 25').not().trim(),
check('City').isLength({
    max: 25
}).withMessage('Company city should have max length of 25').not().trim(),
   



    (req, res) => {



    const id =  req.params.companyid
    const { name, City } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }
    
    

    pool.getConnection()
    .then(conn => {
    conn.query(`select * from company where company_id = '${id}'`).then((result) => {
        if(result.length == 0){    
        res.json("Comapany Not found, Please enter valid one");
      }
      else {

        if(name && City) {
          conn.query(`update company set company_name = '${name}', company_city = '${City}' where company_id = '${id}'`)
          .then((rows) => {
            console.log(rows); 
            res.setHeader('Content-Type','Application/json');
            res.setHeader('Created-By', 'SR');
            res.json(rows);
          }); }

          if(name && !City) {
            conn.query(`update company set company_name = '${name}' where company_id = '${id}'`)
            .then((rows) => {
              console.log(rows); 
              res.setHeader('Content-Type','Application/json');
              res.setHeader('Created-By', 'SR');
              res.json(rows);
            }); }

            if(City && !name) {
                conn.query(`update company set company_city = '${City}' where company_id = '${id}'`)
                .then((rows) => {
                  console.log(rows); 
                  res.setHeader('Content-Type','Application/json');
                  res.setHeader('Created-By', 'SR');
                  res.json(rows);
                }); }
  
      }
      });
    }); 


   });



app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
    }); 
