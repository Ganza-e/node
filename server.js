import express, { request } from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql'
import bp from 'body-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


dotenv.config()

const app = express()
app.use(bp.json())

// db mysql connection 
const mydb = mysql.createConnection({

    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

mydb.connect(function (err) {
    if (err) throw new Error(err)
    console.log('Mysql Databse connected')
})


app.get('/', function (req, res) {
    res.send('wekcome to our API')
})

// authetication 
// register creating user for first TIME 
app.post('/', function (req, res) {
    const { name, age, email, salary, isActive, password } = req.body;
    // check if user is already in db
    mydb.query('SELECT * FROM users where email = ?', [email],
        async (err, results) => {
            if(err) throw new Error(err)
            if (results.length > 0) {
                return res.status(500).json({ message: 'user already exist ' })
            }

            //hash the password
            const newpassword = await bcrypt.hash(password, 10)

            //save the user in the db 
            mydb.query("INSERT INTO users(name, age, email, salary, isActive,password) VALUES (?,?,?,?,?,?)",
                [name, age, email, salary, isActive, newpassword], (err,results) => {
                    if (err) throw new Error(err)
                    res.status(201).json({ message: 'user created successfully ', results })
                }

            )
        }


    )

})

// log in checking created 
app.post('/login', function (req, res) {

    // check if user is in db
    const { email, password } = req.body;
    // find the user in db 
    mydb.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
        if (err) throw new Error(err)
        if (result.length === 0) return res.status(404).json({ message: 'user not found' })

        const user = result[0];
        // compare the password
        const matchedpassword = await bcrypt.compare(password, user.password)
        if (!matchedpassword) return res.status(404).json({ message: ' invalid credetials' })

   /* middleware: is a function that you can add in your API and act as its functionality when
   you want to prove it in certain action like : API creating  user and add email invitation*/ 

         // a TOKEN is used to verify who is logged in and when the log in expiration will expire 
        // generate a token 
        const token = jwt.sign(
            { id: user.id ,email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: '3hr' }
        )

        res.status(200).json({ message: ' login succefully ', token })

    })
}
)

// middleware to verify token 
const verifyToken = (req,res,next)=>{
const authHeader = req.headers['authorization']
if(!authHeader) return res.status(401).json({message:'no token provided'})

    const token = authHeader.split(' ')[1]
    if(!authHeader) return res.status(401).json({message:'no token provided'}) 
 
    
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
    if (err)return res.status(401).json({message:'invalid token '})
       req.user = decoded// attach our user to a request
    next()// execute our real API function after these checks // allow request 
    
    
})




}




// GET all users(students)

app.get('/users', function (req, res) {

    mydb.query('select * from users', (err, results) => {
        if (err) throw new Error(err)
        res.json({ message: 'Got users ', results })
    })
})

// app.post('/users',function(req,res){
//     const {id,name,age,salary,isActive} = req.body
//     mydb.query('insert into users (id,name,age,salary,isActive) values(?,?,?,?,?)',[id,name,age,salary,isActive],(err,results)=>{
//         if(err) throw new Error(err)
//         res.json({message: 'Added a user',results})
//     })
// })

app.get('/users/:id'), function (request, response) {
    const_id = request.params.id;
    const { name, age, salary, isActive, } = response.body
    mydb.querry('select * from user where id = ?', [id], (error, results) => {
        if (err) throw new error(err)
        response.json({ message: 'added user', results })
    })
}

app.get('/users/:id'), function (request, response) {
    const_id = request.params.id;
    const { name, age, salary, isActive, } = response.body
    mydb.query('UPDATE users SET name=?, age=?, salary=?, isActive=?, WHERE id = ?'
        , [id, name, age, salary, isActive], (err, results) => {
            if (err) throw new error(err)
            response.json({ message: 'updated  user', results })
        }
    )
}

app.get('/users/:id', function (req, res) {
    const id = req.params.id
    mydb.query('select * from users where id = ?', [id], (error, results) => {
        if (error) throw new Error(error)
        res.json({ message: 'Added a user', results })
    })
})

app.put('/users/:id',verifyToken, function (req, res) {
    const id = req.params.id;
    const { name, age, salary, isActive } = req.body
    mydb.query('UPDATE users SET name=?, age=?, salary=?, isActive=? WHERE id =?'
        , [name, age, salary, isActive, id], (err, results) => {
            if (err) throw new Error(err)
            res.json({ message: 'updated a user', results })
        })
})

// app.delete

app.delete('/users/:id', function (req, res) {
    const id = req.params.id
    mydb.query('DELETE from  users where id= ?', [id], (err, results) => {
        if (err) throw new Error(err)
        res.json({ message: 'deleted a user', results })

    })
})


app.listen(process.env.PORT, function () {
    console.log('server is running on port 5000')
});