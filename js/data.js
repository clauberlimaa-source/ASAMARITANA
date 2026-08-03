// js/data.js

// Produtos
async function getProdutos() {
    const dados = localStorage.getItem('produtos_samaritana');
    if (dados) {
        return JSON.parse(dados);
    }
    // Se não houver, carrega produtos padrão (sem imagens base64, use URLs)
    const padrao = [
        { nome: "Terço de Madeira Rústica", preco: 34.90, categoria: "Terços e Rosários", descricao: "Lindíssimo terço...", fotoUrl: "imagens/terco.jpg" },
        { nome: "Imagem de Nossa Senhora Aparecida", preco: 120.00, categoria: "Imagens Sacras", descricao: "Imagem em porcelana...", fotoUrl: "imagens/santa.jpg" },
        { nome: "Bíblia Sagrada Ave-Maria", preco: 79.90, categoria: "Bíblias e Livros", descricao: "Bíblia com capa premium...", fotoUrl: "imagens/biblia.jpg" }
    ];
    localStorage.setItem('produtos_samaritana', JSON.stringify(padrao));
    return padrao;
}

function salvarProduto(produto) {
    return getProdutos().then(lista => {
        lista.push(produto);
        localStorage.setItem('produtos_samaritana', JSON.stringify(lista));
        return lista;
    });
}

function excluirProduto(index) {
    return getProdutos().then(lista => {
        lista.splice(index, 1);
        localStorage.setItem('produtos_samaritana', JSON.stringify(lista));
        return lista;
    });
}

// Carrinho
function getCarrinho() {
    const dados = localStorage.getItem('carrinho_samaritana');
    return dados ? JSON.parse(dados) : [];
}

function salvarCarrinho(itens) {
    localStorage.setItem('carrinho_samaritana', JSON.stringify(itens));
}

function adicionarAoCarrinho(nome, preco, fotoUrl) {
    const itens = getCarrinho();
    itens.push({ nome, preco, fotoUrl });
    salvarCarrinho(itens);
    return itens;
}

function limparCarrinho() {
    localStorage.removeItem('carrinho_samaritana');
}