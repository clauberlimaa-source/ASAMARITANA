/**
 * script.js – Versão completa com:
 * - Segurança (sanitização, validação)
 * - Autenticação admin (login/senha)
 * - Múltiplas imagens (até 3 por produto)
 * - Estoque e pedidos
 * - Carrinho, checkout, vitrine, detalhes
 * - Correção do "Início" (resetar filtro)
 */

// ============================================================
//  UTILITÁRIOS DE SEGURANÇA E FORMATAÇÃO
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
//  AUTENTICAÇÃO (admin)
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
//  CORREÇÃO DO "INÍCIO" – resetar filtro
// ============================================================

function resetarFiltro() {
    const titulo = document.getElementById('titulo-vitrine');
    if (titulo) titulo.textContent = 'Destaques de Devoção';
    const produtos = carregarProdutos();
    renderizarVitrine(produtos);
    rolarParaSecao('vitrine-produtos');
}

// ============================================================
//  GERENCIAMENTO DE PRODUTOS (com estoque e múltiplas imagens)
// ============================================================

function carregarProdutos() {
    try {
        const dados = localStorage.getItem('produtos_samaritana');
        if (dados) {
            const produtos = JSON.parse(dados);
            if (Array.isArray(produtos) && produtos.length > 0) return produtos;
        }
    } catch (e) {}
    // Produtos padrão com estoque e array de imagens
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
//  CARRINHO (sessionStorage)
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
        el.textContent = total;
    });
}

// ============================================================
//  UPLOAD DE MÚLTIPLAS IMAGENS (até 3)
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
//  RENDERIZAÇÃO DA VITRINE (usa a primeira imagem)
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

    lista.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Link para detalhes
        const link = document.createElement('div');
        link.style.cursor = 'pointer';
        link.addEventListener('click', () => {
            sessionStorage.setItem('produto_atual_samaritana', JSON.stringify(produto));
            window.location.href = 'produto.html';
        });

        // Imagem (usa a primeira do array)
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

        // Nome
        const nomeH3 = document.createElement('h3');
        nomeH3.textContent = sanitizarTexto(produto.nome);

        link.appendChild(imgDiv);
        link.appendChild(nomeH3);

        // Preço
        const precoP = document.createElement('p');
        precoP.className = 'price';
        precoP.textContent = formatarPreco(produto.preco);

        // Botão adicionar
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

        // Badge de estoque baixo
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

// ============================================================
//  RENDERIZAÇÃO DO CARRINHO LATERAL (com botão remover)
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

        // Imagem
        const img = document.createElement('img');
        img.src = item.fotoUrl || 'imagens/placeholder.jpg';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '4px';
        img.style.backgroundColor = '#fafbfc';
        img.style.padding = '4px';

        // Informações
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

        // Botão remover (X)
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

// ============================================================
//  REMOVER ITEM DO CARRINHO (por índice)
// ============================================================

function removerItemCarrinho(index) {
    const itens = carregarCarrinho();
    if (index >= 0 && index < itens.length) {
        itens.splice(index, 1);
        salvarCarrinho(itens);
        atualizarContadorCarrinho();
        renderizarCarrinhoLateral();
        // Se o carrinho estiver vazio, fechar ou manter aberto (opcional)
        if (itens.length === 0) {
            // Podemos fechar automaticamente? Deixamos aberto para o usuário ver a mensagem.
        }
    }
}

// ============================================================
//  RENDERIZAÇÃO DA LISTA DE PRODUTOS NO ADMIN
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
//  RENDERIZAÇÃO DOS PEDIDOS NO ADMIN
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
//  CONTROLE DO CARRINHO LATERAL
// ============================================================

function abrirCarrinho() {
    document.getElementById('carrinho-lateral')?.classList.add('active');
    document.getElementById('cart-overlay')?.classList.add('active');
    renderizarCarrinhoLateral();
}

function fecharCarrinho() {
    document.getElementById('carrinho-lateral')?.classList.remove('active');
    document.getElementById('cart-overlay')?.classList.remove('active');
}

// ============================================================
//  FUNÇÃO DE ROLAGEM SUAVE
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
//  FUNÇÃO PARA CARREGAR DETALHES DO PRODUTO (com múltiplas imagens)
// ============================================================

function carregarDetalhesProduto() {
    const produtoStr = sessionStorage.getItem('produto_atual_samaritana');
    if (!produtoStr) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const produto = JSON.parse(produtoStr);
        document.title = sanitizarTexto(produto.nome) + ' | A Samaritana';
        document.getElementById('detalhe-nome').textContent = sanitizarTexto(produto.nome);
        document.getElementById('detalhe-preco').textContent = formatarPreco(produto.preco);
        document.getElementById('detalhe-descricao').textContent = sanitizarTexto(produto.descricao || '');
        document.getElementById('detalhe-categoria').textContent = sanitizarTexto(produto.categoria || 'Artigo de Fé');

        const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['imagens/placeholder.jpg'];
        const imgPrincipal = document.getElementById('detalhe-imagem');
        if (imgPrincipal) {
            imgPrincipal.src = imagens[0];
            imgPrincipal.alt = sanitizarTexto(produto.nome);
        }

        // Thumbnails
        const thumbContainer = document.querySelector('.thumb-images');
        if (thumbContainer) {
            thumbContainer.innerHTML = '';
            imagens.forEach((src, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'thumb' + (idx === 0 ? ' active' : '');
                thumb.style.cssText = 'width: 70px; height: 70px; background-image: url('+src+'); background-size: cover; background-position: center; border: 2px solid ' + (idx === 0 ? '#bfa15f' : '#eef2f5') + '; border-radius: 4px; cursor: pointer;';
                thumb.addEventListener('click', () => {
                    imgPrincipal.src = src;
                    document.querySelectorAll('.thumb').forEach(t => t.style.borderColor = '#eef2f5');
                    thumb.style.borderColor = '#bfa15f';
                });
                thumbContainer.appendChild(thumb);
            });
        }

        // Botão comprar
        const btnComprar = document.getElementById('btn-comprar-agora');
        if (btnComprar) {
            const estoque = produto.estoque !== undefined ? produto.estoque : 0;
            if (estoque <= 0) {
                btnComprar.textContent = 'Esgotado';
                btnComprar.disabled = true;
                btnComprar.style.backgroundColor = '#a0aec0';
            } else {
                btnComprar.textContent = '🕊️ Comprar Agora';
                btnComprar.disabled = false;
                btnComprar.style.backgroundColor = '';
                btnComprar.addEventListener('click', () => {
                    adicionarAoCarrinho(produto);
                    window.location.href = 'checkout.html';
                });
            }
        }
    } catch (e) {
        window.location.href = 'index.html';
    }
}

// ============================================================
//  FUNÇÃO PARA RENDERIZAR RESUMO DO CHECKOUT
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

// ============================================================
//  FUNÇÃO PARA FINALIZAR PEDIDO (salva pedido e limpa carrinho)
// ============================================================

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

// ============================================================
//  INICIALIZAÇÃO E EVENTOS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- PÁGINA: INDEX ----
    const grid = document.getElementById('products-grid');
    if (grid) {
        const produtos = carregarProdutos();
        renderizarVitrine(produtos);

        // Filtros por categoria
        document.querySelectorAll('[data-categoria]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtrarPorCategoria(link.getAttribute('data-categoria'));
            });
        });

        // Link "Início" – resetar filtro
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
        // Verifica autenticação
        if (verificarAutenticacao()) {
            document.getElementById('login-overlay')?.classList.add('hidden');
            document.getElementById('admin-content')?.classList.add('visible');
            // Renderiza os dados
            renderizarListaExclusao();
            renderizarPedidosAdmin();
            // Configura eventos do admin (formulário, upload, etc.)
            configurarEventosAdmin();
        } else {
            document.getElementById('login-overlay')?.classList.remove('hidden');
            document.getElementById('admin-content')?.classList.remove('visible');
        }

        // Formulário de login
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

        // Botão sair
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
        carregarDetalhesProduto();

        const qtdInput = document.getElementById('qtd-produto');
        document.getElementById('qtd-mais')?.addEventListener('click', () => {
            qtdInput.value = parseInt(qtdInput.value) + 1;
        });
        document.getElementById('qtd-menos')?.addEventListener('click', () => {
            if (parseInt(qtdInput.value) > 1) qtdInput.value = parseInt(qtdInput.value) - 1;
        });

        document.getElementById('cart-icon-detalhe')?.addEventListener('click', abrirCarrinho);
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

    atualizarContadorCarrinho();
    if (document.getElementById('itens-do-carrinho')) {
        renderizarCarrinhoLateral();
    }

});

// ============================================================
//  CONFIGURAÇÃO DE EVENTOS DO ADMIN (chamada após login)
// ============================================================

function configurarEventosAdmin() {
    // Cadastro de produto
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        // Sugestões de foto
        document.querySelectorAll('.sugestao-foto').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('foto-url').value = el.getAttribute('data-url');
            });
        });

        // Upload de múltiplas imagens
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

        // Submit do cadastro
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

    // Botão enviar e-mail (simulação)
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

    // Botão limpar pedidos
    document.getElementById('btn-limpar-pedidos')?.addEventListener('click', () => {
        if (confirm('Limpar todos os pedidos antigos?')) {
            salvarPedidos([]);
            renderizarPedidosAdmin();
            alert('Pedidos removidos com sucesso.');
        }
    });
}
