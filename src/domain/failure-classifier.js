/** Módulo: domain/failure-classifier.js */

import { state } from '../core/state.js';

import { save, toast } from '../core/ui.js';

// ================= CLASIFICACIÓN INTELIGENTE DE FALLAS =================

const CLASIFICACION_FALLAS = {
  'Fuga': {
    palabras: ['fuga','fugas','fugando','fugaba','perdida','pérdida','escape','escapando'],
    contexto: {
      'neumatica': ['aire','manguera','mangera','presion','presión','pistola','neumatico','neumática'],
      'aceite': ['aceite','lubricante'],
      'plasta': ['plasta','material']
    },
    nivel: 1
  },
  'Falla eléctrica': {
    palabras: ['corto','cortocircuito','corto circuito','cable','cables','quemado','quemada','quemados','electrico','eléctrico','electricidad','contactores','contactor','estado solido','estado sólido','caja de control'],
    contexto: {
      'control': ['caja de control','estado solido','estado sólido','potenciometro','potenciómetro','electrovalvula','electroválvula'],
      'motor': ['motor','motores']
    },
    nivel: 1
  },
  'Inversor / Variador': {
    palabras: ['inversor','variador','drive','proteccion del inversor','protección del inversor','se protegio','se protegió'],
    nivel: 1
  },
  'Rodillo jalador': {
    palabras: ['rodillo jalador','rodillo','jalador','jaladora'],
    contexto: {
      'neumatico': ['fuga','aire','presion','presión'],
      'mecanico': ['desgaste','caucho','apretado','flojo','ajuste','reparacion','reparación','engrane','reductor']
    },
    nivel: 1
  },
  'Porta malla': {
    palabras: ['portamalla','porta malla','porta-malla','portamaya','porta maya'],
    contexto: {
      'rosca': ['cuerda','cuerdas','rosca','roscado','barrido','barrida','barridos','barridas','torno','rectificacion','rectificación','rehacer']
    },
    nivel: 1
  },
  'Tornillería / Roscas': {
    palabras: ['tornillo','tornillos','tuerca','cuerda','cuerdas','rosca','roscado','barrido','barrida','barridos','barridas','quebrado','quebrada','quebrados','flojo','flojos','se salieron'],
    nivel: 1
  },
  'Desgaste': {
    palabras: ['desgaste','desgastado','desgastada','desgastados','desgastadas','gastado','gastada','deteriorado','deteriorada','erosionado','ya no sirve','muy gastado'],
    nivel: 1
  },
  'Bandas / Transmisión': {
    palabras: ['banda','bandas','kit de bandas','correa','correas'],
    nivel: 1
  },
  'Calentamiento / Temperatura': {
    palabras: ['calentamiento','calentado','calentar','calienta','no calentaba','temperatura','pirometro','pirómetro','resistencia','resitencia','zona','cabezal'],
    nivel: 1
  },
  'Falla neumática': {
    palabras: ['aire','manguera','mangera','piston','pistón','electrovalvula','electroválvula','valvula','válvula','presion','presión','pistola de aire'],
    contexto: {
      'fuga': ['fuga','rota','roto','quebrada','dañada','alrevez','al revés','invertida','sin presion','sin presión']
    },
    nivel: 1
  },
  'Cortocircuito': {
    palabras: ['corto','corto circuito','cortocircuito','en corto','cable en corto'],
    nivel: 1
  },
  'Apagón / Energía externa': {
    palabras: ['apagon','apagón','sin luz','se fue la luz','corte de energia','corte de energía','falla electrica general','falla eléctrica general'],
    nivel: 1
  },
  'Ajuste / Desalineación': {
    palabras: ['ajuste','ajustar','ajusto','ajustó','ajustado','desajuste','alineacion','alineación','calibracion','calibración','apretado','apretar','flojo','floja'],
    nivel: 1
  },
  'Rotura / Fractura': {
    palabras: ['roto','rota','rotos','rotas','quebrado','quebrada','quebrados','quebradas','fractura','fisura','dañado','dañada','dañados','dañadas'],
    nivel: 1
  },
  'Limpieza / Dados': {
    palabras: ['limpieza','limpieeza','limpiar','limpio','sucio','suciedad','dado','dados','limpieza de dado','limpiar dado'],
    nivel: 1
  },
  'Mandril': {
    palabras: ['mandril','mandrill','fisura','fisurado','fractura','fracturado'],
    nivel: 1
  },
  'Engranes / Reductores': {
    palabras: ['engrane','engranes','reductor','reductores'],
    nivel: 1
  },
  'Motor / Embobinador': {
    palabras: ['motor','motores','embobinador','embobinadora','bobinador'],
    nivel: 1
  },
  'Mantenimiento programado': {
    palabras: ['mantenimiento','preventivo','correctivo programado','reparacion programada','reparación programada'],
    nivel: 2
  }
};

const REGISTRO_SEMANTICO = {
  sintomas: {
    'alarma':{categoria:'Alarma',peso:0.8},'alarmas':{categoria:'Alarma',peso:0.8},
    'sobrecalentamiento':{categoria:'Sobrecalentamiento',peso:0.9},'recalentamiento':{categoria:'Sobrecalentamiento',peso:0.8},
    'calentado deficiente':{categoria:'Calentamiento insuficiente',peso:0.9},'no calienta':{categoria:'Calentamiento insuficiente',peso:0.9},
    'baja temperatura':{categoria:'Temperatura baja',peso:0.8},'temperatura deficiente':{categoria:'Temperatura baja',peso:0.8},
    'corte deficiente':{categoria:'Corte deficiente',peso:0.9},'no corta':{categoria:'Corte deficiente',peso:0.8},'sin filo':{categoria:'Pérdida de filo',peso:0.8},
    'atoramiento':{categoria:'Atoramiento',peso:0.9},'atorado':{categoria:'Atoramiento',peso:0.8},'trabado':{categoria:'Atoramiento',peso:0.7},
    'apagado intermitente':{categoria:'Intermitencia',peso:0.9},'intermitente':{categoria:'Intermitencia',peso:0.8},
    'falso contacto':{categoria:'Falso contacto',peso:0.9},'falseo':{categoria:'Falso contacto',peso:0.8},'falseaba':{categoria:'Falso contacto',peso:0.8},
    'variando la medida':{categoria:'Variación dimensional',peso:0.9},'fuera de medida':{categoria:'Variación dimensional',peso:0.8},
    'fuga':{categoria:'Fuga',peso:0.9},'perdida':{categoria:'Fuga',peso:0.8},'pérdida':{categoria:'Fuga',peso:0.8},'escape':{categoria:'Fuga',peso:0.7},
    'no abre':{categoria:'Falta de apertura',peso:0.8},'no cierra':{categoria:'Falta de cierre',peso:0.8},
    'rotura':{categoria:'Rotura',peso:0.8},'quebrado':{categoria:'Rotura',peso:0.8},'quebrada':{categoria:'Rotura',peso:0.8},
    'desgaste':{categoria:'Desgaste',peso:0.8},'gastado':{categoria:'Desgaste',peso:0.7},'deteriorado':{categoria:'Desgaste',peso:0.7},
    'se protegio':{categoria:'Protección disparada',peso:0.85},'se protegió':{categoria:'Protección disparada',peso:0.85},
    'apagon':{categoria:'Apagón',peso:0.9},'apagón':{categoria:'Apagón',peso:0.9},'sin luz':{categoria:'Apagón',peso:0.85}
  },
  componentes: {
    'resistencia':{categoria:'Resistencia',peso:0.9},'recistencia':{categoria:'Resistencia',peso:0.6},'resitencia':{categoria:'Resistencia',peso:0.6},
    'termopar':{categoria:'Termopar',peso:0.9},'termopares':{categoria:'Termopar',peso:0.9},
    'sensor':{categoria:'Sensor',peso:0.9},'sensores':{categoria:'Sensor',peso:0.9},'censor':{categoria:'Sensor',peso:0.7},
    'fotocelda':{categoria:'Fotocelda',peso:0.9},'fotoceldas':{categoria:'Fotocelda',peso:0.9},
    'cuchilla':{categoria:'Cuchilla',peso:0.9},'cuchillas':{categoria:'Cuchilla',peso:0.9},
    'rodillo jalador':{categoria:'Rodillo jalador',peso:0.95},'rodillo':{categoria:'Rodillo',peso:0.85},'rodillos':{categoria:'Rodillo',peso:0.85},
    'balero':{categoria:'Balero',peso:0.9},'baleros':{categoria:'Balero',peso:0.9},'rodamiento':{categoria:'Balero',peso:0.8},
    'cabezal':{categoria:'Cabezal',peso:0.9},'cabezales':{categoria:'Cabezal',peso:0.9},
    'manguera':{categoria:'Manguera',peso:0.9},'mangera':{categoria:'Manguera',peso:0.7},
    'piston':{categoria:'Pistón',peso:0.9},'pistón':{categoria:'Pistón',peso:0.9},
    'pisador':{categoria:'Pisador',peso:0.9},'pizador':{categoria:'Pisador',peso:0.7},
    'esparrago':{categoria:'Espárrago',peso:0.8},'espárrago':{categoria:'Espárrago',peso:0.9},
    'tornillo':{categoria:'Tornillo',peso:0.9},'tornillos':{categoria:'Tornillo',peso:0.9},'tuerca':{categoria:'Tuerca',peso:0.8},
    'banda':{categoria:'Banda',peso:0.9},'bandas':{categoria:'Banda',peso:0.9},
    'cadena':{categoria:'Cadena',peso:0.9},'cadenas':{categoria:'Cadena',peso:0.9},
    'polea':{categoria:'Polea',peso:0.9},'poleas':{categoria:'Polea',peso:0.9},
    'fleje':{categoria:'Fleje',peso:0.9},'flejadora':{categoria:'Flejadora',peso:0.9},'portafleje':{categoria:'Portafleje',peso:0.9},
    'relay':{categoria:'Relay',peso:0.9},'rele':{categoria:'Relay',peso:0.8},'relevador':{categoria:'Relay',peso:0.85},
    'servomotor':{categoria:'Servomotor',peso:0.9},'servo':{categoria:'Servomotor',peso:0.8},
    'varilla':{categoria:'Varilla',peso:0.9},'varillas':{categoria:'Varilla',peso:0.9},
    'soporte':{categoria:'Soporte',peso:0.8},'soportes':{categoria:'Soporte',peso:0.8},
    'resorte':{categoria:'Resorte',peso:0.9},'resortes':{categoria:'Resorte',peso:0.9},
    'tenaza':{categoria:'Tenaza',peso:0.9},'tenazas':{categoria:'Tenaza',peso:0.9},
    'chiller':{categoria:'Chiller',peso:0.9},'tuberia':{categoria:'Tubería',peso:0.8},'tubería':{categoria:'Tubería',peso:0.8},
    'portamalla':{categoria:'Porta malla',peso:0.9},'porta malla':{categoria:'Porta malla',peso:0.9},
    'inversor':{categoria:'Inversor',peso:0.9},'variador':{categoria:'Inversor',peso:0.8},
    'motor':{categoria:'Motor',peso:0.8},'embobinador':{categoria:'Embobinador',peso:0.9},
    'electrovalvula':{categoria:'Electroválvula',peso:0.9},'electroválvula':{categoria:'Electroválvula',peso:0.9},
    'cable':{categoria:'Cable',peso:0.75},'cables':{categoria:'Cable',peso:0.75},
    'engrane':{categoria:'Engrane',peso:0.85},'reductor':{categoria:'Reductor',peso:0.85},
    'mandril':{categoria:'Mandril',peso:0.9},'dado':{categoria:'Dado',peso:0.8}
  },
  modos: {
    'fuga':{categoria:'Fuga',peso:0.9},'rotura':{categoria:'Rotura',peso:0.9},'quebrado':{categoria:'Rotura',peso:0.8},'rota':{categoria:'Rotura',peso:0.75},'roto':{categoria:'Rotura',peso:0.75},
    'desgaste':{categoria:'Desgaste',peso:0.9},'desgastado':{categoria:'Desgaste',peso:0.8},'gastado':{categoria:'Desgaste',peso:0.7},'deteriorado':{categoria:'Desgaste',peso:0.7},
    'falso contacto':{categoria:'Falso contacto',peso:0.9},'falseo':{categoria:'Falso contacto',peso:0.8},
    'intermitencia':{categoria:'Intermitencia',peso:0.9},'intermitente':{categoria:'Intermitencia',peso:0.8},
    'corto':{categoria:'Cortocircuito',peso:0.85},'cortocircuito':{categoria:'Cortocircuito',peso:0.9},'corto circuito':{categoria:'Cortocircuito',peso:0.9},
    'sobrecalentamiento':{categoria:'Sobrecalentamiento',peso:0.9},'recalentamiento':{categoria:'Sobrecalentamiento',peso:0.8},
    'calentado deficiente':{categoria:'Calentamiento insuficiente',peso:0.9},
    'desalineacion':{categoria:'Desalineación',peso:0.9},'desalineación':{categoria:'Desalineación',peso:0.9},'desajuste':{categoria:'Desajuste',peso:0.9},
    'atoramiento':{categoria:'Atoramiento',peso:0.9},'trabado':{categoria:'Atoramiento',peso:0.8},
    'variando la medida':{categoria:'Variación dimensional',peso:0.9},'sin filo':{categoria:'Pérdida de filo',peso:0.8},
    'barrido':{categoria:'Rosca barrida',peso:0.9},'barrida':{categoria:'Rosca barrida',peso:0.8},
    'falta de sellado':{categoria:'Sellado deficiente',peso:0.9},'mal sellado':{categoria:'Sellado deficiente',peso:0.8},
    'apagado':{categoria:'Apagón',peso:0.7},'quemado':{categoria:'Quemado',peso:0.85},'quemada':{categoria:'Quemado',peso:0.85}
  },
  acciones: {
    'cambio':{categoria:'Cambio',peso:0.9},'cambio de':{categoria:'Cambio',peso:0.85},'cambiaron':{categoria:'Cambio',peso:0.8},'reemplazo':{categoria:'Cambio',peso:0.8},'se cambio':{categoria:'Cambio',peso:0.85},'se cambió':{categoria:'Cambio',peso:0.85},
    'ajuste':{categoria:'Ajuste',peso:0.9},'ajustar':{categoria:'Ajuste',peso:0.8},'apretar':{categoria:'Ajuste',peso:0.7},'apriete':{categoria:'Ajuste',peso:0.7},
    'limpieza':{categoria:'Limpieza',peso:0.9},'limpiar':{categoria:'Limpieza',peso:0.8},'se limpio':{categoria:'Limpieza',peso:0.8},'se limpió':{categoria:'Limpieza',peso:0.8},
    'reparacion':{categoria:'Reparación',peso:0.8},'reparación':{categoria:'Reparación',peso:0.9},'se arreglo':{categoria:'Reparación',peso:0.85},'se arregló':{categoria:'Reparación',peso:0.85},
    'calibracion':{categoria:'Calibración',peso:0.9},'calibración':{categoria:'Calibración',peso:0.9},
    'revisar':{categoria:'Revisión',peso:0.7},'revision':{categoria:'Revisión',peso:0.7},'revisión':{categoria:'Revisión',peso:0.8},'revicion':{categoria:'Revisión',peso:0.65},
    'soldar':{categoria:'Soldadura',peso:0.8},'afilado':{categoria:'Afilado',peso:0.9},'sacar filo':{categoria:'Afilado',peso:0.8},
    'purga':{categoria:'Purga',peso:0.8},'purgar':{categoria:'Purga',peso:0.7},
    'colocacion':{categoria:'Instalación',peso:0.8},'colocación':{categoria:'Instalación',peso:0.9},'retiro':{categoria:'Retiro',peso:0.8}
  }
};

export function normTxt(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function _mejorMatchNivel(mapa, textoLower){
  let mejor={categoria:'No especificado',confianza:0,palabras:[]};
  // Ordenar claves por longitud desc para preferir frases largas (rodillo jalador > rodillo)
  const keys=Object.keys(mapa).sort((a,b)=>b.length-a.length);
  for(const palabra of keys){
    const pNorm=normTxt(palabra);
    if(pNorm && textoLower.includes(pNorm)){
      const conf=Math.round((mapa[palabra].peso||0.5)*100);
      if(conf>mejor.confianza){
        mejor={categoria:mapa[palabra].categoria,confianza:conf,palabras:[palabra]};
      } else if(conf===mejor.confianza && !mejor.palabras.includes(palabra)){
        mejor.palabras.push(palabra);
      }
    }
  }
  return mejor;
}

function clasificarFalla(texto){
  const textoLower=normTxt(texto);
  const vacio={categoria:'No especificado',confianza:0,palabras:[]};
  if(!textoLower.trim()){
    return {
      sintoma:vacio,componente:vacio,modo_falla:vacio,accion:vacio,
      categorias:[],principal:'No clasificada',confianza_principal:0,
      detalle:[],palabras_clave:[],contexto:{},todas_categorias:[]
    };
  }
  const sintoma=_mejorMatchNivel(REGISTRO_SEMANTICO.sintomas, textoLower);
  const componente=_mejorMatchNivel(REGISTRO_SEMANTICO.componentes, textoLower);
  const modo=_mejorMatchNivel(REGISTRO_SEMANTICO.modos, textoLower);
  const accion=_mejorMatchNivel(REGISTRO_SEMANTICO.acciones, textoLower);

  // Categorías amplias (diccionario anterior) para compatibilidad de gráficos
  const resultados=[];
  let maxConfianza=0;
  for(const [categoria,reglas] of Object.entries(CLASIFICACION_FALLAS)){
    let confianza=0;
    const palabrasEncontradas=[];
    const contextoDetectado={};
    for(const palabra of (reglas.palabras||[])){
      if(textoLower.includes(normTxt(palabra))){ confianza+=0.4; palabrasEncontradas.push(palabra); }
    }
    if(reglas.contexto){
      for(const [ctx,palabrasContexto] of Object.entries(reglas.contexto)){
        for(const p of palabrasContexto){
          if(textoLower.includes(normTxt(p))){
            confianza+=0.3; palabrasEncontradas.push(p);
            if(!contextoDetectado[ctx]) contextoDetectado[ctx]=[];
            contextoDetectado[ctx].push(p);
          }
        }
      }
    }
    if(confianza>0){
      if(Object.keys(contextoDetectado).length>0) confianza+=0.2;
      if(palabrasEncontradas.length>2) confianza+=0.1;
      confianza=Math.min(confianza,1);
      resultados.push({categoria,confianza:Math.round(confianza*100),palabras:[...new Set(palabrasEncontradas)],contexto:contextoDetectado,nivel:reglas.nivel||1});
      maxConfianza=Math.max(maxConfianza,confianza);
    }
  }
  resultados.sort((a,b)=>b.confianza-a.confianza);
  const umbral=Math.max(0.3, maxConfianza*0.7);
  const filtrados=resultados.filter(r=>r.confianza/100>=umbral);

  // Principal: preferir componente > modo > síntoma > categoría amplia
  let principal='No clasificada', confP=0;
  if(componente.categoria!=='No especificado'){ principal=componente.categoria; confP=componente.confianza; }
  else if(modo.categoria!=='No especificado'){ principal=modo.categoria; confP=modo.confianza; }
  else if(sintoma.categoria!=='No especificado'){ principal=sintoma.categoria; confP=sintoma.confianza; }
  else if(filtrados.length){ principal=filtrados[0].categoria; confP=filtrados[0].confianza; }

  const todas=[];
  if(sintoma.categoria!=='No especificado') todas.push({nivel:'sintoma',...sintoma});
  if(componente.categoria!=='No especificado') todas.push({nivel:'componente',...componente});
  if(modo.categoria!=='No especificado') todas.push({nivel:'modo_falla',...modo});
  if(accion.categoria!=='No especificado') todas.push({nivel:'accion',...accion});

  const palabras=[...new Set([
    ...sintoma.palabras,...componente.palabras,...modo.palabras,...accion.palabras,
    ...filtrados.flatMap(r=>r.palabras)
  ])];

  return {
    sintoma, componente, modo_falla:modo, accion,
    categorias:filtrados.map(r=>r.categoria),
    principal,
    confianza_principal:confP,
    detalle:filtrados,
    palabras_clave:palabras,
    contexto:filtrados.reduce((acc,r)=>Object.assign(acc,r.contexto||{}),{}),
    todas_categorias:todas
  };
}

export function camposClasificacion(desc){
  const c=clasificarFalla(desc);
  return {
    clasificacion:c.principal,
    confianza:c.confianza_principal,
    sintoma:c.sintoma.categoria,
    componente:c.componente.categoria,
    modo_falla:c.modo_falla.categoria,
    accion:c.accion.categoria,
    confianza_sintoma:c.sintoma.confianza,
    confianza_componente:c.componente.confianza,
    confianza_modo:c.modo_falla.confianza,
    confianza_accion:c.accion.confianza,
    palabras_clave:c.palabras_clave,
    contexto:c.contexto,
    detalle_clasificacion:c.todas_categorias
  };
}

export function reclasificarEventosExistentes(force){
  let n=0;
  (state.db.events||[]).forEach(ev=>{
    if(!ev.desc) return;
    if(!force && ev.sintoma && ev.componente && ev.confianza!=null) return;
    Object.assign(ev, camposClasificacion(ev.desc));
    n++;
  });
  if(n){ save(); toast(n+' eventos clasificados (4 niveles)'); }
  else toast('Todos los eventos ya tienen clasificación');
  return n;
}

