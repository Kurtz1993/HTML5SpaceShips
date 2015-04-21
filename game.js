// Objetos importantes del canvas
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

// Definición de variables de imagen
var fondo;

// Definición de objetos.
var nave = {
	x:400,
	y:canvas.height - 100,
	width:50,
	height:50,
	vivo: true
};
// Disparos
var disparos = [];
var disparosEnemigos = [];
// Enemigos
var enemigos = [];

var teclado = {};
var juego = {
	estado: 'iniciando'
};
var textoRespuesta = {
	contador: -1,
	titulo: '',
	subtitulo: 'Presiona R para reiniciar...'
};

// Funciones...
function aleatorio(inferior, superior){
	var posibilidades = superior - inferior;
	var randomNum = Math.random() * posibilidades;
	randomNum = Math.floor(randomNum);
	return parseInt(inferior) + randomNum;
}

function agregarEventosTeclado(){
	var agregarEvento = function(elemento, evento, callback){
		if(elemento.addEventListener)
			elemento.addEventListener(evento, callback, false);
		else if(elemento.attachEvent)
			elemento.attachEvent(evento, callback);
	};
	agregarEvento(document, 'keydown', function(e){
		teclado[e.keyCode] = true;
	});
	agregarEvento(document, 'keyup', function(e){
		teclado[e.keyCode] = false;
	});
}

function cargarContenido(){
	fondo = new Image();
	fondo.src = 'img/space.jpg';
	fondo.onload = function(){
		var runtime = setInterval(frameLoop, 1000/30);
	};
}

function dibujarNave(){
	context.save(); // Guarda la información actual del contexto.
	context.fillStyle = 'white'; // Color de la nave.
	context.fillRect(nave.x, nave.y, nave.width, nave.height);
	context.restore(); // Regresa al punto anterior del contexto.
}

function dibujarFondo(){
	context.drawImage(fondo,0,0);
}

function dibujarDisparos(){
	context.save();
	context.fillStyle = 'white';
	for (var i in disparos){
		var disparo = disparos[i];
		context.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
	}
	context.restore();
}

function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		context.save();
		if(enemigo.vivo) context.fillStyle = 'red';
		else context.fillStyle = 'black';
		context.fillRect(enemigo.x, enemigo.y, enemigo.width, enemigo.height);
	}
	context.restore();
}

function disparar(){
	disparos.push({
		x: nave.x + 20,
		y: nave.y - 10,
		width: 5,
		visible: true,
		height: 15
	});
}

function moverNave(){
	if(teclado[37]){
		nave.x-=8;
		if(nave.x < 0) nave.x = 0;
	}
	else if(teclado[39]){
		var limite = canvas.width - nave.width;
		nave.x+=8;
		if(nave.x > limite) nave.x = limite;
	}
	if(teclado[32]){
		if(!teclado.disparar){
			disparar();
			teclado.disparar = true;
		}
	}
	else
		teclado.disparar = false;
}

function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		context.save();
		context.fillStyle = 'yellow';
		context.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
	}
	context.restore();
}

function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 4;
	}
	disparos = disparos.filter(function (disparo){
		return disparo.y < canvas.height;
	});
}

function dibujarTexto(){
	if(textoRespuesta.contador == -1) return;
	var alpha = textoRespuesta.contador / 50.0;
	if(alpha > 1){
		enemigos = [];
		disparosEnemigos = [];
	}
	context.save();
	context.globalAlpha = alpha;
	if(juego.estado == 'derrota'){
		context.fillStyle = 'white';
		context.font = 'Bold 40px Arial';
		context.fillText(textoRespuesta.titulo, 140, 200);
		context.font = '14px Arial';
		context.fillText(textoRespuesta.subtitulo, 190, 250);
		context.restore();
	}
	else if (juego.estado == 'victoria'){
		context.fillStyle = 'white';
		context.font = 'Bold 40px Arial';
		context.fillText(textoRespuesta.titulo, 140, 200);
		context.font = '14px Arial';
		context.fillText(textoRespuesta.subtitulo, 190, 250);
		context.restore();
	}
}

function actualizarEstadoJuego(){
	if(juego.estado == 'jugando' && enemigos.length == 0){
		juego.estado = 'victoria';
		textoRespuesta.titulo = '¡Derrotaste a los enemigos!';
		textoRespuesta.contador = 0;
	}
	else if(juego.estado == 'jugando' && enemigos.length>0)
		return;
	if(textoRespuesta.contador >= 0)
		textoRespuesta.contador++;
	if((juego.estado == 'victoria' || juego.estado == 'derrota') && teclado[82]){
		juego.estado = 'iniciando';
		nave.vivo = true;
		textoRespuesta.contador = -1;
	}
}

function actualizarEnemigos(){
	var agregarDisparosEnemigos = function (enemigo){
		return {
			x: enemigo.x + 20,
			y: enemigo.y + 40,
			width: 3,
			height: 15,
			visible: true,
			contador: 0
		};
	};
	if(juego.estado == 'iniciando'){
		for(var i = 0; i < 10; i++){
			enemigos.push({
				x: 10 + (i*50),
				y: 10,
				width: 40,
				height: 40,
				contador: 0,
				vivo: true
			});
		}
		juego.estado = 'jugando';
	}
	else if(juego.estado == 'jugando'){
		for (var i in enemigos){
			var enemigo = enemigos[i];
			if(!enemigo) continue;
			if(enemigo && enemigo.vivo){
				enemigo.contador++;
				enemigo.x += Math.sin(enemigo.contador * Math.PI / 90) * 5;
				if(aleatorio(0, enemigos.length * 10) == 4){
					disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
				}
			}
		}
		enemigos = enemigos.filter(function (enemigo){
			if(enemigo && enemigo.vivo) return true;
			else return false;
		});
	}
}

function moverDisparos(){
	for(var i in disparos){
		var disparo = disparos[i];
		disparo.y -= 10;
	}
	disparos = disparos.filter(function (disparo){
		if(disparo.y > 0 && disparo.visible) return true;
		else return false;
	});
}

function hit(disparo, objeto){
	var hit = false;
	if((objeto.x + objeto.width >= disparo.x) && (objeto.x < disparo.x + disparo.width)){
		if((objeto.y + objeto.height >= disparo.y) && (objeto.y < disparo.y + disparo.height)){
			disparo.visible = false;
			hit = true;
		}
	}
	if((objeto.x <= disparo.x) && (objeto.x + objeto.width >= disparo.x + disparo.width)){
		if((objeto.y <= disparo.y) && (objeto.y + objeto.height >= disparo.y + disparo.height)){
			disparo.visible = false;
			hit = true;
		}
	}
	if((disparo.x <= objeto.x) && (disparo.x + disparo.width >= objeto.x + objeto.width)){
		if((disparo.y <= objeto.y) && (disparo.y + disparo.height >= objeto.y + objeto.height)){
			disparo.visible = false;
			hit = true;
		}
	}
	return hit;
}

function verificarContacto(){
	for(var i in disparos){
		var disparo = disparos[i];
		for(var j in enemigos){
			var enemigo = enemigos[j];
			if(hit(disparo, enemigo)){
				enemigo.vivo = false;
				enemigo.contador = 0;
			}
		}
	}
	if(!nave.vivo) return false;
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		if(hit(disparo, nave)){
			nave.vivo = false;
			juego.estado = 'derrota';
			textoRespuesta.titulo = "Game Over";
			textoRespuesta.contador = 0;
		}
	}
}

function frameLoop(){
	actualizarEstadoJuego();
	moverNave();
	moverDisparos();
	moverDisparosEnemigos();
	verificarContacto();
	actualizarEnemigos();
	dibujarFondo();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujarDisparos();
	dibujarTexto();
	dibujarNave();
}

agregarEventosTeclado();
cargarContenido();