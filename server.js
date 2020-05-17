const express = require('express')
const server = express()

const db = require("./db")

server.use(express.static('public'))
server.use(express.urlencoded({ extended: true}))

const nunjucks = require("nunjucks")
nunjucks.configure("views", {
    express: server,
    noCache: true,
})

server.get("/", function (req, res) {

    db.all(`SELECT * FROM ideas`, function (err, rows) {
        if (err) {
            console.log(err)
            res.send("Erro no banco de dados!")
        }

        const reverseIdeas = [...rows].reverse()

        let lastIdeas = []
        for (let idea of reverseIdeas) {
            if (lastIdeas.length < 2) {
                lastIdeas.push(idea)
            }
        }
        return res.render("index.html", { ideas: lastIdeas })
    })
})

server.get("/ideas", function (req, res) {
    db.all(`SELECT * FROM ideas`, function (err, rows) {
        if (err) {
            console.log(err)
            res.send("Erro no banco de dados!")
        }

        const reverseIdeas = [...rows].reverse()

        return res.render("ideias.html", { ideas: reverseIdeas })
    })
})

server.post("/createIdea", function(req, res){
    const data = req.body

    // Inserir dado na tabela
    const query = `INSERT INTO ideas(
            image,
            title,
            category,
            description,
            link
        ) VALUES (?, ?, ?, ?, ?);`

    const values = [
        data.image,
        data.title,
        data.category,
        data.description,
        data.link
    ]

    db.run(query, values, function(err){
        if (err) {
            console.log(err)
            res.send("Erro no banco de dados!")
        }

        return res.redirect("/ideas")
    })
})

server.get("/deleteIdea/:id", function(req, res){
    // Deletar dado na tabela
    db.run(`DELETE FROM ideas WHERE id = ?`, [req.params.id], function (err) {
        if (err) {
            console.log(err)
            res.send("Erro no banco de dados!")
        }

        return res.redirect("/ideas")
    })
})

server.listen(process.env.PORT)