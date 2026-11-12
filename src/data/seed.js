/** Módulo: data/seed.js */

export const seed={
 machines:[],
 pm:[],
 workOrders:[],
 events:[],
 cards:[],
 chassis:[],
 predictive:[],
 parts:[],
 keywords:['Estática','Resistencia de la selladora','Sello de fondo','Rodillo','Balero','Pirómetro','Cuchilla','Cabezal'],
 negligencia:[],
 history:[],
 meal:{employees:seedMealEmployees(),historial:[],config:{numSemana:1,nextId:20},semanaActual:[]}
};

export function seedMealEmployees(){
 const base=[
  ["MARTIN MORENO RUIZ","B","NO"],["AGUSTIN BASILIO PEREZ","B","SI"],["ALEXIS ABRAHAM GONZALEZ CORZO","B","NO"],
  ["ANGEL ALBERTO TOLEDO ARDENO","B","NO"],["ARNALDO COBO HERNANDEZ","B","NO"],["ERICK HERNAN MANCILLA HERNANDEZ","B","NO"],
  ["EVERARDO HERNANDEZ NAFATE","B","NO"],["HUGO JEAN ROSAS GOMEZ","A","NO"],["JHOVANY SANCHEZ DOMINGUEZ","A","NO"],
  ["JORGE JONATHAN ALVAREZ ARIAS","B","NO"],["JOSE GABRIEL HERNANDEZ RUIZ","A","SI"],["LEONARDO CASTELLANOS GORDILLO","A","NO"],
  ["MIGUEL ANGEL PEREZ HERNANDEZ","A","NO"],["OSMAR DE JESUS HERNANDEZ FONSECA","A","NO"],["ULICES ADRIAN MORALES OVANDO","B","NO"],
  ["VICTOR HUMBERTO ALVAREZ CABRERA","A","NO"],["GUADALUPE DE JESUS DE LA CRUZ ZENTENO","A","NO"],["VICTOR MANUEL LOPEZ SILVA","A","NO"],
  ["HECTOR AVEDAÑO ORTEGA","A","NO"]
 ];
 return base.map((r,i)=>({id:i+1,nombre:r[0],grupo:r[1],turnoNoche:r[2]==="SI",enCapacitacion:false,ausencias:"",ultimaFecha:"",vecesAsignado:0,activo:true}));
}

