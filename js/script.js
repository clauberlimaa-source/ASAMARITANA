/**
 * script.js – Versão com verificações de segurança para evitar erros de null
 */

// ============================================================
//  UTILITÁRIOS
// ============================================================

function sanitizarTexto(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.textContent;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length === 11;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatarPreco(valor) {
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
}

// ============================================================
//  AUTENTICAÇÃO
// ============================================================

const ADMIN_CREDENTIALS = {
    usuario: 'admin',
    senha: 'samaritana2026'
};

function verificarAutenticacao() {
    return sessionStorage.getItem('admin_auth_samaritana') === 'true';
}

function fazerLogin(usuario, senha) {
    if (usuario === ADMIN_CREDENTIALS.usuario && senha === ADMIN_CREDENTIALS.senha) {
        sessionStorage.setItem('admin_auth_samaritana', 'true');
        return true;
    }
    return false;
}

function fazerLogout() {
    sessionStorage.removeItem('admin_auth_samaritana');
    window.location.reload();
}

// ============================================================
//  RESETAR FILTRO
// ============================================================

function resetarFiltro() {
    const titulo = document.getElementById('titulo-vitrine');
    if (titulo) titulo.textContent = 'Destaques de Devoção';
    const produtos = carregarProdutos();
    renderizarVitrine(produtos);
    rolarParaSecao('vitrine-produtos');
}

// ============================================================
//  GERENCIAMENTO DE PRODUTOS
// ============================================================

function carregarProdutos() {
    try {
        const dados = localStorage.getItem('produtos_samaritana');
        if (dados) {
            const produtos = JSON.parse(dados);
            if (Array.isArray(produtos) && produtos.length > 0) return produtos;
        }
    } catch (e) {}
    return [
        {
            nome: 'Terço de Madeira Rústica',
            preco: 34.90,
            categoria: 'Terços e Rosários',
            descricao: 'Lindo terço de madeira rústica, feito com cordão reforçado e contas de resina tratada.',
            imagens: ['imagens/terco.jpg'],
            estoque: 5
        },
        {
            nome: 'Imagem de Nossa Senhora Aparecida',
            preco: 120.00,
            categoria: 'Imagens Sacras',
            descricao: 'Imagem sacra de Nossa Senhora Aparecida fabricada em porcelana legítima de Pedreira.',
            imagens: ['imagens/santa.jpg'],
            estoque: 3
        },
        {
            nome: 'Bíblia Sagrada Ave-Maria',
            preco: 79.90,
            categoria: 'Bíblias e Livros',
            descricao: 'Bíblia Sagrada na tradicional tradução Ave-Maria. Capa premium.',
            imagens: ['imagens/biblia.jpg'],
            estoque: 0
        }
    ];
}

function salvarProdutos(lista) {
    localStorage.setItem('produtos_samaritana', JSON.stringify(lista));
}

// ============================================================
//  GERENCIAMENTO DE PEDIDOS
// ============================================================

function carregarPedidos() {
    try {
        const dados = localStorage.getItem('pedidos_samaritana');
        if (dados) {
            const pedidos = JSON.parse(dados);
            if (Array.isArray(pedidos)) return pedidos;
        }
    } catch (e) {}
    return [];
}

function salvarPedidos(lista) {
    localStorage.setItem('pedidos_samaritana', JSON.stringify(lista));
}

function adicionarPedido(pedido) {
    const pedidos = carregarPedidos();
    pedido.data = new Date().toLocaleString('pt-BR');
    pedido.id = Date.now();
    pedidos.push(pedido);
    salvarPedidos(pedidos);
}

// ============================================================
//  CARRINHO
// ============================================================

function carregarCarrinho() {
    try {
        const dados = sessionStorage.getItem('carrinho_samaritana');
        if (dados) {
            const itens = JSON.parse(dados);
            if (Array.isArray(itens)) return itens;
        }
    } catch (e) {}
    return [];
}

function salvarCarrinho(itens) {
    sessionStorage.setItem('carrinho_samaritana', JSON.stringify(itens));
}

function atualizarContadorCarrinho() {
    const itens = carregarCarrinho();
    const total = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0);
    document.querySelectorAll('.cart-count, #cart-count, #cart-count-detalhe').forEach(el => {
        if (el) el.textContent = total;
    });
}

// ============================================================
//  UPLOAD DE IMAGENS
// ============================================================

let imagensSelecionadas = [];

function lerArquivoComoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function atualizarPreviewFotos() {
    const container = document.getElementById('preview-fotos');
    if (!container) return;
    container.innerHTML = '';
    imagensSelecionadas.forEach((base64, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;';
        const img = document.createElement('img');
        img.src = base64;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(img);
        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.style.cssText = 'position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;';
        btn.addEventListener('click', () => {
            imagensSelecionadas.splice(index, 1);
            atualizarPreviewFotos();
        });
        div.appendChild(btn);
        container.appendChild(div);
    });
}

// ============================================================
//  RENDERIZAÇÃO DA VITRINE
// ============================================================

function renderizarVitrine(lista) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!lista || lista.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'grid-column: 1/-1; text-align: center; color: #a0aec0; padding: 40px; font-style: italic;';
        msg.textContent = 'Nenhum artigo encontrado nesta categoria.';
        grid.appendChild(msg);
        return;
    }

    lista.forEach((produto, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const link = document.createElement('div');
        link.style.cursor = 'pointer';
        link.addEventListener('click', () => {
            sessionStorage.setItem('produto_index', index);
            window.location.href = 'produto.html';
        });

        const imgDiv = document.createElement('div');
        imgDiv.className = 'product-img';
        const img = document.createElement('img');
        const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
        img.src = imagens[0];
        img.alt = produto.nome;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        imgDiv.appendChild(img);

        const nomeH3 = document.createElement('h3');
        nomeH3.textContent = sanitizarTexto(produto.nome);

        link.appendChild(imgDiv);
        link.appendChild(nomeH3);

        const precoP = document.createElement('p');
        precoP.className = 'price';
        precoP.textContent = formatarPreco(produto.preco);

        const btn = document.createElement('button');
        btn.className = 'btn-add';
        const estoque = produto.estoque !== undefined ? produto.estoque : 0;
        if (estoque <= 0) {
            btn.textContent = 'Esgotado';
            btn.disabled = true;
            btn.style.backgroundColor = '#a0aec0';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.textContent = 'Adicionar ao Carrinho';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                adicionarAoCarrinho(produto);
            });
        }

        if (estoque > 0 && estoque <= 3) {
            const badge = document.createElement('span');
            badge.style.cssText = 'display: inline-block; background: #ed8936; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; margin-top: 5px;';
            badge.textContent = 'Últimas unidades!';
            card.appendChild(badge);
        }

        card.appendChild(link);
        card.appendChild(precoP);
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

// ============================================================
//  RENDERIZAÇÃO DO CARRINHO LATERAL
// ============================================================

function renderizarCarrinhoLateral() {
    const container = document.getElementById('itens-do-carrinho');
    const totalSpan = document.getElementById('preco-total-carrinho');
    if (!container || !totalSpan) return;

    const itens = carregarCarrinho();
    container.innerHTML = '';

    if (itens.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'cart-empty-msg';
        msg.textContent = 'Seu carrinho está vazio.';
        container.appendChild(msg);
        totalSpan.textContent = 'R$ 0,00';
        return;
    }

    let total = 0;
    itens.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-sidebar-item';

        const img = document.createElement('img');
        img.src = item.fotoUrl || 'imagens/placeholder.jpg';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '4px';
        img.style.backgroundColor = '#fafbfc';
        img.style.padding = '4px';

        const info = document.createElement('div');
        info.className = 'cart-item-info';
        const nome = document.createElement('h4');
        nome.textContent = sanitizarTexto(item.nome);
        const preco = document.createElement('p');
        preco.textContent = formatarPreco(item.preco);
        const qtd = document.createElement('span');
        qtd.style.fontSize = '0.8rem';
        qtd.textContent = 'Qtd: ' + (item.quantidade || 1);
        info.appendChild(nome);
        info.appendChild(preco);
        info.appendChild(qtd);

        const btnRemover = document.createElement('button');
        btnRemover.textContent = '✕';
        btnRemover.style.cssText = `
            background: none;
            border: none;
            color: #a83232;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0 8px;
            font-weight: bold;
            transition: color 0.2s;
        `;
        btnRemover.addEventListener('mouseenter', () => btnRemover.style.color = '#e53e3e');
        btnRemover.addEventListener('mouseleave', () => btnRemover.style.color = '#a83232');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerItemCarrinho(index);
        });

        div.appendChild(img);
        div.appendChild(info);
        div.appendChild(btnRemover);
        container.appendChild(div);

        total += parseFloat(item.preco) * (item.quantidade || 1);
    });

    totalSpan.textContent = formatarPreco(total);
}

function removerItemCarrinho(index) {
    const itens = carregarCarrinho();
    if (index >= 0 && index < itens.length) {
        itens.splice(index, 1);
        salvarCarrinho(itens);
        atualizarContadorCarrinho();
        renderizarCarrinhoLateral();
    }
}

// ============================================================
//  ADMIN: LISTA DE PRODUTOS
// ============================================================

function renderizarListaExclusao() {
    const container = document.getElementById('lista-exclusao-admin');
    if (!container) return;

    const produtos = carregarProdutos();
    container.innerHTML = '';

    if (produtos.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: #a0aec0; text-align: center; font-style: italic;';
        msg.textContent = 'Nenhum produto cadastrado.';
        container.appendChild(msg);
        return;
    }

    produtos.forEach((produto, index) => {
        const row = document.createElement('div');
        row.className = 'admin-item-row';

        const info = document.createElement('div');
        info.className = 'admin-item-info';

        const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
        const img = document.createElement('img');
        img.src = imagens[0];
        img.alt = produto.nome;

        const textDiv = document.createElement('div');
        const nome = document.createElement('h4');
        nome.textContent = sanitizarTexto(produto.nome);
        const cat = document.createElement('span');
        cat.textContent = 'Cat: ' + sanitizarTexto(produto.categoria);
        const est = document.createElement('span');
        est.style.cssText = 'display: block; font-size: 0.8rem; color: #2d3748;';
        const estoque = produto.estoque !== undefined ? produto.estoque : 0;
        est.textContent = 'Estoque: ' + estoque + (estoque <= 0 ? ' (ESGOTADO)' : '');

        textDiv.appendChild(nome);
        textDiv.appendChild(cat);
        textDiv.appendChild(est);

        info.appendChild(img);
        info.appendChild(textDiv);

        const btnEst = document.createElement('button');
        btnEst.className = 'btn-excluir-item';
        btnEst.style.backgroundColor = '#edf2f7';
        btnEst.style.color = '#2d3748';
        btnEst.textContent = 'Ajustar Estoque';
        btnEst.addEventListener('click', () => {
            const novo = prompt('Nova quantidade em estoque para "' + produto.nome + '":', estoque);
            if (novo !== null && !isNaN(novo) && parseInt(novo) >= 0) {
                produtos[index].estoque = parseInt(novo);
                salvarProdutos(produtos);
                renderizarListaExclusao();
                if (document.getElementById('products-grid')) {
                    const categoriaAtual = document.getElementById('titulo-vitrine')?.textContent || '';
                    if (categoriaAtual && categoriaAtual !== 'Destaques de Devoção') {
                        filtrarPorCategoria(categoriaAtual);
                    } else {
                        renderizarVitrine(produtos);
                    }
                }
            }
        });

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn-excluir-item';
        btnExcluir.textContent = 'Excluir';
        btnExcluir.addEventListener('click', () => excluirProduto(index));

        row.appendChild(info);
        row.appendChild(btnEst);
        row.appendChild(btnExcluir);
        container.appendChild(row);
    });
}

// ============================================================
//  ADMIN: PEDIDOS
// ============================================================

function renderizarPedidosAdmin() {
    const container = document.getElementById('lista-pedidos-admin');
    if (!container) return;

    const pedidos = carregarPedidos();
    container.innerHTML = '';

    if (pedidos.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: #a0aec0; text-align: center; font-style: italic;';
        msg.textContent = 'Nenhum pedido realizado ainda.';
        container.appendChild(msg);
        return;
    }

    pedidos.slice().reverse().forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'admin-item-row';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';

        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; width: 100%;';
        const data = document.createElement('span');
        data.textContent = '📅 ' + pedido.data;
        const id = document.createElement('span');
        id.textContent = 'Pedido #' + pedido.id;
        header.appendChild(data);
        header.appendChild(id);
        card.appendChild(header);

        const itensList = document.createElement('ul');
        itensList.style.cssText = 'padding-left: 20px; margin: 10px 0;';
        let total = 0;
        pedido.itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.nome + ' (Qtd: ' + (item.quantidade || 1) + ') - ' + formatarPreco(item.preco);
            itensList.appendChild(li);
            total += parseFloat(item.preco) * (item.quantidade || 1);
        });
        card.appendChild(itensList);

        const totalP = document.createElement('p');
        totalP.style.fontWeight = 'bold';
        totalP.textContent = 'Total: ' + formatarPreco(total);
        card.appendChild(totalP);

        container.appendChild(card);
    });
}

// ============================================================
//  FUNÇÕES DE AÇÃO
// ============================================================

function adicionarAoCarrinho(produto) {
    const itens = carregarCarrinho();
    const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
    const existente = itens.find(item => item.nome === produto.nome);
    if (existente) {
        existente.quantidade = (existente.quantidade || 1) + 1;
    } else {
        itens.push({
            nome: produto.nome,
            preco: produto.preco,
            fotoUrl: imagens[0],
            quantidade: 1
        });
    }
    salvarCarrinho(itens);
    atualizarContadorCarrinho();
    renderizarCarrinhoLateral();
    abrirCarrinho();
}

function adicionarAoCarrinhoComQuantidade(produto, quantidade) {
    const itens = carregarCarrinho();
    const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
    const existente = itens.find(item => item.nome === produto.nome);
    if (existente) {
        existente.quantidade = (existente.quantidade || 0) + quantidade;
    } else {
        itens.push({
            nome: produto.nome,
            preco: produto.preco,
            fotoUrl: imagens[0],
            quantidade: quantidade
        });
    }
    salvarCarrinho(itens);
    atualizarContadorCarrinho();
    renderizarCarrinhoLateral();
}

function excluirProduto(index) {
    if (!confirm('Remover este artigo permanentemente?')) return;
    const produtos = carregarProdutos();
    produtos.splice(index, 1);
    salvarProdutos(produtos);
    renderizarListaExclusao();
    if (document.getElementById('products-grid')) {
        const categoriaAtual = document.getElementById('titulo-vitrine')?.textContent || '';
        if (categoriaAtual && categoriaAtual !== 'Destaques de Devoção') {
            filtrarPorCategoria(categoriaAtual);
        } else {
            renderizarVitrine(produtos);
        }
    }
}

function filtrarPorCategoria(categoria) {
    const titulo = document.getElementById('titulo-vitrine');
    if (titulo) titulo.textContent = categoria;
    const todos = carregarProdutos();
    const filtrados = todos.filter(p => p.categoria === categoria);
    renderizarVitrine(filtrados);
    const secao = document.getElementById('vitrine-produtos');
    if (secao) secao.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
//  CARRINHO LATERAL
// ============================================================

function abrirCarrinho() {
    const sidebar = document.getElementById('carrinho-lateral');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    renderizarCarrinhoLateral();
}

function fecharCarrinho() {
    const sidebar = document.getElementById('carrinho-lateral');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// ============================================================
//  ROLAGEM SUAVE
// ============================================================

function rolarParaSecao(id) {
    if (id === 'topo') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================================
//  CÁLCULO DE FRETE
// ============================================================

function calcularFrete(cep, valorTotal) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        return {
            erro: true,
            mensagem: 'CEP inválido. Digite 8 dígitos (ex: 13000-000).'
        };
    }

    if (valorTotal >= 150) {
        return {
            valor: 0,
            prazo: '1 a 3 dias úteis',
            mensagem: '🎉 Frete Grátis! (compras acima de R$ 150)'
        };
    }

    const prefixo = parseInt(cep.substring(0, 5));
    let valorFrete, prazo;

    if (prefixo >= 1000 && prefixo <= 9999) {
        valorFrete = 10.00;
        prazo = '1 a 2 dias úteis';
    } else if (prefixo >= 10000 && prefixo <= 19999) {
        valorFrete = 15.00;
        prazo = '2 a 4 dias úteis';
    } else if (prefixo >= 20000 && prefixo <= 39999) {
        valorFrete = 20.00;
        prazo = '3 a 5 dias úteis';
    } else if (prefixo >= 40000 && prefixo <= 69999) {
        valorFrete = 30.00;
        prazo = '5 a 8 dias úteis';
    } else if (prefixo >= 70000 && prefixo <= 99999) {
        valorFrete = 40.00;
        prazo = '7 a 12 dias úteis';
    } else {
        valorFrete = 25.00;
        prazo = '4 a 6 dias úteis';
    }

    return {
        valor: valorFrete,
        prazo: prazo,
        mensagem: `Frete: R$ ${valorFrete.toFixed(2)} - Entrega em ${prazo}`
    };
}

// ============================================================
//  FUNÇÃO PARA CARREGAR DETALHES DO PRODUTO (com verificações)
// ============================================================

function carregarDetalhesProduto() {
    console.log('carregarDetalhesProduto iniciada');

    // 1. Verifica se o índice existe
    const indexStr = sessionStorage.getItem('produto_index');
    if (indexStr === null) {
        console.warn('produto_index não encontrado, redirecionando para index');
        window.location.href = 'index.html';
        return;
    }

    const index = parseInt(indexStr, 10);
    const produtos = carregarProdutos();
    if (isNaN(index) || index < 0 || index >= produtos.length) {
        console.warn('Índice inválido, redirecionando para index');
        window.location.href = 'index.html';
        return;
    }

    const produto = produtos[index];
    if (!produto) {
        console.warn('Produto não encontrado, redirecionando para index');
        window.location.href = 'index.html';
        return;
    }

    console.log('Produto carregado:', produto.nome);

    // 2. Preenche os elementos (com verificações)
    const elNome = document.getElementById('detalhe-nome');
    const elPreco = document.getElementById('detalhe-preco');
    const elDesc = document.getElementById('detalhe-descricao');
    const elCategoria = document.getElementById('detalhe-categoria');
    const elImg = document.getElementById('detalhe-imagem');

    if (elNome) elNome.textContent = sanitizarTexto(produto.nome);
    else console.warn('Elemento #detalhe-nome não encontrado');

    if (elPreco) elPreco.textContent = formatarPreco(produto.preco);
    else console.warn('Elemento #detalhe-preco não encontrado');

    if (elDesc) elDesc.textContent = sanitizarTexto(produto.descricao || '');
    else console.warn('Elemento #detalhe-descricao não encontrado');

    if (elCategoria) elCategoria.textContent = sanitizarTexto(produto.categoria || 'Artigo de Fé');
    else console.warn('Elemento #detalhe-categoria não encontrado');

    const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
    if (elImg) {
        elImg.src = imagens[0];
        elImg.alt = sanitizarTexto(produto.nome);
    } else console.warn('Elemento #detalhe-imagem não encontrado');

    // 3. Thumbnails
    const thumbContainer = document.querySelector('.thumb-images');
    if (thumbContainer) {
        thumbContainer.innerHTML = '';
        imagens.forEach((src, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumb' + (idx === 0 ? ' active' : '');
            thumb.style.cssText = 'width: 70px; height: 70px; background-image: url('+src+'); background-size: cover; background-position: center; border: 2px solid ' + (idx === 0 ? '#bfa15f' : '#eef2f5') + '; border-radius: 4px; cursor: pointer;';
            thumb.addEventListener('click', () => {
                if (elImg) {
                    elImg.src = src;
                    document.querySelectorAll('.thumb').forEach(t => t.style.borderColor = '#eef2f5');
                    thumb.style.borderColor = '#bfa15f';
                }
            });
            thumbContainer.appendChild(thumb);
        });
    } else console.warn('.thumb-images não encontrado');

    // 4. Atualiza subtotal e configura eventos +/-
    configurarEventosProduto(produto);
}

// ============================================================
//  CONFIGURAR EVENTOS DA PÁGINA DE PRODUTO
// ============================================================

function configurarEventosProduto(produto) {
    console.log('configurarEventosProduto para:', produto.nome);

    const qtdInput = document.getElementById('qtd-produto');
    const subtotalEl = document.getElementById('subtotal-produto');
    const precoEl = document.getElementById('detalhe-preco');

    if (!qtdInput || !subtotalEl || !precoEl) {
        console.warn('Elementos de quantidade/subtotal não encontrados');
        return;
    }

    // Função para atualizar subtotal
    function atualizarSubtotal() {
        const precoTexto = precoEl.textContent.replace('R$ ', '').replace(',', '.');
        const preco = parseFloat(precoTexto) || 0;
        const qtd = parseInt(qtdInput.value) || 1;
        const subtotal = preco * qtd;
        subtotalEl.textContent = formatarPreco(subtotal);
    }

    // Atualiza ao carregar
    atualizarSubtotal();

    // + e -
    const btnMais = document.getElementById('qtd-mais');
    const btnMenos = document.getElementById('qtd-menos');
    if (btnMais) btnMais.addEventListener('click', () => {
        qtdInput.value = parseInt(qtdInput.value) + 1;
        atualizarSubtotal();
    });
    if (btnMenos) btnMenos.addEventListener('click', () => {
        if (parseInt(qtdInput.value) > 1) {
            qtdInput.value = parseInt(qtdInput.value) - 1;
            atualizarSubtotal();
        }
    });

    qtdInput.addEventListener('change', () => {
        if (parseInt(qtdInput.value) < 1) qtdInput.value = 1;
        atualizarSubtotal();
    });

    // Botão "Comprar Agora"
    const btnComprar = document.getElementById('btn-comprar-agora');
    if (btnComprar) {
        // Verifica estoque
        const estoque = produto.estoque !== undefined ? produto.estoque : 0;
        if (estoque <= 0) {
            btnComprar.textContent = 'Esgotado';
            btnComprar.disabled = true;
            btnComprar.style.backgroundColor = '#a0aec0';
        } else {
            btnComprar.textContent = '🕊️ Comprar Agora';
            btnComprar.disabled = false;
            btnComprar.style.backgroundColor = '';
            // Remove listeners antigos e adiciona novo
            btnComprar.replaceWith(btnComprar.cloneNode(true));
            const novoBtn = document.getElementById('btn-comprar-agora');
            novoBtn.addEventListener('click', () => {
                const qtd = parseInt(qtdInput.value) || 1;
                adicionarAoCarrinhoComQuantidade(produto, qtd);
                window.location.href = 'checkout.html';
            });
        }
    } else console.warn('#btn-comprar-agora não encontrado');

    // Carrinho no topo
    const cartIcon = document.getElementById('cart-icon-detalhe');
    if (cartIcon) cartIcon.addEventListener('click', abrirCarrinho);

    // Cálculo de frete
    const btnCalcularFrete = document.getElementById('btn-calcular-frete');
    const cepInput = document.getElementById('cep-calculo');
    if (btnCalcularFrete && cepInput) {
        let resultadoFrete = document.getElementById('resultado-frete');
        if (!resultadoFrete) {
            resultadoFrete = document.createElement('div');
            resultadoFrete.id = 'resultado-frete';
            resultadoFrete.style.cssText = 'margin-top: 10px; padding: 10px; border-radius: 6px; font-size: 0.95rem; background: #f0f4f8; display: none;';
            cepInput.parentNode.appendChild(resultadoFrete);
        }

        btnCalcularFrete.addEventListener('click', () => {
            const cep = cepInput.value.trim();
            const precoTexto = precoEl.textContent.replace('R$ ', '').replace(',', '.');
            const preco = parseFloat(precoTexto) || 0;
            const qtd = parseInt(qtdInput.value) || 1;
            const valorTotal = preco * qtd;

            const resultado = calcularFrete(cep, valorTotal);

            resultadoFrete.style.display = 'block';
            if (resultado.erro) {
                resultadoFrete.style.backgroundColor = '#fff5f5';
                resultadoFrete.style.color = '#e53e3e';
                resultadoFrete.textContent = '❌ ' + resultado.mensagem;
            } else {
                resultadoFrete.style.backgroundColor = '#f0f4f8';
                resultadoFrete.style.color = '#2d3748';
                resultadoFrete.textContent = '📦 ' + resultado.mensagem + (resultado.valor === 0 ? '' : ` - Prazo: ${resultado.prazo}`);
            }
        });
    } else console.warn('Elementos de frete não encontrados');
}

// ============================================================
//  RESTO DO CÓDIGO (checkout, admin, etc.)
// ============================================================

function renderizarResumoCheckout() {
    const container = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('subtotal-value');
    const totalEl = document.getElementById('total-value');
    if (!container) return;

    const itens = carregarCarrinho();
    container.innerHTML = '';

    if (itens.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: #a0aec0; text-align: center; padding: 20px;';
        msg.textContent = 'Nenhum produto selecionado.';
        container.appendChild(msg);
        if (subtotalEl) subtotalEl.textContent = 'R$ 0,00';
        if (totalEl) totalEl.textContent = 'R$ 0,00';
        return;
    }

    let total = 0;
    itens.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-item';

        const img = document.createElement('img');
        img.src = item.fotoUrl || 'imagens/placeholder.jpg';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '4px';
        img.style.backgroundColor = '#fafbfc';
        img.style.padding = '4px';

        const details = document.createElement('div');
        details.className = 'item-details';
        const nome = document.createElement('h4');
        nome.textContent = sanitizarTexto(item.nome);
        const qtd = document.createElement('p');
        qtd.textContent = 'Qtd: ' + (item.quantidade || 1);
        details.appendChild(nome);
        details.appendChild(qtd);

        const precoSpan = document.createElement('span');
        precoSpan.className = 'item-price';
        precoSpan.textContent = formatarPreco(item.preco);

        div.appendChild(img);
        div.appendChild(details);
        div.appendChild(precoSpan);
        container.appendChild(div);

        total += parseFloat(item.preco) * (item.quantidade || 1);
    });

    if (subtotalEl) subtotalEl.textContent = formatarPreco(total);
    if (totalEl) totalEl.textContent = formatarPreco(total);
}

function finalizarPedido(dadosCliente) {
    const itensCarrinho = carregarCarrinho();
    if (itensCarrinho.length === 0) {
        alert('Carrinho vazio!');
        return false;
    }

    const pedido = {
        cliente: dadosCliente,
        itens: itensCarrinho,
        total: itensCarrinho.reduce((acc, item) => acc + (parseFloat(item.preco) * (item.quantidade || 1)), 0)
    };
    adicionarPedido(pedido);

    const produtos = carregarProdutos();
    itensCarrinho.forEach(item => {
        const prod = produtos.find(p => p.nome === item.nome);
        if (prod && prod.estoque !== undefined) {
            prod.estoque = Math.max(0, prod.estoque - (item.quantidade || 1));
        }
    });
    salvarProdutos(produtos);

    salvarCarrinho([]);
    atualizarContadorCarrinho();
    return true;
}

function renderizarContatosAdmin() {
    const container = document.getElementById('lista-contatos-admin');
    if (!container) return;
    const contatos = JSON.parse(localStorage.getItem('contatos_samaritana') || '[]');
    container.innerHTML = '';
    if (contatos.length === 0) {
        container.innerHTML = '<p style="color:#a0aec0; text-align:center; font-style:italic;">Nenhuma mensagem recebida.</p>';
        return;
    }
    contatos.slice().reverse().forEach(c => {
        const div = document.createElement('div');
        div.className = 'admin-item-row';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `
            <div><strong>${c.nome}</strong> (${c.email}) - ${c.data}</div>
            <div>Assunto: ${c.assunto} ${c.pedidoId ? '| Pedido #'+c.pedidoId : ''}</div>
            <div style="font-size:0.9rem; color:#4a5568;">${c.mensagem}</div>
        `;
        container.appendChild(div);
    });
}

function configurarEventosAdmin() {
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        document.querySelectorAll('.sugestao-foto').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('foto-url').value = el.getAttribute('data-url');
            });
        });

        const inputFotos = document.getElementById('fotos');
        if (inputFotos) {
            inputFotos.addEventListener('change', async function() {
                const files = Array.from(this.files);
                if (files.length > 3) {
                    alert('Selecione no máximo 3 imagens.');
                    this.value = '';
                    return;
                }
                const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
                for (const file of files) {
                    if (!tiposPermitidos.includes(file.type)) {
                        alert('Formato não suportado: ' + file.name + '. Use JPG, PNG ou WEBP.');
                        this.value = '';
                        imagensSelecionadas = [];
                        atualizarPreviewFotos();
                        return;
                    }
                    if (file.size > 2 * 1024 * 1024) {
                        alert('Arquivo muito grande: ' + file.name + ' (máx. 2MB).');
                        this.value = '';
                        imagensSelecionadas = [];
                        atualizarPreviewFotos();
                        return;
                    }
                }
                imagensSelecionadas = [];
                for (const file of files) {
                    try {
                        const base64 = await lerArquivoComoBase64(file);
                        imagensSelecionadas.push(base64);
                    } catch (e) {
                        alert('Erro ao ler ' + file.name);
                        this.value = '';
                        imagensSelecionadas = [];
                        atualizarPreviewFotos();
                        return;
                    }
                }
                atualizarPreviewFotos();
            });
        }

        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = sanitizarTexto(document.getElementById('nome').value.trim());
            const preco = parseFloat(document.getElementById('preco').value);
            const categoria = document.getElementById('categoria').value;
            const descricao = sanitizarTexto(document.getElementById('descricao').value.trim());
            const estoque = parseInt(document.getElementById('estoque').value) || 0;
            let fotoUrl = document.getElementById('foto-url').value.trim();

            if (!nome || !preco || !descricao) {
                alert('Preencha todos os campos obrigatórios.');
                return;
            }
            if (preco <= 0) {
                alert('Preço deve ser maior que zero.');
                return;
            }
            if (estoque < 0) {
                alert('Estoque não pode ser negativo.');
                return;
            }

            let imagens = [];
            if (imagensSelecionadas.length > 0) {
                imagens = imagensSelecionadas;
            } else if (fotoUrl) {
                imagens = [fotoUrl];
            } else {
                imagens = ['imagens/placeholder.jpg'];
            }

            const produtos = carregarProdutos();
            produtos.push({
                nome,
                preco,
                categoria,
                descricao,
                imagens,
                estoque
            });
            salvarProdutos(produtos);
            alert('Artigo publicado com sucesso!');
            formCadastro.reset();
            document.getElementById('estoque').value = 10;
            imagensSelecionadas = [];
            atualizarPreviewFotos();
            renderizarListaExclusao();
        });
    }

    document.getElementById('btn-enviar-email')?.addEventListener('click', () => {
        const pedidos = carregarPedidos();
        if (pedidos.length === 0) {
            alert('Não há pedidos para enviar.');
            return;
        }
        let corpo = 'Relatório de Pedidos - A Samaritana\n\n';
        pedidos.slice().reverse().forEach(p => {
            corpo += `Pedido #${p.id} - ${p.data}\n`;
            p.itens.forEach(item => {
                corpo += `  - ${item.nome} (Qtd: ${item.quantidade || 1}) - ${formatarPreco(item.preco)}\n`;
            });
            corpo += `  Total: ${formatarPreco(p.total)}\n\n`;
        });
        window.location.href = 'mailto:?subject=Relatório de Pedidos - A Samaritana&body=' + encodeURIComponent(corpo);
    });

    document.getElementById('btn-limpar-pedidos')?.addEventListener('click', () => {
        if (confirm('Limpar todos os pedidos antigos?')) {
            salvarPedidos([]);
            renderizarPedidosAdmin();
            alert('Pedidos removidos com sucesso.');
        }
    });

    if (document.getElementById('lista-contatos-admin')) {
        renderizarContatosAdmin();
    }
}

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded – script iniciado');

    // ---- PÁGINA: INDEX ----
    const grid = document.getElementById('products-grid');
    if (grid) {
        const produtos = carregarProdutos();
        renderizarVitrine(produtos);

        document.querySelectorAll('[data-categoria]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtrarPorCategoria(link.getAttribute('data-categoria'));
            });
        });

        document.getElementById('link-inicio')?.addEventListener('click', (e) => {
            e.preventDefault();
            resetarFiltro();
        });

        document.getElementById('btn-conhecer')?.addEventListener('click', (e) => {
            e.preventDefault();
            rolarParaSecao('vitrine-produtos');
        });

        document.querySelectorAll('[data-secao="topo"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                rolarParaSecao('topo');
            });
        });

        const btnBusca = document.getElementById('btn-busca');
        const campoBusca = document.getElementById('campo-busca');
        if (btnBusca && campoBusca) {
            btnBusca.addEventListener('click', () => {
                const termo = campoBusca.value.trim().toLowerCase();
                const todos = carregarProdutos();
                if (termo === '') {
                    renderizarVitrine(todos);
                    document.getElementById('titulo-vitrine').textContent = 'Destaques de Devoção';
                    return;
                }
                const filtrados = todos.filter(p => p.nome.toLowerCase().includes(termo));
                renderizarVitrine(filtrados);
                document.getElementById('titulo-vitrine').textContent = 'Resultados para "' + termo + '"';
            });
            campoBusca.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') btnBusca.click();
            });
        }

        document.getElementById('cart-icon')?.addEventListener('click', abrirCarrinho);
    }

    // ---- PÁGINA: GESTÃO (admin) ----
    if (document.getElementById('login-overlay') || document.querySelector('.container-admin')) {
        if (verificarAutenticacao()) {
            document.getElementById('login-overlay')?.classList.add('hidden');
            document.getElementById('admin-content')?.classList.add('visible');
            renderizarListaExclusao();
            renderizarPedidosAdmin();
            configurarEventosAdmin();
        } else {
            document.getElementById('login-overlay')?.classList.remove('hidden');
            document.getElementById('admin-content')?.classList.remove('visible');
        }

        const formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const usuario = document.getElementById('usuario').value.trim();
                const senha = document.getElementById('senha').value.trim();
                const erro = document.getElementById('erro-login');
                if (fazerLogin(usuario, senha)) {
                    erro.classList.remove('visible');
                    document.getElementById('login-overlay').classList.add('hidden');
                    document.getElementById('admin-content').classList.add('visible');
                    renderizarListaExclusao();
                    renderizarPedidosAdmin();
                    configurarEventosAdmin();
                } else {
                    erro.classList.add('visible');
                    setTimeout(() => erro.classList.remove('visible'), 3000);
                }
            });
        }

        document.getElementById('btn-sair')?.addEventListener('click', fazerLogout);
    }

    // ---- PÁGINA: CHECKOUT ----
    if (document.querySelector('.checkout-container')) {
        renderizarResumoCheckout();

        document.getElementById('btn-finalizar')?.addEventListener('click', () => {
            const nome = document.getElementById('nome-completo').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const email = document.getElementById('email').value.trim();
            const rua = document.getElementById('rua').value.trim();
            const numero = document.getElementById('numero').value.trim();
            const bairro = document.getElementById('bairro').value.trim();
            const cidade = document.getElementById('cidade').value.trim();
            const estado = document.getElementById('estado').value.trim();
            const cep = document.getElementById('cep-entrega').value.trim();

            if (!nome || !cpf || !email || !rua || !numero || !bairro || !cidade || !estado || !cep) {
                alert('Preencha todos os campos obrigatórios (*).');
                return;
            }
            if (!validarCPF(cpf)) {
                alert('CPF inválido. Use o formato 000.000.000-00.');
                return;
            }
            if (!validarEmail(email)) {
                alert('E-mail inválido.');
                return;
            }
            if (cep.replace(/\D/g, '').length !== 8) {
                alert('CEP inválido. Use o formato 00000-000.');
                return;
            }

            const dadosCliente = { nome, cpf, email, endereco: { rua, numero, bairro, cidade, estado, cep } };
            const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || 'pix';

            const sucesso = finalizarPedido(dadosCliente);
            if (sucesso) {
                alert('Pedido finalizado com sucesso! Em breve você receberá um e-mail de confirmação.\n\n(Simulação – integração com backend em breve)');
                window.location.href = 'index.html';
            }
        });
    }

    // ---- PÁGINA: PRODUTO ----
    if (document.getElementById('detalhe-nome')) {
        console.log('Página de produto detectada');
        carregarDetalhesProduto();
        // O restante dos eventos é configurado dentro de carregarDetalhesProduto() e configurarEventosProduto()
    }

    // ---- CONTROLE DO CARRINHO (global) ----
    document.getElementById('btn-fechar-cart')?.addEventListener('click', fecharCarrinho);
    document.getElementById('cart-overlay')?.addEventListener('click', fecharCarrinho);

    // ---- MENU STICKY ----
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar-principal');
        const header = document.querySelector('header');
        const topBar = document.querySelector('.top-bar');
        if (navbar && header && topBar) {
            const alturaHeader = header.offsetHeight + topBar.offsetHeight;
            if (window.scrollY >= alturaHeader) {
                navbar.classList.add('fixo');
                document.body.classList.add('nav-fixada');
            } else {
                navbar.classList.remove('fixo');
                document.body.classList.remove('nav-fixada');
            }
        }
    });

    // Atualiza contador e carrinho ao carregar
    atualizarContadorCarrinho();
    if (document.getElementById('itens-do-carrinho')) {
        renderizarCarrinhoLateral();
    }

    console.log('Inicialização concluída');
});
