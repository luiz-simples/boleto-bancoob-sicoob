# Boleto Bancoob/Sicoob

boleto-bancoob-sicoob baseado no sistema BoletoPHP

## Instalação
``` sh
npm install boleto-bancoob-sicoob --save
```
##Configuração
```javascript
var boletoArgs = {
  boletoTaxa: 0.00, // Taxa bancária do boleto
  boletoValor: 1.00, //Valor a ser cobrado no Boleto
  boletoNumero: 2, // Deve informar um numero sequencial a ser passada a função abaixo, Até 6 dígitos
  boletoEmissao: '09/10/2015', // Data de emissão do Boleto no formato DD/MM/AAAA
  boletoVencimento: '09/10/2015', // Data de emissão do Boleto no formato DD/MM/AAAA

  sacadoNome: 'Luiz Amorim - 012.345.678-90',
  sacadoEndereco: 'Rua José das Coves, 3435 - Centro',
  sacadoEnderecoComplemento: 'Campão / MS - CEP: 79.021-000',

  documentoInternoNumero: 12, // Num do pedido ou do documento
  documentoInternoQuantidade: 1,
  documentoInternoValorUnitario: 1.00
};

var configArgs = {
  convenio: '56235', //Número do convênio indicado
  contaSemDV: '4593', // Num da conta, sem digito
  agenciaSemDV: '3087', // Num da agencia, sem digito

  cedenteNome:          'Empre Joaquina das Coves',
  cedenteCpfCnpj:       '85.835.216/0001-20',
  cedenteEndereco:      'Rua João Pedro das Coves, 01 - Sl 106, Centro',
  cedenteCidadeUF:      'Campão / SC - CEP: 88123-000',
  cedenteIdentificacao: 'NomeSistemaAqui - Cobrando com boleto.',

  // INFORMACOES PARA O CLIENTE
  demonstrativo1: 'Pagamento de dívida na Loja BLÁ BLÁ BLÁ',
  demonstrativo2: 'Mensalidade referente a BLÁ BLÁ BLÁ',
  demonstrativo3: 'BoletoPhp - http://www.boletophp.com.br',

  // INSTRUÇÕES PARA O CAIXA
  instrucoes1: '1º - Sr. Caixa, não receber após o vencimento.',
  instrucoes2: '2º - Este boleto é inválido após vencimento.',
  instrucoes3: '3º - Em caso de dúvidas entre em contato conosco: xxxxx@xxxxx.com',
  instrucoes4: '&nbsp; Emitido por um sistema da informação.'
};
```

## Exemplo Gerar HTML do boleto
```javascript
var fs           = require('fs');
var boletoSicoob = require('boleto-bancoob-sicoob');

return boletoSicoob.gerarHTML(boletoArgs, configArgs).then(function(boletoHTML) {
  var boletoPath = './boletoGerado.html';

  fs.writeFileSync(boletoPath, boletoHTML);
}).catch(function(err) {
  console.log(err);
});
```

## Exemplo Gerar PDF do boleto
```javascript
var boletoSicoob = require('boleto-bancoob-sicoob');
var pdfOptions   = { format: 'A4', orientation: 'portrait' };

return boletoSicoob.gerarPDF(boletoArgs, configArgs, pdfOptions).then(function(pdfObj) {
  //pdfObj.toFile('./boletoGerado.pdf', function(err, res))
  //pdfObj.toStream(function(err, stream){
  //pdfObj.toBuffer(function(err, buffer){

  pdfObj.toFile('./boletoGerado.pdf', function(err, res)) {
    if (err) throw new Error(err);
    console.log(res.filename);
  };
}).catch(function(err) {
  console.log(err);
});
```
[Mais opções para manipular PDF e suas opções, clique aqui](https://github.com/marcbachmann/node-html-pdf)
