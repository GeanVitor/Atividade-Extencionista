const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const {isAdmin} = require("../helpers/isAdmin");


//Rota para exibir todos os usários
router.get('/admin', isAdmin, (req, res) => {
    router.get('/categorias', isAdmin, (req, res) => {
        Categoria.find().sort({ date: 'desc' }).then((categorias) => {
            res.render('admin/index', { categorias: categorias });
        }).catch((error) => {
            req.flash("errorr_msg", "Houve um error ao listar as categorias!");
            res.redirect('/admin');
        });
    });
});


// Config Categorias 
    // Rota que exibe a lista de categorias
    router.get('/categorias', isAdmin, (req, res) => {
        Categoria.find().sort({date: 'desc'}).then((categorias) =>{
            res.render('admin/categorias', {categorias: categorias});
        }).catch((error) => {
        req.flash("errorr_msg" , "Houve um error ao listar as categorias!");
        res.redirect('/admin'); 
        });
    });

    // Rota para o formulario de criação de categorias
    router.get('/categorias/add', isAdmin, (req, res) => {
        res.render('admin/addcategorias');
    });

    // Apagar Categorias
    router.post('/categorias/deletar', isAdmin, (req, res) => {
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect('/admin/categorias');
        }).catch((error) => {
            req.flash("errorr_msg", "Houve um error ao remover a categoria!");
            res.redirect('/admin/categorias');
        })
    });

    // Editar Categorias
    router.get('/categorias/edit/:id', isAdmin, (req, res) => {
        Categoria.findOne({_id: req.params.id}).then((categoria) => {
            res.render("admin/editcategorias", {categoria: categoria});
        }).catch((error) => {
            req.flash("error_msg" , "Esta categoria não existe!" + error);
            res.redirect("/admin/categorias");
        });
    });

    // Rota auxiliar de edição de categorias
    router.post('/categorias/edit', isAdmin, (req, res) => {
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect('/admin/categorias');
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria" + error);
                res.redirect('/admin/categorias');
            })
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria!" + error);
            res.redirect('/admin/categorias');
        })
    })

    // Rota para criar uma nova categoria
    router.post('/categorias/nova', isAdmin, (req, res) => {
        // Validações
        var erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome invalido!"});
        }
        if(req.body.slug && (typeof req.body.slug == undefined || req.body.slug == null)){
            erros.push({texto: "descrição  invalida!"})
        }
        if(req.body.nome.length < 2){
            erros.push({texto: "Nome da categoria muito pequeno!"});
        }
        if(erros.length > 0){
            res.render("admin/addcategorias", {erros: erros});
        } else {
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg", "Categoria criada com sucesso!");
                res.redirect("/admin/categorias");
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!" + error);
                res.redirect("/admin");
            });
        }
    });
// Config Postagens
    // Rota para renderizar a pagina de postagens
    router.get("/postagens",  isAdmin, (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).limit(5).then((postagens) => {
            res.render("admin/postagens", {postagens: postagens});
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao listar as postagens! " + error);
            res.redirect('/admin');
        })
        
    });
    
    // Rota para renderizar a pagina de adicionar postagens
    router.get("/postagens/add", isAdmin, (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("admin/addpostagem", {categorias: categorias});
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulario");
            res.redirect('/admin');
        });
    });

    // Rota para criar uma nova postagem
    router.post("/postagens/nova", isAdmin, (req, res) => {
        var erros = [];
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria invalida, registre uma categoria"});
        }
        if(erros.length > 0){
            res.render("admin/addpostagem", {erros: erros});
        } else {
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }
            new Postagem(novaPostagem).save().then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch((erro) => {
                req.flash("erros_msg", "Houve um erro ao criar a postagem");
                res.redirect("/admin/postagens");
            });
        }
    });

    // Rota para o formulario de editar as categorias
    router.get("/postagens/edit/:id", isAdmin, (req, res) => {
        Postagem.findOne({_id: req.params.id}).then((postagem) => {
            Categoria.find().then((categorias) => {
                res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao listar as categorias " + error);
                res.redirect("/admin/postagens")
            });
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulario de edição! " + error);
            res.redirect('/admin/postagens');
        });
    });

    // Rota para aplicar as edições
    router.post("/postagem/edit", isAdmin, (req, res) => {
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            postagem.save().then(() => {
                req.flash("success_msg", "Postagem atualizada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/admin/psotagens");
            })
        }).catch((error) => {
            req.flash("error_msg" , "Houve um erro ao salvar a postagem " + error)
            res.redirect('/admin/postagens');
        });
    });

    // Rota para deletar postagens
    router.get("/postagens/deletar/:id", isAdmin, (req, res) => {
        Postagem.deleteOne({_id: req.params.id}).then(() => {
            req.flash("success_msg", "Postagem deletada!");
            res.redirect("/admin/postagens");
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno: " + error);
            res.redirect("/admin/postagens");
        });
    });

module.exports = router