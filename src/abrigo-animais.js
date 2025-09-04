// MIT License
// Autor atual: Cascade
// Descrição: Desafio do Abrigo de Animais (StartDB-2025)
// Data: 04-09-2025

class AbrigoAnimais {

  constructor(config) {
    // Configuração opcional para testes (injeção de dependências)
    this._cfg = config;
  }

  encontraPessoas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais) {
    const cfg = this._cfg || {};
    const ANIMAIS_VALIDOS = cfg.ANIMAIS_VALIDOS || ['REX', 'MIMI', 'FOFO', 'ZERO', 'BOLA', 'BEBE', 'LOCO'];
    const BRINQUEDOS_VALIDOS = cfg.BRINQUEDOS_VALIDOS || ['RATO', 'BOLA', 'CAIXA', 'NOVELO', 'LASER', 'SKATE'];

    // Constantes para números mágicos
    const LIMITE_ADOCOES_POR_PESSOA = 3;
    const MINIMO_ADOCOES_PARA_LOCO = 1;

    const nomesOriginais = cfg.nomesOriginais || {
      REX: 'Rex',
      MIMI: 'Mimi',
      FOFO: 'Fofo',
      ZERO: 'Zero',
      BOLA: 'Bola',
      BEBE: 'Bebe',
      LOCO: 'Loco'
    };

    const favoritosPorAnimal = cfg.favoritosPorAnimal || {
      REX: ['RATO', 'BOLA'],
      MIMI: ['BOLA', 'LASER'],
      FOFO: ['BOLA', 'RATO', 'LASER'],
      ZERO: ['RATO', 'BOLA'],
      BOLA: ['CAIXA', 'NOVELO'],
      BEBE: ['LASER', 'RATO', 'BOLA'],
      LOCO: ['SKATE', 'RATO']
    };

    // --- Funções auxiliares ---

    // Normaliza uma lista de texto em array de strings maiúsculas
    function normalizaLista(texto) {
      if (texto === null) {
        texto = '';
      }
      if (texto === undefined) {
        texto = '';
      }
      
      var partes = texto.split(',');
      var listaLimpa = [];
      
      for (var indiceParte = 0; indiceParte < partes.length; indiceParte++) {
        var item = partes[indiceParte].trim().toUpperCase();
        if (item.length > 0) {
          listaLimpa.push(item);
        }
      }
      
      return listaLimpa;
    }

    // Verifica se há duplicados na lista
    function isListaComDuplicados(lista) {
      for (var indiceAtual = 0; indiceAtual < lista.length; indiceAtual++) {
        for (var indiceComparacao = indiceAtual + 1; indiceComparacao < lista.length; indiceComparacao++) {
          if (lista[indiceAtual] === lista[indiceComparacao]) {
            return true;
          }
        }
      }
      return false;
    }

    // Verifica se favoritos aparecem como subsequência na lista de brinquedos
    function isSubsequencia(favoritos, brinquedos) {
      if (favoritos.length === 0) {
        return true;
      }
      
      var indiceFavorito = 0;
      
      for (var indiceBrinquedo = 0; indiceBrinquedo < brinquedos.length; indiceBrinquedo++) {
        if (brinquedos[indiceBrinquedo] === favoritos[indiceFavorito]) {
          indiceFavorito = indiceFavorito + 1;
          if (indiceFavorito === favoritos.length) {
            return true;
          }
        }
      }
      
      return false;
    }

    // Verifica se todos favoritos estão presentes, sem importar ordem
    function isTodosFavoritosPresentes(favoritos, brinquedos) {
      for (var indiceFavorito = 0; indiceFavorito < favoritos.length; indiceFavorito++) {
        var isFavoritoEncontrado = false;
        for (var indiceBrinquedo = 0; indiceBrinquedo < brinquedos.length; indiceBrinquedo++) {
          if (favoritos[indiceFavorito] === brinquedos[indiceBrinquedo]) {
            isFavoritoEncontrado = true;
            break;
          }
        }
        if (isFavoritoEncontrado === false) {
          return false;
        }
      }
      return true;
    }

    // Valida se a lista está vazia
    function isListaVazia(lista) {
      if (lista.length === 0) {
        return true;
      } else {
        return false;
      }
    }

    // Valida se há itens inválidos na lista
    function isListaComItensInvalidos(lista, validos) {
      for (var indiceItem = 0; indiceItem < lista.length; indiceItem++) {
        var isItemValido = false;
        for (var indiceValido = 0; indiceValido < validos.length; indiceValido++) {
          if (lista[indiceItem] === validos[indiceValido]) {
            isItemValido = true;
            break;
          }
        }
        if (isItemValido === false) {
          return true;
        }
      }
      return false;
    }

    // Valida lista genérica: vazia, duplicados ou itens inválidos
    function isListaInvalida(lista, validos) {
      if (isListaVazia(lista)) {
        return true;
      }
      if (isListaComDuplicados(lista)) {
        return true;
      }
      if (isListaComItensInvalidos(lista, validos)) {
        return true;
      }
      return false;
    }

    // Decide o destino do animal: abrigo, pessoa 1 ou pessoa 2
    function decideDestino(animal, favoritos, contador, listaPessoa1, listaPessoa2) {
      var isAtendidoPessoa1 = false;
      var isAtendidoPessoa2 = false;
      
      if (animal === 'LOCO') {
        isAtendidoPessoa1 = isTodosFavoritosPresentes(favoritos, listaPessoa1);
        isAtendidoPessoa2 = isTodosFavoritosPresentes(favoritos, listaPessoa2);
      } else {
        isAtendidoPessoa1 = isSubsequencia(favoritos, listaPessoa1);
        isAtendidoPessoa2 = isSubsequencia(favoritos, listaPessoa2);
      }

      if (isAtendidoPessoa1 === true && isAtendidoPessoa2 === true) {
        return 'abrigo';
      }

      if (animal === 'LOCO') {
        if (isAtendidoPessoa1 === true && contador[1] >= MINIMO_ADOCOES_PARA_LOCO && contador[1] < LIMITE_ADOCOES_POR_PESSOA) {
          return 'pessoa 1';
        }
        if (isAtendidoPessoa2 === true && contador[2] >= MINIMO_ADOCOES_PARA_LOCO && contador[2] < LIMITE_ADOCOES_POR_PESSOA) {
          return 'pessoa 2';
        }
        return 'abrigo';
      }

      if (isAtendidoPessoa1 === true && contador[1] < LIMITE_ADOCOES_POR_PESSOA) {
        return 'pessoa 1';
      }
      if (isAtendidoPessoa2 === true && contador[2] < LIMITE_ADOCOES_POR_PESSOA) {
        return 'pessoa 2';
      }
      return 'abrigo';
    }

    // --- Entrada normalizada ---
    var listaPessoa1 = normalizaLista(brinquedosPessoa1);
    var listaPessoa2 = normalizaLista(brinquedosPessoa2);
    var listaAnimais = normalizaLista(ordemAnimais);

    // --- Validações ---
    if (isListaInvalida(listaAnimais, ANIMAIS_VALIDOS) === true) {
      return { erro: 'Animal inválido' };
    }

    // Validar brinquedos separadamente por pessoa (duplicados entre pessoas são permitidos)
    if (isListaInvalida(listaPessoa1, BRINQUEDOS_VALIDOS) === true) {
      return { erro: 'Brinquedo inválido' };
    }
    if (isListaInvalida(listaPessoa2, BRINQUEDOS_VALIDOS) === true) {
      return { erro: 'Brinquedo inválido' };
    }

    // --- Processamento ---
    var contador = { 1: 0, 2: 0 };
    var resultado = [];

    for (var indiceAnimal = 0; indiceAnimal < listaAnimais.length; indiceAnimal = indiceAnimal + 1) {
      var animal = listaAnimais[indiceAnimal];
      var nome = nomesOriginais[animal];
      if (nome === undefined) {
        nome = animal;
      }
      
      var favoritos = favoritosPorAnimal[animal];
      if (favoritos === undefined) {
        favoritos = [];
      }
      
      var destino = decideDestino(animal, favoritos, contador, listaPessoa1, listaPessoa2);

      if (destino === 'pessoa 1') {
        contador[1] = contador[1] + 1;
      }
      if (destino === 'pessoa 2') {
        contador[2] = contador[2] + 1;
      }
      
      resultado.push(nome + ' - ' + destino);
    }

    // Ordena o resultado em ordem alfabética
    resultado.sort(function(primeiro, segundo) {
      return primeiro.localeCompare(segundo, 'pt-BR');
    });

    return { lista: resultado };
  }
}

export { AbrigoAnimais as AbrigoAnimais };
