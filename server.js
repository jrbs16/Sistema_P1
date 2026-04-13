// impoprtação do micro framwork fastify
import {fastify} from 'fastify'; 
//importação do banco de dados local
import {DatabaseMemory} from './database-memory.js';
//instanciar o banco de dados 
const database = new DatabaseMemory();

// instanciar o meu servidor de aplicação
const server = fastify();

//criar um endpoint default (padrão)
// testar se minha aplicação está no ar
server.get('/',()=>{
    console.log('Iniciando a API !!');
    return 'API da biblioteca está em execução !!';
})
// Endpoint para livros
// GET -> Listar livros
// POST -> Inserir livros
// PUT -> Alterar livros
// DELETE -> Remover livros

//Listar livros
server.get('/books',(request,response)=>{
    //request.query -> parâmetros de consulta enviados pelo cliente
    const {search} = request.query;
    console.log('Listando os livros !!');
    return database.list(search);
})

//Listar o total de livros
server.get('/books/count',(request,response)=>{
    const totalBooks = database.list().length;
    return {total: totalBooks};
})

//Listar os livros emprestados
server.get('/books/borrowed',(request,response)=>{
    const borrowedBooks = database.list().filter((book) => !book.available);
    return borrowedBooks;
})
//Inserir livros
//request -> recebe os dados enviados pelo cliente
//response ->retorno algo para o cliente
server.post('/books',(request, response)=>{

    const{title,author,year,category} = request.body;

    //400 -> parâmetros obrigatórios
    if (!title || !author || !year || !category){
        return response.status(400).send({
            message: 'title, author, year e category são obrigatórios' });
    }

    //year número e >0
    if (Number(year)<=0){
        return response.status(400).send({
            message: 'year deve ser um número maior que zero' });   
    }

    //verificar e existe duplicidade
    const existingBook = database.list().find((book) =>{
        return (
            book.title.toLowerCase() === title.toLowerCase() &&
            book.author.toLowerCase() === author.toLowerCase()
        )
    })

    if (existingBook){
        return response.status(400).send({
            message: 'Já existe um livro com o mesmo título e autor' });
    }
    //nome da coluna no banco de dados: dados enviados na requisição
    database.create({
        title: title, 
        author: author,
        year: Number(year),
        category: category,
        available: true,
        borrowedBy: null
    });
    // retorno um código
    // 201 -< Dados inserido ou alterado com sucesso
    return response.status(201).send();
})

//atualização de livros
server.put('/books/:bookId',(request,response)=>{
    //pegar o Id do livro a ser atulizado
    //request.body -> dados enviados pelo cliente
    //request.params -> parâmetros dinamicos da rota
    const {bookId}= request.params; 
    //pegar os dados do livro a ser atualizado
    const {title,author,year,category}=request.body;

    //verificar se o livro existe
    const book=database.findById(bookId);
    if(!book){
        //404 -informação errada/não encontrada
        return response.status(404).send({
            message: 'Livro não encontrado'
        });
    }

    //Livro existe, posso atualizar
    database.update(bookId,{
        ...book,
        title:title,
        author:author,
        year:Number(year),
        category:category
    })

    //atualização de dados - 204 -> sucesso e não tem retorno
    return response.status(204).send();

})

//deletar livro
server.delete('/books/:bookId',(request,response)=>{
    const {bookId} = request.params;
    const book = database.findById(bookId);
    if (!book){
        return response.status(404).send({
            message: 'Livro não encontrado'
        });
    }
    //verificando se o livro está emprestado
    // available -> true = está disponível
    // available -> false = está emprestado
    if(!book.available){
        return response.status(404).send({
            message: 'Não é possível excluir um livro emprestado'
        });
    }

    database.delete(bookId);
    return response.status(204).send();
    
})
// PUT -> Quando há alteração total dos dados
// PATCH -> Quando há alteração parcial dos dados
server.patch('/books/:bookId/borrow',(request,response)=>{
    //pegar o Id do livro a ser emprestado
    const {bookId} = request.params;
    const {name}= request.body;
    const book = database.findById(bookId);
    if (!book){
        return response.status(404).send({
            message: 'Livro não encontrado'
        });
    }
    //verificar se está disponível
    if (!book.available){
        return response.status(400).send({
            message: 'Livro indisponível para empréstimo'
        });
    }

    //verificar se o nome do cliente foi fornecido
    if (!name){
        return response.status(400).send({
            message: 'O nome do cliente é obrigatório para empréstimo'
        });
    }

    database.update(bookId,{
        ...book,
        available: false,
        borrowedBy: name
    });
    //requisição patch -> 200 + mensagem
    return response.status(200).send({message: `Livro emprestado para ${name}`});
})
server.patch('/books/:bookId/return',(request,response)=>{
    const {bookId} = request.params;
    const book = database.findById(bookId);
    if (!book){
        return response.status(404).send({
            message: 'Livro não encontrado'
        });
    }
    //verificar se o livro está emprestado
    if (book.available){
        return response.status(400).send({
            message: 'Livro já está disponível na biblioteca'
        });
    }

    database.update(bookId,{
        ...book,
        available: true,
        borrowedBy: null
    });
    return response.status(200).send({message: 'Livro devolvido com sucesso'});
})
//definir a porta em que a aplicação será executada
server.listen({port: 3000});
