'use strict';

var fs         = require('fs');
var moment     = require('moment-timezone');
var accounting = require('accounting');

function base64Encode(filePath) {
  var bitmap = fs.readFileSync(filePath);
  return new Buffer(bitmap).toString('base64');
}

function floor(val) {
  return Math.floor(val);
}

function numberFormat(val, decimals, pDec, pMil) {
  var withoutSimbol = '';
  return accounting.formatMoney(parseFloat(val), withoutSimbol, decimals, pMil, pDec);
}

function strReplace(search, replace, string) {
  var searchExp = new RegExp(search, 'g');
  return String(string).replace(searchExp, replace);
}

function strlen(string) {
  return String(string).length;
}

function abs(val) {
  if (val < 0) val = val * -1;
  return val;
}

function round(val) {
  return Math.round(val);
}

function substr(string, ini, fim) {
  return String(string).substr(ini, fim);
}

function esquerda(entra, comp){
	return substr(entra,0,comp);
}

function direita(entra, comp){
	return substr(entra,strlen(entra)-comp,comp);
}

function explode(sep, string) {
  return String(string).split(sep);
}

function date(format, dt) {
	if (format === 'd/m/Y') format = 'DD/MM/YYYY';
	if (format === 'd/Y/m') format = 'DD/YYYY/MM';
	if (format === 'Y/d/m') format = 'YYYY/DD/MM';
	if (format === 'Y/m/d') format = 'YYYY/MM/DD';
	if (format === 'm/Y/d') format = 'MM/YYYY/DD';
	if (format === 'm/d/Y') format = 'MM/DD/YYYY';

	if (!dt) return moment().tz('America/Sao_Paulo').format(format);
	return moment(dt).format(format);
}

function formataNumero(numero, loop, insert, tipo) {
  if (!tipo) tipo = 'geral';

	if (tipo === 'geral') {
		numero = strReplace(',','', numero);
		while(strlen(numero)<loop)
			numero = String(insert).concat(numero);
	}

	if (tipo === 'valor') {
		numero = strReplace(',','',numero);
		while(strlen(numero)<loop)
			numero = String(insert).concat(numero);
	}

	if (tipo === 'convenio') {
		while(strlen(numero)<loop){
			numero = String(numero).concat(insert);
		}
	}

	return numero;
}

function fbarcode(valor) {
  var f1, f2, f, texto, i;
  var fino     = 1 ;
  var largo    = 3 ;
  var altura   = 50 ;
  var barcodes = [];

  barcodes[0] = '00110' ;
  barcodes[1] = '10001' ;
  barcodes[2] = '01001' ;
  barcodes[3] = '11000' ;
  barcodes[4] = '00101' ;
  barcodes[5] = '10100' ;
  barcodes[6] = '01100' ;
  barcodes[7] = '00011' ;
  barcodes[8] = '10010' ;
  barcodes[9] = '01010' ;
  for(f1=9;f1>=0;f1--){
    for(f2=9;f2>=0;f2--){
      f = (f1 * 10) + f2 ;
      texto = '' ;
      for(i=1;i<6;i++){
        texto += substr(barcodes[f1],(i-1),1) + substr(barcodes[f2],(i-1),1);
      }
      barcodes[f] = texto;
    }
  }

  var arquivoBarraPreta  = __dirname + '/imagens/p.png';
  var arquivoBarraBranca = __dirname + '/imagens/b.png';

  var srcBarraPreta  = 'data:image/png;base64,'.concat(base64Encode(arquivoBarraPreta));
  var srcBarraBranca = 'data:image/png;base64,'.concat(base64Encode(arquivoBarraBranca));

  var barra = '';

  barra += '<img src="' + srcBarraPreta  + '" width="' + String(fino) + '" height="' + String(altura) + '" border="0" />';
  barra += '<img src="' + srcBarraBranca + '" width="' + String(fino) + '" height="' + String(altura) + '" border="0" />';
  barra += '<img src="' + srcBarraPreta  + '" width="' + String(fino) + '" height="' + String(altura) + '" border="0" />';
  barra += '<img src="' + srcBarraBranca + '" width="' + String(fino) + '" height="' + String(altura) + '" border="0" />';

  texto = String(valor);
  if((strlen(texto) % 2) !== 0){
  	texto = '0'.concat(texto);
  }

  while (strlen(texto) > 0) {
    i = round(esquerda(texto,2));
    texto = direita(texto,strlen(texto)-2);
    f = barcodes[i];
    for(i=1;i<11;i+=2) {
      if (substr(f,(i-1),1) === '0') {
        f1 = fino ;
      }else{
        f1 = largo ;
      }

      barra += '<img src="' + srcBarraPreta  + '" width="' + String(f1) + '" height="' + String(altura) + '" border="0" />';

      if (substr(f,i,1) === '0') {
        f2 = fino ;
      }else{
        f2 = largo ;
      }

      barra += '<img src="' + srcBarraBranca + '" width="' + String(f2) + '" height="' + String(altura) + '" border="0" />';
    }
  }

  barra += '<img src="' + srcBarraPreta  + '" width="' + String(largo) + '" height="' + String(altura) + '" border="0" />';
  barra += '<img src="' + srcBarraBranca + '" width="' + String(fino)  + '" height="' + String(altura) + '" border="0" />';
  barra += '<img src="' + srcBarraPreta  + '" width="' + String(1)      + '" height="' + String(altura) + '" border="0" />';

  return barra;
}

function _dateToDays(year, month, day) {
  var century = substr(year, 0, 2);
  year        = substr(year, 2, 2);

  year    = parseInt(year,    10);
  month   = parseInt(month,   10);
  day     = parseInt(day,     10);
  century = parseInt(century, 10);

  if (month > 2) {
    month -= 3;
  } else {
    month += 9;
    if (year) {
      year--;
    } else {
      year = 99;
      century--;
    }
  }

  var p1 = floor((146097 * century)   /  4 );
  var p2 = floor((1461   * year)      /  4 );
  var p3 = floor((153    * month + 2) /  5 );
  var p4 = day + 1721119;
  return p1 + p2 + p3 + p4;
}

function fatorVencimento(data) {
	data = explode('/',data);
	var ano = data[2];
	var mes = data[1];
	var dia = data[0];

  return abs((_dateToDays('1997','10','07')) - (_dateToDays(ano, mes, dia)));
}

function modulo10(num) {
  var i;
  var numtotal10 = 0;
	var fator      = 2;
  var numeros    = [];
  var parcial10  = [];

	for (i = strlen(num); i > 0; i--) {
		numeros[i]   = parseInt(substr(num, i-1, 1) || 0, 10);
		parcial10[i] = numeros[i] * fator;
		numtotal10    = String(numtotal10).concat(parcial10[i]);

		if (fator === 2) {
			fator = 1;
		} else {
			fator = 2;
		}
	}

	var soma = 0;
	for (i = strlen(numtotal10); i > 0; i--) {
		numeros[i] = parseInt(substr(numtotal10,i-1,1) || 0, 10);
		soma += numeros[i];
	}

	var resto  = soma % 10;
	var digito = 10 - resto;

	if (resto === 0) {
		digito = 0;
	}

	return digito;
}

function modulo11(num, base, r) {
  if (!base) base = 9;
  if (!r)    r    = 0;

  var i;
	var soma    = 0;
	var fator   = 2;
  var parcial = [];
  var numeros = [];

	for (i = strlen(num); i > 0; i--) {
		numeros[i] = substr(num,i-1,1);
		parcial[i] = numeros[i] * fator;
		soma += parcial[i];
		if (fator === base) {
			fator = 1;
		}
		fator++;
	}

	if (r === 0) {
		soma *= 10;
		var digito = soma % 11;

		//corrigido
		if (digito === 10) digito = 'X';

		/*
		alterado por mim, Daniel Schultz
		Vamos explicar:
		O módulo 11 só gera os digitos verificadores do nossonumero,
		agencia, conta e digito verificador com codigo de barras (aquele que fica sozinho e triste na linha digitável)
		só que é foi um rolo...pq ele nao podia resultar em 0, e o pessoal do phpboleto se esqueceu disso...

		No BB, os dígitos verificadores podem ser X ou 0 (zero) para agencia, conta e nosso numero,
		mas nunca pode ser X ou 0 (zero) para a linha digitável, justamente por ser totalmente numérica.
		Quando passamos os dados para a função, fica assim:
		Agencia = sempre 4 digitos
		Conta = até 8 dígitos
		Nosso número = de 1 a 17 digitos
		A unica variável que passa 17 digitos é a da linha digitada, justamente por ter 43 caracteres
		Entao vamos definir ai embaixo o seguinte...
		se (strlen(num) == 43) { não deixar dar digito X ou 0 }
		*/

		if (strlen(num) === 43) {
			//então estamos checando a linha digitável
			if (digito === 'X' || digito === 0 || digito > 9) {
					digito = 1;
			}
		}
		return digito;
	} else {
    if (r === 1){
  		var resto = soma % 11;
  		return resto;
  	}
  }
}

function montaLinhaDigitavel(linha) {
  // Posição 	Conteúdo
  // 1 a 3    Número do banco
  // 4        Código da Moeda - 9 para Real
  // 5        Digito verificador do Código de Barras
  // 6 a 19   Valor (12 inteiros e 2 decimais)
  // 20 a 44  Campo Livre definido por cada banco
  // 1. Campo - composto pelo código do banco, código da moéda, as cinco primeiras posições
  // do campo livre e DV (modulo10) deste campo
  var p1     = substr(linha, 0, 4);
  var p2     = substr(linha, 19, 5);
  var p3     = modulo10(String(p1).concat(p2));
  var p4     = String(p1).concat(p2, p3);
  var p5     = substr(p4, 0, 5);
  var p6     = substr(p4, 5);
  var campo1 = String(p5).concat('.', p6);

  // 2. Campo - composto pelas posiçoes 6 a 15 do campo livre
  // e livre e DV (modulo10) deste campo
  p1     = substr(linha, 24, 10);
  p2     = modulo10(p1);
  p3     = String(p1).concat(p2);

  p4     = substr(p3, 0, 5);
  p5     = substr(p3, 5);
  var campo2 = String(p4).concat('.', p5);

  p1     = substr(linha, 34, 10);
  p2     = modulo10(p1);
  p3     = String(p1).concat(p2);
  p4     = substr(p3, 0, 5);
  p5     = substr(p3, 5);
  var campo3 = String(p4).concat('.', p5);
  var campo4 = substr(linha, 4, 1);
  var campo5 = substr(linha, 5, 14);

  return String(campo1).concat(' ', campo2, ' ', campo3, ' ', campo4, ' ', campo5);
}

function geraCodigoBanco(numero) {
  var parte1 = substr(numero, 0, 3);
  var parte2 = modulo11(parte1);
  return String(parte1).concat('-', parte2);
}

function formataNumDoc(num, tamanho) {
	while(strlen(num)<tamanho)
		num = '0'.concat(num);

  return num;
}

function montaNossoNumero(nossoNumero, sequencia) {
  var num;
  var constante;

  var cont      = 0;
  var calculoDv = 0;

  for (num=0; num<=strlen(sequencia); num++) {
  	cont++;

  	if(cont === 1) constante = 3;
  	if(cont === 2) constante = 1;
  	if(cont === 3) constante = 9;

  	if(cont === 4) {
  		constante = 7;
  		cont      = 0;
  	}

  	calculoDv = calculoDv + (parseInt(substr(sequencia, num, 1) || 0, 10) * constante);
  }

  var resto = calculoDv % 11;
  var dv    = 11 - resto;

  if (dv === 0) dv = 0;
  if (dv === 1) dv = 0;
  if (dv   > 9) dv = 0;

  return String(nossoNumero).concat(dv);
}

module.exports = {
  abs: abs,
  date: date,
  round: round,
  floor: floor,
  substr: substr,
  strlen: strlen,
  direita: direita,
  explode: explode,
  modulo10: modulo10,
  esquerda: esquerda,
  fbarcode: fbarcode,
  modulo11: modulo11,
  strReplace: strReplace,
  _dateToDays: _dateToDays,
  base64Encode: base64Encode,
  numberFormat: numberFormat,
  formataNumDoc: formataNumDoc,
  formataNumero: formataNumero,
  fatorVencimento: fatorVencimento,
  geraCodigoBanco: geraCodigoBanco,
  montaNossoNumero: montaNossoNumero,
  montaLinhaDigitavel: montaLinhaDigitavel
};
