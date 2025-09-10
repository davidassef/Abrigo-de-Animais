// MIT License
// Autor atual: Cascade
// Descrição: CLI para executar a lógica do Abrigo de Animais via terminal
// Data: 10-09-2025

import { AbrigoAnimais } from './abrigo-animais.js';

function printUso() {
  console.log('Uso:');
  console.log("  node src/cli.js '<brinquedosPessoa1>' '<brinquedosPessoa2>' '<ordemAnimais>'");
  console.log('Exemplo:');
  console.log("  node src/cli.js 'RATO,BOLA' 'RATO,NOVELO' 'Rex,Fofo'\n");
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.error('Parâmetros inválidos. É necessário informar 3 parâmetros.');
    printUso();
    process.exit(1);
  }

  const [p1, p2, ordem] = args;
  const resultado = new AbrigoAnimais().encontraPessoas(p1, p2, ordem);

  if (resultado.erro) {
    console.error(JSON.stringify(resultado, null, 2));
    process.exit(2);
  } else {
    console.log(JSON.stringify(resultado, null, 2));
  }
}

main();
