const express = require("express");
const router = express.Router()
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport")

router.get("/registros", (req, res) => {
    res.render("usuarios/registros")
});

// Rota para criação de usuarios
router.post("/registros", (req, res) => {
    var erros = [];
    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
        erros.push({texto: "Nome invalido"});
    }
    if (!req.body.email || typeof req.body.email === undefined || req.body.email === null){
        erros.push({texto: "Email invalido"});
    }
    if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null){
        erros.push({texto: "Senha invalido"});
    }
    if (req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"});
    }
    if (req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente!!"});
    }
    if(erros.length > 0){
        res.render("usuarios/registros", {erros: erros}); 
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (usuario){
                req.flash("error_msg", "Já existe uma conta com este email nos nossos registros!");
                res.redirect("/usuarios/registros");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (error , hash) => {
                        if(error){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario");
                            res.redirect("/");
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario salvo com sucesso!!");
                            res.redirect("/");
                        }).catch((error) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuario: " + error);
                            res.redirect("/usuarios/registros")
                        })
                    })
                })
            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
    }
});

// Rota para a pagina de fale consosco
router.get("/sac", (req, res) => {
    try {
        res.render("usuarios/sac");
    } catch (error) {
        req.flash("error_msg", "A página não pode ser encontrada.");
        res.redirect("/");
    }
});

// Rota de loguin
router.get("/loguin" , (req, res) => {
    res.render("usuarios/loguin");
});

router.post("/loguin", (req, res , next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "usuarios/registros",
        failureFlash: true
    })(req, res, next)
})

// Rota de logout
router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/");
        }
        req.flash("success_msg", "Você saiu, até breve!");
        res.redirect("/");
    });
});

module.exports = router