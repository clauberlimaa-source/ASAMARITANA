let carrinhoItens = [];
let totalValor = 0;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Painel Administrativo
    const formCadastro = document.getElementById("form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", processarCadastro);
    }
    const listaExclusao = document.getElementById("lista-exclusao-admin");
    if (listaExclusao) {
        renderizarListaExclusaoAdmin();
    }

    // 2. Vitrine da Loja
    const vitrine = document.querySelector(".products-grid");
    if (vitrine) {
        renderizarProdutos();
    }

    // 3. Detalhes do Produto
    if (document.getElementById("detalhe-nome")) {
        carregarPaginaDetalhe();
    }

    // 4. Checkout
    if (document.querySelector(".summary-items")) {
        renderizarResumoCheckout();
    }

    // 5. Ativa o menu fixo
    if (document.getElementById("navbar-principal")) {
        window.addEventListener("scroll", monitorarRolagemMenu);
    }
});

// MONITORAR MENU STICKY
function monitorarRolagemMenu() {
    const navbar = document.getElementById("navbar-principal");
    const header = document.querySelector("header");
    const topBar = document.querySelector(".top-bar");
    
    if (navbar && header && topBar) {
        const alturaHeader = header.offsetHeight + topBar.offsetHeight;
        if (window.scrollY >= alturaHeader) {
            navbar.classList.add("fixo");
            document.body.classList.add("nav-fixada");
        } else {
            navbar.classList.remove("fixo");
            document.body.classList.remove("nav-fixada");
        }
    }
}

// ROLAGEM SUAVE
function rolarParaSecao(event, seaoId) {
    event.preventDefault();
    if (seaoId === 'topo') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const elemento = document.getElementById(seaoId);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// FILTRAR CATEGORIA
function filtrarCategoria(categoriaNome) {
    const tituloVitrine = document.getElementById("titulo-vitrine");
    if (tituloVitrine) tituloVitrine.innerText = categoriaNome;

    let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
    const produtosFiltrados = listaProdutos.filter(p => p.categoria === categoriaNome);
    
    desenharCardsVitrine(produtosFiltrados);
    
    const vitrineSecao = document.getElementById("vitrine-produtos");
    if (vitrineSecao) vitrineSecao.scrollIntoView({ behavior: 'smooth' });
}

// CARRINHO LATERAL
function abrirCarrinhoLateral() {
    document.getElementById("carrinho-lateral").classList.add("active");
    document.getElementById("cart-overlay").classList.add("active");
}
function fecharCarrinhoLateral() {
    document.getElementById("carrinho-lateral").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");
}
function adicionarAoCarrinho(nome, preco, fotoUrl) {
    carrinhoItens.push({ nome, preco, fotoUrl });
    document.getElementById('cart-count').innerText = carrinhoItens.length;
    localStorage.setItem("carrinho_samaritana", JSON.stringify(carrinhoItens));
    atualizarVisualCarrinho();
    abrirCarrinhoLateral();
}
function atualizarVisualCarrinho() {
    const containerItens = document.getElementById("itens-do-carrinho");
    const containerTotal = document.getElementById("preco-total-carrinho");
    if (!containerItens || !containerTotal) return;

    if (carrinhoItens.length === 0) {
        containerItens.innerHTML = '<p class="cart-empty-msg">Seu carrinho esta vazio.</p>';
        containerTotal.innerText = "R$ 0,00";
        return;
    }
    containerItens.innerHTML = "";
    totalValor = 0;
    carrinhoItens.forEach(item => {
        totalValor += item.preco;
        containerItens.innerHTML += `
            <div class="cart-sidebar-item">
                <img src="${item.fotoUrl}" class="cart-item-icon" style="width: 40px; height: 40px; object-fit: contain;">
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        `;
    });
    containerTotal.innerText = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

// ADMIN: PROCESSAR CADASTRO
function processarCadastro(event) {
    event.preventDefault();
    const campoFoto = document.getElementById("foto").files;
    if (campoFoto && campoFoto[0]) {
        const leitor = new FileReader();
        leitor.onloadend = function() {
            salvarProdutoComFoto(leitor.result);
        }
        leitor.readAsDataURL(campoFoto[0]);
    }
}
function salvarProdutoComFoto(fotoString) {
    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value).toFixed(2);
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;

    const novoProduto = { nome, preco, categoria, descricao, fotoUrl: fotoString };
    let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
    
    listaProdutos.push(novoProduto);
    localStorage.setItem("produtos_samaritana", JSON.stringify(listaProdutos));

    alert("Artigo publicado com sucesso!");
    document.getElementById("form-cadastro").reset();
    
    if (document.getElementById("lista-exclusao-admin")) {
        renderizarListaExclusaoAdmin();
    }
}

// ADMIN: EXCLUIR PRODUTO
function excluirProduto(index) {
    if (confirm("Deseja realmente remover este artigo da vitrine da loja?")) {
        let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
        listaProdutos.splice(index, 1);
        localStorage.setItem("produtos_samaritana", JSON.stringify(listaProdutos));
        renderizarListaExclusaoAdmin();
    }
}
function renderizarListaExclusaoAdmin() {
    const container = document.getElementById("lista-exclusao-admin");
    if (!container) return;

    let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
    
    if (listaProdutos.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0; text-align: center; font-style: italic;">Nenhum produto cadastrado para exibir.</p>';
        return;
    }
    
    container.innerHTML = "";
    listaProdutos.forEach((produto, index) => {
        container.innerHTML += `
            <div class="admin-item-row">
                <div class="admin-item-info">
                    <img src="${produto.fotoUrl}">
                    <div>
                        <h4>${produto.nome}</h4>
                        <span>Cat: ${produto.categoria}</span>
                    </div>
                </div>
                <button class="btn-excluir-item" onclick="excluirProduto(${index})">Excluir</button>
            </div>
        `;
    });
}

// VITRINE E DETALHES
function renderizarProdutos() {
    let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];

    if (listaProdutos.length === 0) {
        listaProdutos = [
            { nome: "Terco de Madeira Rustica de Resina", preco: 34.90, categoria: "Tercos e Rosarios", descricao: "Lindo terco de madeira rustica, feito com cordao reforcado e contas de resina tratada. Ideal para suas oracoes diarias.", fotoUrl: "imagens/terco.jpg" },
            { nome: "Imagem de Nossa Senhora Aparecida", preco: 120.00, categoria: "Imagens Sacras", descricao: "Imagem sacra de Nossa Senhora Aparecida fabricada em porcelana legitima de Pedreira. Pintura manual com detalhes dourados.", fotoUrl: "imagens/santa.jpg" },
            { nome: "Biblia Sagrada Ave-Maria", preco: 79.90, categoria: "Biblias e Livros", descricao: "Biblia Sagrada na tradicional traducao Ave-Maria. Possui capa com acabamento premium e letras grandes.", fotoUrl: "imagens/biblia.jpg" }
        ];
        localStorage.setItem("produtos_samaritana", JSON.stringify(listaProdutos));
    }

    desenharCardsVitrine(listaProdutos);
}

function desenharCardsVitrine(lista) {
    const vitrine = document.querySelector(".products-grid");
    if (!vitrine) return;
    
    if (lista.length === 0) {
        vitrine.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #a0aec0; padding: 40px; font-style: italic;">Nenhum artigo encontrado nesta categoria.</p>';
        return;
    }
    
    vitrine.innerHTML = "";
    lista.forEach((produto) => {
        let listaProdutosCompleta = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
        let indexReal = listaProdutosCompleta.findIndex(p => p.nome === produto.nome);
        
        vitrine.innerHTML += `
            <div class="product-card">
                <div style="cursor: pointer;" onclick="guardarProdutoSelecionado(${indexReal})">
                    <div class="product-img">
                        <img src="${produto.fotoUrl}" alt="${produto.nome}">
                    </div>
                    <h3>${produto.nome}</h3>
                </div>
                <p class="price">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                <button class="btn-add" onclick="adicionarAoCarrinho('${produto.nome}', ${parseFloat(produto.preco)}, '${produto.fotoUrl}')">Adicionar ao Carrinho</button>
            </div>
        `;
    });
}

function guardarProdutoSelecionado(index) {
    let listaProdutos = JSON.parse(localStorage.getItem("produtos_samaritana")) || [];
    if (listaProdutos[index]) {
        localStorage.setItem("produto_atual_samaritana", JSON.stringify(listaProdutos[index]));
        window.location.href = "produto.html";
    }
}

/* ==========================================================================
   TRECHO CORRIGIDO: DETALHES DO PRODUTO E RESUMO DO CHECKOUT
   ========================================================================== */

function carregarPaginaDetalhe() {
    const produto = JSON.parse(localStorage.getItem("produto_atual_samaritana"));
    if (produto) {
        document.getElementById("detalhe-nome").innerText = produto.nome;
        // Corrigido: Adicionadas as crases no preço
        document.getElementById("detalhe-preco").innerText = `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`;
        document.getElementById("detalhe-imagem").src = produto.fotoUrl;
        document.getElementById("detalhe-descricao").innerText = produto.descricao;
        // Corrigido: Adicionadas as crases no título da aba
        document.title = `${produto.nome} | A Samaritana`;
    }
}

function renderizarResumoCheckout() {
    const containerItensCheckout = document.querySelector(".summary-items");
    const subtotalElemento = document.querySelector(".total-row span:last-child");
    const totalElemento = document.querySelector(".final-total span:last-child");
    const itensSalvos = JSON.parse(localStorage.getItem("carrinho_samaritana")) || [];

    if (!containerItensCheckout) return;

    if (itensSalvos.length === 0) {
        containerItensCheckout.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhum produto selecionado.</p>';
        return;
    }

    containerItensCheckout.innerHTML = "";
    let somaTotal = 0;

    itensSalvos.forEach(item => {
        somaTotal += parseFloat(item.preco);
        // Corrigido: Adicionadas as crases no bloco HTML abaixo
        containerItensCheckout.innerHTML += `
            <div class="summary-item"> 
                <img src="${item.fotoUrl}" style="width: 40px; height: 40px; object-fit: contain; background-color: #fafbfc; padding: 3px; border-radius: 4px;"> 
                <div class="item-details"> 
                    <h4>${item.nome}</h4> 
                    <p>Qtd: 1</p> 
                </div> 
                <span class="item-price">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</span> 
            </div>
        `;
    });

    // Corrigido: Adicionadas as crases nas duas strings de preço final
    if (subtotalElemento) subtotalElemento.innerText = `R$ ${somaTotal.toFixed(2).replace('.', ',')}`;
    if (totalElemento) totalElemento.innerText = `R$ ${somaTotal.toFixed(2).replace('.', ',')}`;
}
