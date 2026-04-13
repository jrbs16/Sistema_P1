//Gera o Id de forma aleatória e única
import {randomUUID} from 'node:crypto';
// Criar uma classe do meu banco de dados local
// export -> possibilita a importação da classe para outro arquivo
export class DatabaseMemory {
    //criar uma variavel privada local
    //funciona como banco de dados
    // ser -> evita duplicidade ao criar
    //map -> possui várioa métodos para eecução
    #books = new Map();

    //métodos que o banco de dados possui
    list(searchTerm){
        // retornar a listados dos livros sem o Id .values
        // retornar com o id .entries
        const book = Array.from(this.#books.entries()).map(([id,book])=>{
            return{
                id,
                ... book
            }
        }).filter((book)=>{
            if(searchTerm){
                return book.title.includes(searchTerm);
            }
            return true;
        });
        console.log('list ->',book);
        return book;
    }
    //recebe por parametro os dados a serem inseridos no banco
    create(book){
        // Gera um Id único e aleatório
        const bookId = randomUUID();
        // Salva as informaçẽos na variável privada 
        this.#books.set(bookId,book);
    }
    //recebe por parâmetor:
    // - id do registro a ser alterado
    // - os dados que serão alterados
    update(bookId, book){
        // Método .set
        // se o ID não existe, ele cria
        // se o ID existe, ele altera
        this.#books.set(bookId, book);

    }
    // recebe por parâmtro a o id a ser removido
    delete(bookId){
        this.#books.delete(bookId);

    }

    findById(id){
        return this.#books.get(id);
    }

}
