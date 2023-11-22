## EcoMap

1- Configuração de ambiente:
   E necessario instalar as sequintes depedências:
   1 - comandos:
      npm install express
      npm install passport-local
      npm install passport
      npm install bcryptjs
      npm install connect-flash
      npm install express-session
      npm install express-handlebars
      npm install mongoose

## Aviso
E necessario que o mongoDb estaja instalado na maquina para o pleno funcionamento da aplicação
Caso tenha o mongoDb configure-o com as informações do seu servidor
   Exemplo: 
      //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://porta_configurada/nome_do_banco_de_dados').then(() => {
            console.log("Conectado ao mongo!");
        }).catch((erro) => {
            console.log("A conexão falhou: " + erro);
        });

   ## obs:
      A porta padrão do mongoDb constuma ser 127.0.0.1.