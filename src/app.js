// MIT License
// Autor atual: Cascade
// Descrição: Aplicação CLI interativa para consultar adoção ideal por animal ou por pessoa
// Data: 10-09-2025

import readline from 'node:readline';
import { AbrigoAnimais } from './abrigo-animais.js';

// Dados exibidos ao usuário
const ANIMAIS = [
  { id: 'REX', nome: 'Rex', favoritos: ['RATO', 'BOLA'] },
  { id: 'MIMI', nome: 'Mimi', favoritos: ['BOLA', 'LASER'] },
  { id: 'FOFO', nome: 'Fofo', favoritos: ['BOLA', 'RATO', 'LASER'] },
  { id: 'ZERO', nome: 'Zero', favoritos: ['RATO', 'BOLA'] },
  { id: 'BOLA', nome: 'Bola', favoritos: ['CAIXA', 'NOVELO'] },
  { id: 'BEBE', nome: 'Bebe', favoritos: ['LASER', 'RATO', 'BOLA'] },
  { id: 'LOCO', nome: 'Loco', favoritos: ['SKATE', 'RATO'] },
];

// Listas padrão de brinquedos por pessoa (4 pessoas, todas com 2 itens)
// Pensadas para reduzir empates, mas manter:
// - Pelo menos um animal em abrigo por incompatibilidade (ex.: Bebê exige 3 favoritos)
// - Pelo menos um animal em abrigo por múltiplas compatibilidades (empate)
const PESSOAS = [
  { numero: 1, brinquedos: 'RATO,BOLA' },      // favorece Rex e Zero
  { numero: 2, brinquedos: 'BOLA,LASER' },     // favorece Mimi
  { numero: 3, brinquedos: 'CAIXA,NOVELO' },   // favorece Bola
  { numero: 4, brinquedos: 'BOLA,LASER' },     // duplica Mimi para provocar empate controlado
];

// Lista "dummy" para segunda pessoa em consultas isoladas (válida, mas improvável de adotar)
const DUMMY_BRINQUEDOS = 'SKATE';

function getAnimalById(id) {
  return ANIMAIS.find((a) => a.id === id) || null;
}

function getFavoritosByAnimalId(id) {
  const a = getAnimalById(id);
  return a ? a.favoritos : [];
}

function normalizaListaTexto(txt) {
  return String(txt || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function isSubsequencia(favoritos, brinquedos) {
  if (favoritos.length === 0) return true;
  let i = 0;
  for (let j = 0; j < brinquedos.length; j++) {
    if (brinquedos[j] === favoritos[i]) {
      i = i + 1;
      if (i === favoritos.length) return true;
    }
  }
  return false;
}

function isTodosFavoritosPresentes(favoritos, brinquedos) {
  for (let i = 0; i < favoritos.length; i++) {
    const fav = favoritos[i];
    let encontrado = false;
    for (let j = 0; j < brinquedos.length; j++) {
      if (brinquedos[j] === fav) { encontrado = true; break; }
    }
    if (!encontrado) return false;
  }
  return true;
}

function mostrarCabecalho() {
  console.clear();
  console.log('=== Abrigo de Animais - Consulta Interativa ===');
  console.log('');
  console.log('Lista de animais e seus brinquedos favoritos:');
  ANIMAIS.forEach((a, idx) => {
    console.log(`${idx + 1}. ${a.nome} - favoritos: ${a.favoritos.join(', ')}`);
  });
  console.log('');
  console.log('Pessoas e seus brinquedos:');
  PESSOAS.forEach((p) => {
    console.log(`Pessoa ${p.numero}: ${p.brinquedos}`);
  });
  console.log('');
}

function mostrarMenu() {
  console.log('Menu principal:');
  console.log('1 - Escolha o animal');
  console.log('2 - Escolha a pessoa');
  console.log('3 - Sair');
}

function criarInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function perguntar(rl, texto) {
  return new Promise((resolve) => rl.question(texto, resolve));
}

function getPessoaByNumero(numero) {
  return PESSOAS.find((p) => p.numero === numero) || null;
}

function pessoaAdotaAnimal(pessoa, animalId) {
  const favoritos = getFavoritosByAnimalId(animalId);
  const brinquedos = normalizaListaTexto(pessoa.brinquedos);
  const animal = getAnimalById(animalId);
  const nomeAnimal = animal ? animal.nome : animalId;

  if (animalId === 'LOCO') {
    const atendeFavoritos = isTodosFavoritosPresentes(favoritos, brinquedos);
    if (atendeFavoritos) {
      // Não afirmamos adoção por exigir companhia; apenas omitimos negativa detalhada
      return {
        adota: false,
        explicacaoPositiva: `Pessoa ${pessoa.numero} possui os favoritos de ${nomeAnimal} (${favoritos.join(', ')}), mas ${nomeAnimal} exige companhia prévia (regra 6).`
      };
    }
    return { adota: false };
  }

  const atende = isSubsequencia(favoritos, brinquedos);
  if (atende) {
    return {
      adota: true,
      explicacaoPositiva: `Pessoa ${pessoa.numero} tem os favoritos de ${nomeAnimal} na ordem: ${favoritos.join(', ')} (pessoa: ${brinquedos.join(', ')}).`
    };
  }
  return { adota: false };
}

function escolherPessoaDestinoParaAnimal(animalId) {
  const explicacoesPositivas = [];
  const candidatas = [];
  for (const p of PESSOAS) {
    const r = pessoaAdotaAnimal(p, animalId);
    if (r.adota) {
      candidatas.push(p.numero);
      if (r.explicacaoPositiva) explicacoesPositivas.push(r.explicacaoPositiva);
    } else if (r.explicacaoPositiva) {
      // Informação positiva relevante (ex.: Loco tem favoritos presentes)
      explicacoesPositivas.push(r.explicacaoPositiva);
    }
  }
  if (candidatas.length === 1) {
    return { destino: `Pessoa ${candidatas[0]}`, explicacoes: explicacoesPositivas };
  }
  if (candidatas.length > 1) {
    explicacoesPositivas.push('Mais de uma pessoa é compatível. Pela regra 4, o animal vai para o abrigo.');
    return { destino: 'abrigo', explicacoes: explicacoesPositivas };
  }
  // Nenhuma pessoa compatível
  return { destino: 'abrigo', explicacoes: [] };
}

function escolherAnimalIdealParaPessoa(numeroPessoa) {
  const pessoa = getPessoaByNumero(numeroPessoa);
  if (!pessoa) return { animal: null, explicacoes: [] };
  for (const a of ANIMAIS) {
    const r = pessoaAdotaAnimal(pessoa, a.id);
    if (r.adota) {
      return { animal: a.nome, explicacoes: r.explicacaoPositiva ? [r.explicacaoPositiva] : [] };
    }
  }
  return { animal: null, explicacoes: [] };
}

// Fluxo focado: ANIMAIS. Retorna 'animal' (permanece), 'pessoa' (troca) ou 'sair'.
async function fluxoAnimais(rl) {
  while (true) {
    console.log('\nAnimais:');
    ANIMAIS.forEach((a, idx) => {
      console.log(`${idx + 1}. ${a.nome}`);
    });
    const txt = await perguntar(rl, '\nDigite o número do animal: ');
    const indice = parseInt(txt, 10) - 1;
    if (indice < 0 || indice >= ANIMAIS.length) {
      console.log('Opção inválida.');
    } else {
      const animal = ANIMAIS[indice];
      const res = escolherPessoaDestinoParaAnimal(animal.id);
      console.log(`\nA pessoa ideal para ${animal.nome} é: ${res.destino}`);
      for (const e of res.explicacoes) {
        console.log(`- ${e}`);
      }
      console.log('');
    }

    console.log('1 - Escolher outro animal');
    console.log('2 - Escolher outra pessoa');
    console.log('3 - Sair');
    const sub = await perguntar(rl, '\nDigite o número da opção: ');
    const subOpcao = parseInt(sub, 10);
    if (subOpcao === 1) {
      console.log('');
      continue; // permanece em animais
    } else if (subOpcao === 2) {
      console.log('');
      return 'pessoa'; // troca para pessoas
    } else if (subOpcao === 3) {
      console.log('\nSaindo...');
      return 'sair';
    } else {
      console.log('');
      continue;
    }
  }
}

// Fluxo focado: PESSOAS. Retorna 'pessoa' (permanece), 'animal' (troca) ou 'sair'.
async function fluxoPessoas(rl) {
  while (true) {
    console.log('\nPessoas:');
    PESSOAS.forEach((p) => {
      console.log(`${p.numero}. Pessoa ${p.numero} - brinquedos: ${p.brinquedos}`);
    });
    const txt = await perguntar(rl, '\nDigite o número da pessoa: ');
    const pessoaNumero = parseInt(txt, 10);
    const pessoa = getPessoaByNumero(pessoaNumero);
    if (!pessoa) {
      console.log('Opção inválida.');
    } else {
      const res = escolherAnimalIdealParaPessoa(pessoaNumero);
      if (res.animal) {
        console.log(`\nO animal ideal para a Pessoa ${pessoaNumero} é: ${res.animal}`);
        for (const e of res.explicacoes) {
          console.log(`- ${e}`);
        }
        console.log('');
      } else {
        console.log(`\nNenhum animal ideal encontrado para a Pessoa ${pessoaNumero} com as listas atuais.\n`);
      }
    }

    console.log('1 - Escolher outro animal');
    console.log('2 - Escolher outra pessoa');
    console.log('3 - Sair');
    const sub = await perguntar(rl, '\nDigite o número da opção: ');
    const subOpcao = parseInt(sub, 10);
    if (subOpcao === 1) {
      console.log('');
      return 'animal'; // troca para animais
    } else if (subOpcao === 2) {
      console.log('');
      continue; // permanece em pessoas
    } else if (subOpcao === 3) {
      console.log('\nSaindo...');
      return 'sair';
    } else {
      console.log('');
      continue;
    }
  }
}

async function loop() {
  const rl = criarInterface();

  try {
    // Mostra cabeçalho inicial com listas
    mostrarCabecalho();
    let contexto = null; // null -> mostrar menu principal, 'animal' ou 'pessoa'

    mainLoop: while (true) {
      if (contexto === null) {
        mostrarMenu();
        const opcaoTxt = await perguntar(rl, '\nDigite o número da opção desejada: ');
        const opcao = parseInt(opcaoTxt, 10);
        if (opcao === 1) contexto = 'animal';
        else if (opcao === 2) contexto = 'pessoa';
        else if (opcao === 3) { console.log('\nSaindo...'); break; }
        else { console.log('Opção inválida.'); continue; }
      }

      if (contexto === 'animal') {
        const res = await fluxoAnimais(rl);
        if (res === 'pessoa') { contexto = 'pessoa'; continue; }
        if (res === 'sair') { break; }
        contexto = 'animal';
        continue;
      }

      if (contexto === 'pessoa') {
        const res = await fluxoPessoas(rl);
        if (res === 'animal') { contexto = 'animal'; continue; }
        if (res === 'sair') { break; }
        contexto = 'pessoa';
        continue;
      }
    }
  } finally {
    rl.close();
  }
}

loop();
