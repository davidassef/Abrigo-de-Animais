// Autor atual: David Assef
// Descrição: Testes do Abrigo de Animais
// Data: 04-09-2025

import { AbrigoAnimais } from "./abrigo-animais";

describe('Abrigo de Animais', () => {

  test('Deve rejeitar animal inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('CAIXA,RATO', 'RATO,BOLA', 'Lulu');
    expect(resultado.erro).toBe('Animal inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Cobre favoritos vazios (subsequência retorna true) e fallback de nome não mapeado', () => {
    const cfg = {
      ANIMAIS_VALIDOS: ['REX', 'NOVO'],
      // nomesOriginais sem NOVO para acionar fallback de nome
      nomesOriginais: { REX: 'Rex' },
      // favoritosPorAnimal com NOVO: [] para acionar early return de subsequência
      favoritosPorAnimal: { REX: ['RATO','BOLA'], NOVO: [] }
    };
    const abrigo = new AbrigoAnimais(cfg);
    const resultado = abrigo.encontraPessoas('BOLA', 'RATO', 'NOVO');
    // Sem favoritos, ambos atendem => abrigo. Nome cai no fallback e permanece 'NOVO'
    expect(resultado.lista).toContain('NOVO - abrigo');
    expect(resultado.erro).toBeFalsy();
  });

  test('Cobre favoritos undefined (fallback para [])', () => {
    const cfg = {
      ANIMAIS_VALIDOS: ['REX', 'SEM_FAV'],
      nomesOriginais: { REX: 'Rex', SEM_FAV: 'SemFav' },
avid      // favoritosPorAnimal não tem SEM_FAV para acionar fallback de []
    };
    const abrigo = new AbrigoAnimais(cfg);
    const resultado = abrigo.encontraPessoas('BOLA', 'RATO', 'SEM_FAV');
    // Sem favoritos, ambos atendem => abrigo
    expect(resultado.lista).toContain('SemFav - abrigo');
    expect(resultado.erro).toBeFalsy();
  });

  test('Loco com companhia: pode ir para pessoa 2', () => {
    // Pessoa 2 adota o primeiro animal (companhia) e depois adota o Loco
    const resultado = new AbrigoAnimais().encontraPessoas('BOLA', 'RATO,BOLA,SKATE', 'Rex,Loco');
    expect(resultado.lista).toContain('Rex - pessoa 2');
    expect(resultado.lista).toContain('Loco - pessoa 2');
    expect(resultado.erro).toBeFalsy();
  });

  test('Lista de animais vazia deve retornar erro de animal inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'RATO,BOLA', '');
    expect(resultado.erro).toBe('Animal inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Trata null em brinquedos da pessoa 1 (normaliza para vazio) e retorna erro de brinquedo inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas(null, 'RATO,BOLA', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Trata undefined em brinquedos da pessoa 2 (normaliza para vazio) e retorna erro de brinquedo inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', undefined, 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Brinquedo inválido por duplicidade na pessoa 2', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO', 'RATO,RATO', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Deve rejeitar brinquedo inválido por pessoa (itens fora da lista)', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('PEDRA,BOLA', 'RATO,BOLA', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Deve rejeitar brinquedo duplicado por pessoa', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,RATO', 'BOLA', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Em caso de empate (ambas as pessoas atendem), animal vai para o abrigo', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'RATO,BOLA', 'Rex');
    expect(resultado.lista.length).toBe(1);
    expect(resultado.lista[0]).toBe('Rex - abrigo');
    expect(resultado.erro).toBeFalsy();
  });

  test('Respeita o limite de 3 adoções por pessoa', () => {
    const pessoa1 = 'LASER,RATO,BOLA,CAIXA,NOVELO,SKATE';
    const pessoa2 = 'SKATE';
    const resultado = new AbrigoAnimais().encontraPessoas(pessoa1, pessoa2, 'Rex,Zero,Bebe,Bola');
    // Após ordenar alfabeticamente
    expect(resultado.lista).toEqual([
      'Bebe - pessoa 1',
      'Bola - abrigo',
      'Rex - pessoa 1',
      'Zero - pessoa 1'
    ]);
    expect(resultado.erro).toBeFalsy();
  });

  test('Loco não exige ordem, mas precisa de companhia: sem companhia vai para abrigo', () => {
    // Pessoa 1 tem os favoritos (ordem diferente), mas sem companhia prévia
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,SKATE', 'BOLA', 'Loco');
    expect(resultado.lista.length).toBe(1);
    expect(resultado.lista[0]).toBe('Loco - abrigo');
    expect(resultado.erro).toBeFalsy();
  });

  test('Loco com companhia: pode ir para pessoa 1', () => {
    // Primeiro um animal que a pessoa 1 adota, depois Loco
    const resultado = new AbrigoAnimais().encontraPessoas('LASER,RATO,BOLA,SKATE', 'BOLA', 'Bebe,Loco');
    expect(resultado.lista).toContain('Bebe - pessoa 1');
    expect(resultado.lista).toContain('Loco - pessoa 1');
    expect(resultado.erro).toBeFalsy();
  });

  test('Deve encontrar pessoa para um animal', () => {
    const resultado = new AbrigoAnimais().encontraPessoas(
      'RATO,BOLA', 'RATO,NOVELO', 'Rex,Fofo');
      expect(resultado.lista[0]).toBe('Fofo - abrigo');
      expect(resultado.lista[1]).toBe('Rex - pessoa 1');
      expect(resultado.lista.length).toBe(2);
      expect(resultado.erro).toBeFalsy();
  });

  test('Deve encontrar pessoa para um animal intercalando brinquedos', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('BOLA,LASER',
      'BOLA,NOVELO,RATO,LASER', 'Mimi,Fofo,Rex,Bola');

      expect(resultado.lista[0]).toBe('Bola - abrigo');
      expect(resultado.lista[1]).toBe('Fofo - pessoa 2');
      expect(resultado.lista[2]).toBe('Mimi - abrigo');
      expect(resultado.lista[3]).toBe('Rex - abrigo');
      expect(resultado.lista.length).toBe(4);
      expect(resultado.erro).toBeFalsy();
  });
});
