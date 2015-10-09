'use strict';

var q    = require('q');
var pdf  = require('html-pdf');
var swig = require('swig');
var fnc  = require('./bacoob.func');

var fbarcode = fnc.fbarcode;
var modulo11 = fnc.modulo11;
var strReplace = fnc.strReplace;
var base64Encode = fnc.base64Encode;
var numberFormat = fnc.numberFormat;
var formataNumDoc = fnc.formataNumDoc;
var formataNumero = fnc.formataNumero;
var fatorVencimento = fnc.fatorVencimento;
var geraCodigoBanco = fnc.geraCodigoBanco;
var montaNossoNumero = fnc.montaNossoNumero;
var montaLinhaDigitavel = fnc.montaLinhaDigitavel;

var bancoob = {
  gerarHTML: function(boletoArgs, configArgs) {
    return q.Promise(function(resolve) {
      var $taxaBoleto   = boletoArgs.boletoTaxa;
      var $valorCobrado = boletoArgs.boletoValor;
      var $valorBoleto  = numberFormat($valorCobrado + $taxaBoleto, 2, ',', '');

      var $idBoleto = boletoArgs.boletoNumero;
      var $agencia  = configArgs.agenciaSemDV;
      var $conta    = configArgs.contaSemDV;
      var $convenio = configArgs.convenio;
      var nNumero   = formataNumDoc($idBoleto, 7);
      var sequencia = formataNumDoc($agencia,4) + formataNumDoc(strReplace('-','',$convenio), 10) + nNumero;

      var $dadosBoleto = {};
      $dadosBoleto.nossoNumero = montaNossoNumero(nNumero, sequencia);
      /*************************************************************************
       * +++
       *************************************************************************/
      $dadosBoleto.numeroDocumento   = boletoArgs.documentoInternoNumero;	// Num do pedido ou do documento
      $dadosBoleto.dataVencimento    = boletoArgs.boletoVencimento; // Data de Vencimento do Boleto - REGRA: Formato DD/MM/AAAA
      $dadosBoleto.dataDocumento     = boletoArgs.boletoEmissao; // Data de emissão do Boleto
      $dadosBoleto.dataProcessamento = boletoArgs.boletoEmissao; // Data de processamento do boleto (opcional)
      $dadosBoleto.valorBoleto       = $valorBoleto; 	// Valor do Boleto - REGRA: Com vírgula e sempre com duas casas depois da virgula

      // DADOS DO SEU CLIENTE
      $dadosBoleto.sacado    = boletoArgs.sacadoNome;
      $dadosBoleto.endereco1 = boletoArgs.sacadoEndereco;
      $dadosBoleto.endereco2 = boletoArgs.sacadoEnderecoComplemento;

      // INFORMACOES PARA O CLIENTE
      $dadosBoleto.demonstrativo1 = configArgs.demonstrativo1;
      $dadosBoleto.demonstrativo2 = configArgs.demonstrativo2;
      $dadosBoleto.demonstrativo3 = configArgs.demonstrativo3;

      // INSTRUÇÕES PARA O CAIXA
      $dadosBoleto.instrucoes1 = configArgs.instrucoes1;
      $dadosBoleto.instrucoes2 = configArgs.instrucoes2;
      $dadosBoleto.instrucoes3 = configArgs.instrucoes3;
      $dadosBoleto.instrucoes4 = configArgs.instrucoes4;

      // DADOS OPCIONAIS DE ACORDO COM O BANCO OU CLIENTE
      $dadosBoleto.quantidade    = boletoArgs.documentoInternoQuantidade;
      $dadosBoleto.valorUnitario = boletoArgs.documentoInternoValorUnitario;
      $dadosBoleto.aceite        = 'N';
      $dadosBoleto.especie       = 'R$';
      $dadosBoleto.especieDoc    = 'DM';

      // ---------------------- DADOS FIXOS DE CONFIGURAÇÃO DO SEU BOLETO --------------- //
      // DADOS ESPECIFICOS DO SICOOB
      $dadosBoleto.modalidadeCobranca = '02';
      $dadosBoleto.numeroParcela      = '901';

      // DADOS DA SUA CONTA - BANCO SICOOB
      $dadosBoleto.agencia = $agencia; // Num da agencia, sem digito
      $dadosBoleto.conta   = $conta; // Num da conta, sem digito

      // DADOS PERSONALIZADOS - SICOOB
      $dadosBoleto.convenio = $convenio; // Num do convênio - REGRA: No máximo 7 dígitos
      $dadosBoleto.carteira = '1';

      // SEUS DADOS
      $dadosBoleto.identificacao = configArgs.cedenteIdentificacao;
      $dadosBoleto.cpfCnpj       = configArgs.cedenteCpfCnpj;
      $dadosBoleto.endereco      = configArgs.cedenteEndereco;
      $dadosBoleto.cidadeUF      = configArgs.cedenteCidadeUF;
      $dadosBoleto.cedente       = configArgs.cedenteNome;

      var $codigoBanco     = '756';
      var $codigoBancoDV   = geraCodigoBanco($codigoBanco);
      var $nummoeda        = '9';
      var $fatorVencimento = fatorVencimento($dadosBoleto.dataVencimento);

      //valor tem 10 digitos, sem virgula
      var $valor = formataNumero($dadosBoleto.valorBoleto, 10, 0, 'valor');

      //agencia é sempre 4 digitos
      $agencia = formataNumero($dadosBoleto.agencia,4,0);

      //conta é sempre 8 digitos
      $conta = formataNumero($dadosBoleto.conta, 8, 0);

      var $carteira = $dadosBoleto.carteira;

      var $modalidadeCobranca = $dadosBoleto.modalidadeCobranca;
      var $numeroParcela      = $dadosBoleto.numeroParcela;

      //Zeros: usado quando convenio de 7 digitos
      $convenio = formataNumero($dadosBoleto.convenio, 7, 0);

      //agencia e conta
      var $agenciaCodigo = String($agencia) + ' / ' + String($convenio);

      // Nosso número de até 8 dígitos - 2 digitos para o ano e outros 6 numeros sequencias por ano
      // deve ser gerado no programa boleto_bancoob.php
      var $nossonumero = formataNumero($dadosBoleto.nossoNumero, 8, 0);
      var $campolivre  = String($modalidadeCobranca).concat($convenio, $nossonumero, $numeroParcela);
      var $calcMd11    = String($codigoBanco).concat($nummoeda, $fatorVencimento, $valor, $carteira, $agencia, $campolivre);
      var $dv          = modulo11($calcMd11);
      var $linha       = String($codigoBanco).concat($nummoeda, $dv, $fatorVencimento, $valor, $carteira, $agencia, $campolivre);

      var arquivoImagemBanco = __dirname + '/imagens/logobancoob.jpg';

      $dadosBoleto.codigoBarras   = $linha;
      $dadosBoleto.linhaDigitavel = montaLinhaDigitavel($linha);
      $dadosBoleto.agenciaCodigo  = $agenciaCodigo;
      $dadosBoleto.nossoNumero    = $nossonumero;
      $dadosBoleto.codigoBancoDV  = $codigoBancoDV;
      $dadosBoleto.fbarcode       = fbarcode($dadosBoleto.codigoBarras);
      $dadosBoleto.imgBanco       = 'data:image/png;base64,'.concat(base64Encode(arquivoImagemBanco));

      var templateBancoob = __dirname + '/bancoob.swig';

      var html = swig.renderFile(templateBancoob, { dadosBoleto: $dadosBoleto });

      resolve(html);
    });
  },

  gerarPDF: function(boletoArgs, configArgs, pdfOptions) {
    if (!pdfOptions) pdfOptions = {};

    var invalid = function(attr) {
      return !pdfOptions.hasOwnProperty(attr) || !pdfOptions[attr];
    };

    if (invalid('format'))      pdfOptions.format      = 'A4';
    if (invalid('orientation')) pdfOptions.orientation = 'portrait';
    if (invalid('type'))        pdfOptions.type        = 'pdf';
    if (invalid('border'))      pdfOptions.border      = {
      top:    '2.0in',
      left:   '1.5in',
      right:  '1.5in',
      bottom: '2.0in'
    };

    return bancoob.gerarHTML(boletoArgs, configArgs).then(function(boletoHtml) {
      return pdf.create(boletoHtml, pdfOptions);
    });
  }
};

module.exports = bancoob;
