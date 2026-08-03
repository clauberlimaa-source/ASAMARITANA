// js/seguranca.js

// Função para escapar HTML e prevenir XSS
function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Função para criar elemento seguro com texto escapado
function criarElementoSeguro(tag, atributos = {}, texto = '') {
    const el = document.createElement(tag);
    for (const [chave, valor] of Object.entries(atributos)) {
        if (chave === 'textContent') {
            el.textContent = valor;
        } else if (chave === 'innerHTML') {
            // Só use se confiar no conteúdo (ex: ícones HTML) - melhor evitar
            el.innerHTML = valor;
        } else {
            el.setAttribute(chave, valor);
        }
    }
    if (texto) {
        el.textContent = texto;
    }
    return el;
}

// Validação de CPF (simples)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    // Elimina CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    return true;
}

// Validação de email
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitização de entrada (remove tags)
function sanitizar(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.textContent; // retorna texto puro
}

// Exportar (se usar módulos, mas vamos manter no escopo global)