// game.js - CORRECCIONES APLICADAS
class JuegoLavadoManos {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-container',
            backgroundColor: '#4a6572',
            scene: [EscenaInicio, EscenaJuego, EscenaFinal],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 320,
                    height: 480
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            input: {
                touch: {
                    capture: true
                }
            }
        };
        this.game = new Phaser.Game(this.config);
    }
}

class EscenaInicio extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaInicio' });
    }
    
    preload() {
        this.load.image('fondoInicio', 'assets/fondos/fondo-inicio.png');
    }
    
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        if (this.textures.exists('fondoInicio')) {
            const fondo = this.add.image(centerX, centerY, 'fondoInicio');
            fondo.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
            
            const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.4);
            overlay.setDepth(0);
        } else {
            this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x34495e);
        }
        
        const boton = this.add.rectangle(centerX, centerY + 180, 350, 60, 0x27ae60);
        boton.setStrokeStyle(3, 0xffffff);
        boton.setInteractive({ useHandCursor: true });
        
        const textoBoton = this.add.text(centerX, centerY + 180, '🎮 COMENZAR ENTRENAMIENTO', {
            font: '18px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        textoBoton.setInteractive({ useHandCursor: true });
        
        this.add.text(centerX, centerY - 150, '🧼 LAVADO DE MANOS CORRECTO 🧼', {
            font: '38px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4 }
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY - 90, 'Aprende las 6 etapas según la OMS', {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        const etapas = [
            '1. 💦 Mojar las manos',
            '2. 🧴 Aplicar jabón',
            '3. 👐 Frotar palmas (20 segundos)',
            '4. ✋ Frotar dorso y entre dedos',
            '5. 🔄 Enjuagar completamente',
            '6. 📄 Secar con toalla'
        ];
        
        etapas.forEach((etapa, index) => {
            this.add.text(centerX, centerY - 40 + (index * 32), etapa, {
                font: '16px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                backgroundColor: '#000000',
                padding: { x: 8, y: 3 }
            }).setOrigin(0.5);
        });
        
        const hoverIn = () => {
            boton.setFillStyle(0x2ecc71);
            textoBoton.setScale(1.05);
        };
        
        const hoverOut = () => {
            boton.setFillStyle(0x27ae60);
            textoBoton.setScale(1.0);
        };
        
        [boton, textoBoton].forEach(obj => {
            obj.on('pointerover', hoverIn);
            obj.on('pointerout', hoverOut);
        });
        
        const iniciarJuego = () => {
            this.scene.start('EscenaJuego', { etapa: 1, puntajeTotal: 100 });
        };
        
        boton.on('pointerdown', iniciarJuego);
        textoBoton.on('pointerdown', iniciarJuego);
    }
}

class EscenaJuego extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaJuego' });
        this.textoFeedback = null;
        this.particulasActivas = [];
        this.objetosEtapa = [];
        this.flechas = null;
        this.aguaActivada = false;
    }
    
    preload() {
    this.load.image('lavadero', 'assets/fondos/lavadero-completo.png');
    this.load.image('lavadero-agua', 'assets/fondos/lavadero-agua.png');
    this.load.image('jabon', 'assets/objetos/jabon.png');
    this.load.image('toalla', 'assets/objetos/toalla.png');
    this.load.image('manos-normales', 'assets/objetos/manos-normales.png');
    this.load.image('manos-mojadas', 'assets/objetos/manos-mojadas.png');
    this.load.image('manos-jabon', 'assets/objetos/manos-jabon.png');
    this.load.image('manos-limpias', 'assets/objetos/manos-limpias.png');
    this.load.image('manos-sucias', 'assets/objetos/manos-sucias.png');
    
    // ✅ NUEVO: Cargar imágenes del personaje para cada etapa
    this.load.image('personaje-1', 'assets/objetos/Personaje-etapa-1.png');
    this.load.image('personaje-2', 'assets/objetos/Personaje-etapa-2.png');
    this.load.image('personaje-3', 'assets/objetos/Personaje-etapa-3.png');
    this.load.image('personaje-4', 'assets/objetos/Personaje-etapa-4.png');
    this.load.image('personaje-5', 'assets/objetos/Personaje-etapa-5.png');
    this.load.image('personaje-6', 'assets/objetos/Personaje-etapa-6.png');
}
    // ✅ NUEVO: Método para mostrar el personaje en cada etapa
mostrarPersonajeEtapa() {
    const nombreImagen = `personaje-${this.etapaActual}`;
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    if (this.textures.exists(nombreImagen)) {
        // ✅ POSICIÓN RESPONSIVE PARA MÓVIL
        const personajeX = esMovil ? 150 : 260;
        const personajeY = esMovil ? this.cameras.main.height - 180 : this.cameras.main.height - 215;
        
        this.personaje = this.add.image(personajeX, personajeY, nombreImagen);
        
        // ✅ ESCALA RESPONSIVE
        this.personaje.setScale(esMovil ? 0.5 : 0.7);
        this.personaje.setDepth(5);
    }
}
    init(data) {
        this.etapaActual = data.etapa || 1;
        this.puntajeTotal = data.puntajeTotal || 100;
        this.tiempoRestante = this.obtenerTiempoEtapa(this.etapaActual);
        this.progreso = 0;
    }
    
    create() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        
        this.objetosEtapa = [];
        this.aguaActivada = false;
        this.crearFondo();
        this.crearUI();
        this.configurarEtapaActual();
        this.iniciarTemporizador();
    }
    
    crearFondo() {
        const imagenFondo = (this.etapaActual === 1 || this.etapaActual === 5) && 
                           this.textures.exists('lavadero-agua') ? 'lavadero-agua' : 'lavadero';
        
        if (this.textures.exists(imagenFondo)) {
            this.fondo = this.add.image(this.centerX, this.centerY, imagenFondo);
            this.fondo.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
            this.objetosEtapa.push(this.fondo);
        } else {
            this.fondo = this.add.rectangle(this.centerX, this.centerY, this.cameras.main.width, this.cameras.main.height, 0x82ccdd);
            this.objetosEtapa.push(this.fondo);
        }
    }
    
    crearUI() {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;
    const factorEscala = esMovil ? 0.8 : 1.0;
    
    // ✅ BARRA DE PROGRESO RESPONSIVE
    const barraX = this.centerX;
    const barraY = esMovil ? 60 : 80;
    const anchoBarra = esMovil ? 300 : 400;
    const altoBarra = esMovil ? 16 : 20;
    
    this.barraProgresoFondo = this.add.rectangle(barraX, barraY, anchoBarra, altoBarra, 0x000000);
    this.barraProgresoFondo.setOrigin(0.5, 0.5);
    
    this.barraProgreso = this.add.rectangle(
        barraX - anchoBarra/2,
        barraY, 
        0,
        altoBarra - 4,
        0x27ae60
    );
    this.barraProgreso.setOrigin(0, 0.5);
    
    // ✅ TEXTO RESPONSIVE
    const tamanoFuenteBase = esMovil ? 12 : 14;
    this.textoProgreso = this.add.text(barraX, barraY, '0%', {
        font: `${tamanoFuenteBase}px Arial`,
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);
    
    // Barra superior de información
    this.add.rectangle(this.centerX, 30, this.cameras.main.width, esMovil ? 40 : 50, 0x2c3e50).setAlpha(0.9);
    
    const tamanoTitulo = esMovil ? 18 : 22;
    this.textoTitulo = this.add.text(this.centerX, 30, this.obtenerTituloEtapa(), {
        font: `${tamanoTitulo}px Arial`,
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // ✅ BOTONES MÁS GRANDES EN MÓVIL
    this.crearBotonesControl(esMovil);
    
    // Resto del código UI...
}

crearBotonesControl(esMovil = false) {
    const tamanoFuente = esMovil ? 16 : 14;
    const paddingY = esMovil ? 6 : 4;
    
    const reinicio = this.add.text(30, this.cameras.main.height - (esMovil ? 40 : 50), '🔄 Reiniciar', {
        font: `${tamanoFuente}px Arial`,
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: '#e74c3c',
        padding: { x: 10, y: paddingY }
    }).setInteractive({ useHandCursor: true });
    
    reinicio.on('pointerdown', () => {
        this.scene.start('EscenaInicio');
    });
    
    const salir = this.add.text(this.cameras.main.width - 30, this.cameras.main.height - (esMovil ? 40 : 50), '🚪 Salir', {
        font: `${tamanoFuente}px Arial`,
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: '#95a5a6',
        padding: { x: 10, y: paddingY }
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    
    salir.on('pointerdown', () => {
        this.scene.start('EscenaInicio');
    });
}
    
    obtenerTiempoEtapa(etapa) {
    // ✅ CAMBIO 3: Aumentar tiempos de cada etapa
    const tiempos = { 
        1: 15,  // Aumentado de 10 a 15
        2: 25,  // Aumentado de 8 a 12  
        3: 15,  // Aumentado de 20 a 25
        4: 25,  // Aumentado de 15 a 20
        5: 15,  // Aumentado de 12 a 18
        6: 15   // Aumentado de 10 a 15
    };
    return tiempos[etapa] || 20;
}
    
    obtenerTituloEtapa() {
        const titulos = {
            1: '💦 ETAPA 1: MOJAR MANOS',
            2: '🧴 ETAPA 2: APLICAR JABÓN',
            3: '👐 ETAPA 3: FROTAR PALMAS (20s)',
            4: '✋ ETAPA 4: FROTAR DORSO Y DEDOS',
            5: '🔄 ETAPA 5: ENJUAGAR MANOS',
            6: '📄 ETAPA 6: SECAR CON TOALLA'
        };
        return titulos[this.etapaActual];
    }
    
    obtenerInstruccionEtapa() {
        const instrucciones = {
            1: 'Haz clic repetidamente en las manos para mojarlas',
            2: 'Arrastra el jabón hacia las manos',
            3: 'Realiza movimientos circulares sobre las manos',
            4: 'Haz clic en las flechas para frotar todas las zonas',
            5: 'Mueve el cursor sobre las manos para enjuagar',
            6: 'Arrastra la toalla sobre las manos para secar'
        };
        return instrucciones[this.etapaActual];
    }
    
    configurarEtapaActual() {
        this.input.off('pointerdown');
        this.input.off('drag');
        this.input.off('pointermove');
        
        if (this.jabon) this.jabon.destroy();
        if (this.manos) this.manos.destroy();
        if (this.toalla) this.toalla.destroy();
        if (this.puntoCentro) this.puntoCentro.destroy();
        if (this.flechas) {
            this.flechas.forEach(flecha => flecha.destroy());
            this.flechas = null;
        }
        
        this.particulasActivas.forEach(particula => particula.destroy());
        this.particulasActivas = [];
        
        // ✅ CORRECCIÓN: MANOS 70 PIXELES MÁS ABAJO
        const manosY = this.centerY + 70; // Cambiado de this.centerY a this.centerY + 70
        
        switch(this.etapaActual) {
            case 1: this.configurarEtapa1(manosY); break;
            case 2: this.configurarEtapa2(manosY); break;
            case 3: this.configurarEtapa3(manosY); break;
            case 4: this.configurarEtapa4(manosY); break;
            case 5: this.configurarEtapa5(manosY); break;
            case 6: this.configurarEtapa6(manosY); break;
        }
    }
    
    configurarEtapa1(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-sucias')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-sucias');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else if (this.textures.exists('manos-normales')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-normales');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0x8B4513);
    }
    
    this.manos.setInteractive();
    this.objetosEtapa.push(this.manos);
    
    this.manos.on('pointerdown', () => {
        this.progreso = Math.min(this.progreso + 4, 100);
        this.puntajeTotal += 1;
        this.actualizarProgreso();
        
        if (!this.aguaActivada) {
            this.aguaActivada = true;
            this.activarEfectoAgua();
        }
        
        if (this.progreso > 50 && this.textures.exists('manos-mojadas')) {
            this.manos.setTexture('manos-mojadas');
        }
        
        this.mostrarParticulasDensas(this.centerX, manosY - 50, 0x3498db, 3);
        
        if (this.progreso >= 100) {
            this.completarEtapa();
        }
    });
}
    
 configurarEtapa2(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-mojadas')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-mojadas');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0x3498db);
    }
    this.objetosEtapa.push(this.manos);
    
    // ✅ POSICIÓN DEL JABÓN RESPONSIVE
    const jabonX = esMovil ? this.centerX + 200 : this.centerX + 320;
    const jabonY = esMovil ? manosY - 100 : manosY - 150;
    
    if (this.textures.exists('jabon')) {
        this.jabon = this.add.image(jabonX, jabonY, 'jabon');
        this.jabon.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.jabon = this.add.circle(jabonX, jabonY, esMovil ? 20 : 25, 0xFFFFFF);
    }
    this.jabon.setInteractive({ draggable: true });
    this.objetosEtapa.push(this.jabon);
    
    // ✅ FEEDBACK RESPONSIVE
    const feedbackY = esMovil ? this.centerY + 80 : this.centerY + 120;
    this.crearFeedbackProgresoJabon(feedbackY);
    
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        
        const distancia = Phaser.Math.Distance.Between(
            this.jabon.x, this.jabon.y, this.manos.x, this.manos.y
        );
        
        if (distancia < (esMovil ? 60 : 80)) {
            this.progreso = Math.min(this.progreso + 0.2, 100);
            this.puntajeTotal += 0.2;
            this.actualizarProgreso();
            
            if (this.progreso > 20 && this.progreso < 40 && this.textures.exists('manos-jabon')) {
                this.manos.setTexture('manos-jabon');
                this.manos.setAlpha(0.3);
            } else if (this.progreso >= 40 && this.progreso < 60 && this.textures.exists('manos-jabon')) {
                this.manos.setTexture('manos-jabon');
                this.manos.setAlpha(0.6);
            } else if (this.progreso >= 60 && this.progreso < 80 && this.textures.exists('manos-jabon')) {
                this.manos.setTexture('manos-jabon');
                this.manos.setAlpha(0.8);
            } else if (this.progreso >= 80 && this.textures.exists('manos-jabon')) {
                this.manos.setTexture('manos-jabon');
                this.manos.setAlpha(1);
            }
            
            if (Math.random() < 0.3) {
                this.mostrarParticulasDensas(this.manos.x, this.manos.y, 0xFFFFFF, 1);
            }
            
            if (this.progreso >= 100) {
                this.completarEtapa();
            }
        }
    });
}

// ✅ NUEVO: Método para feedback visual del progreso del jabón
crearFeedbackProgresoJabon(feedbackY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    const feedbackX = this.centerX;
    
    this.textoFeedbackJabon = this.add.text(feedbackX, feedbackY, 'Aplica jabón en todas las zonas', {
        font: esMovil ? '12px Arial' : '14px Arial',
        fill: '#2c3e50',
        stroke: '#ffffff',
        strokeThickness: 2,
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    const barraJabonX = this.centerX;
    const barraJabonY = feedbackY + 20;
    
    this.barraJabonFondo = this.add.rectangle(barraJabonX, barraJabonY, esMovil ? 150 : 200, 8, 0x000000, 0.5);
    this.barraJabon = this.add.rectangle(barraJabonX - (esMovil ? 75 : 100), barraJabonY, 0, 6, 0x8e44ad);
    this.barraJabon.setOrigin(0, 0.5);
}

// ✅ NUEVO: Actualizar feedback del jabón
// ✅ ACTUALIZADO: Mensajes más específicos para etapa más larga
actualizarFeedbackJabon() {
    const anchoBarra = (200 * this.progreso) / 100;
    this.barraJabon.width = anchoBarra;
    
    // Cambiar mensajes según progreso
    if (this.progreso < 15) {
        this.textoFeedbackJabon.setText('¡Empieza a aplicar el jabón! 🧴');
    } else if (this.progreso < 30) {
        this.textoFeedbackJabon.setText('¡Sigue frotando el jabón! 💪');
    } else if (this.progreso < 50) {
        this.textoFeedbackJabon.setText('¡La espuma empieza a formarse! ✨');
    } else if (this.progreso < 70) {
        this.textoFeedbackJabon.setText('¡Ya tienes buena espuma! 🌟');
    } else if (this.progreso < 85) {
        this.textoFeedbackJabon.setText('¡Casi tienes suficiente jabón! 🎯');
    } else {
        this.textoFeedbackJabon.setText('¡Espuma perfecta! Ahora continúa 🎉');
    }
}
    
    configurarEtapa3(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-jabon')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-jabon');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0xFFFFFF);
    }
    this.objetosEtapa.push(this.manos);
    
    this.manos.setInteractive();
    
    this.progreso = 0;
    this.vueltasCompletas = 0;
    this.anguloAnterior = 0;
    
    this.manos.on('pointermove', (pointer) => {
        if (pointer.isDown) {
            const dx = pointer.x - this.manos.x;
            const dy = pointer.y - this.manos.y;
            const anguloActual = Math.atan2(dy, dx);
            
            let diferenciaAngular = anguloActual - this.anguloAnterior;
            if (diferenciaAngular > Math.PI) diferenciaAngular -= 2 * Math.PI;
            if (diferenciaAngular < -Math.PI) diferenciaAngular += 2 * Math.PI;
            
            this.vueltasCompletas += Math.abs(diferenciaAngular);
            this.anguloAnterior = anguloActual;
            
            if (this.vueltasCompletas >= Math.PI * 2) {
                this.progreso = Math.min(this.progreso + 10, 100);
                this.puntajeTotal += 3;
                this.vueltasCompletas = 0;
                this.actualizarProgreso();
                
                this.mostrarParticulasDensas(pointer.x, pointer.y, 0xFFFFFF, esMovil ? 3 : 5);
                this.mostrarFeedback('¡Frotado correcto! +3 puntos', true);
            }
            
            if (this.progreso >= 100) {
                this.completarEtapa();
            }
        }
    });
    
    this.manos.on('pointerdown', () => {
        this.progreso = Math.min(this.progreso + 2, 100);
        this.puntajeTotal += 1;
        this.actualizarProgreso();
        this.mostrarParticulasDensas(this.centerX, manosY, 0xFFFFFF, esMovil ? 1 : 2);
        
        if (this.progreso >= 100) {
            this.completarEtapa();
        }
    });
}
    
    configurarEtapa4(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-jabon')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-jabon');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0xFFFFFF);
    }
    this.objetosEtapa.push(this.manos);
    
    this.progreso = 0;
    this.zonasFrotadas = new Set();
    this.listaProgreso = [];
    
    this.flechas = [];
    
    // ✅ POSICIONES DE FLECHAS RESPONSIVE
    const distanciaFlechas = esMovil ? 50 : 80;
    const distanciaVertical = esMovil ? 50 : 70;
    
    const zonas = [
        { 
            x: this.centerX - distanciaFlechas, 
            y: manosY, 
            texto: '👆', 
            zona: 'dorso',
            importancia: 'Elimina bacterias en el dorso de las manos'
        },
        { 
            x: this.centerX + distanciaFlechas, 
            y: manosY, 
            texto: '👇', 
            zona: 'palmas',
            importancia: 'Limpia las palmas donde se acumulan gérmenes'
        },
        { 
            x: this.centerX, 
            y: manosY - distanciaVertical, 
            texto: '🤚', 
            zona: 'punta_dedos',
            importancia: 'Desinfecta las yemas de los dedos'
        },
        { 
            x: this.centerX, 
            y: manosY + distanciaVertical, 
            texto: '✋', 
            zona: 'munecas',
            importancia: 'Limpia muñecas, área frecuentemente olvidada'
        }
    ];
    
    this.crearListaProgreso();
    
    zonas.forEach((zona) => {
        const tamanoFuenteFlecha = esMovil ? 32 : 28;
        const paddingFlecha = esMovil ? 10 : 8;
        
        const flecha = this.add.text(zona.x, zona.y, zona.texto, {
            font: `${tamanoFuenteFlecha}px Arial`,
            backgroundColor: '#e74c3c',
            padding: { x: paddingFlecha, y: paddingFlecha/2 }
        }).setInteractive();
        
        flecha.zonaId = zona.zona;
        flecha.datosZona = zona;
        this.objetosEtapa.push(flecha);
        this.flechas.push(flecha);
        
        flecha.on('pointerdown', () => {
            if (!this.zonasFrotadas.has(zona.zona)) {
                this.zonasFrotadas.add(zona.zona);
                flecha.setBackgroundColor('#27ae60');
                this.progreso = Math.min(((this.zonasFrotadas.size / zonas.length) * 100), 100);
                this.puntajeTotal += 10;
                this.actualizarProgreso();
                
                this.mostrarParticulasDensas(zona.x, zona.y, 0xFFFFFF, esMovil ? 3 : 5);
                this.agregarAListaProgreso(zona);
                
                if (this.zonasFrotadas.size === zonas.length) {
                    this.flechas.forEach(f => f.disableInteractive());
                    this.mostrarMensajeFinal();
                }
            }
        });
    });
}

// ✅ ACTUALIZA crearListaProgreso PARA MÓVIL
crearListaProgreso() {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    const panelX = esMovil ? this.cameras.main.width - 120 : this.cameras.main.width - 200;
    const panelY = esMovil ? 180 : 220;
    const anchoPanel = esMovil ? 220 : 350;
    
    this.panelProgreso = this.add.rectangle(panelX, panelY, anchoPanel, 300, 0x2c3e50, 0.9);
    this.panelProgreso.setStrokeStyle(2, 0xffffff);
    
    this.textoTituloPanel = this.add.text(panelX, panelY - 120, 'Progreso de Frotado', {
        font: esMovil ? '14px Arial' : '18px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    this.listaTextos = [];
}

// ✅ ACTUALIZA agregarAListaProgreso PARA MÓVIL
agregarAListaProgreso(zona) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    const panelX = esMovil ? this.cameras.main.width - 120 : this.cameras.main.width - 200;
    const startY = esMovil ? 120 : 180;
    const spacing = esMovil ? 30 : 35;
    
    const textoItem = this.add.text(panelX, startY + (this.listaProgreso.length * spacing), 
        `✓ ${zona.zona.replace('_', ' ')}`, {
        font: esMovil ? '12px Arial' : '14px Arial',
        fill: '#27ae60',
        stroke: '#000000',
        strokeThickness: 1,
        backgroundColor: '#000000',
        padding: { x: 5, y: 2 }
    }).setOrigin(0.5);
    
    const textoImportancia = this.add.text(panelX, startY + (this.listaProgreso.length * spacing) + 15, 
        zona.importancia, {
        font: esMovil ? '9px Arial' : '10px Arial',
        fill: '#ecf0f1',
        wordWrap: { width: esMovil ? 200 : 300 },
        align: 'center'
    }).setOrigin(0.5);
    
    this.listaTextos.push(textoItem, textoImportancia);
    this.listaProgreso.push({zona: zona.zona, importancia: zona.importancia});
}

// ✅ CORRECCIÓN 3: Método corregido para evitar el bug
mostrarMensajeFinal() {
    // ✅ DETENER EL TEMPORIZADOR INMEDIATAMENTE para evitar tiempo agotado
    if (this.temporizador) {
        this.temporizador.remove();
        this.temporizador = null;
    }
    
    // ✅ MARCAR LA ETAPA COMO COMPLETADA INMEDIATAMENTE
    this.progreso = 100;
    this.actualizarProgreso();
    
    // Desactivar todas las flechas para evitar clicks adicionales
    if (this.flechas) {
        this.flechas.forEach(flecha => {
            flecha.disableInteractive();
        });
    }
    
    // Esperar 2 segundos antes de mostrar el mensaje final
    this.time.delayedCall(2000, () => {
        const mensajeFinal = this.add.text(this.centerX, this.centerY - 150, 
            '¡Recuerda realizar todos los pasos del frotado de manos\npara ayudarnos a salvar vidas!', {
            font: '20px Arial',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            align: 'center'
        }).setOrigin(0.5);
        
        // Esperar 3 segundos más antes de continuar
        this.time.delayedCall(3000, () => {
            if (mensajeFinal) mensajeFinal.destroy();
            this.completarEtapa();
        });
    });
}
    
    configurarEtapa5(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-jabon')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-jabon');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0xFFFFFF);
    }
    this.objetosEtapa.push(this.manos);
    
    this.aguaActivada = true;
    this.activarEfectoAgua();
    
    this.manos.setInteractive();
    let puntosCubiertos = new Set();
    
    this.manos.on('pointermove', (pointer) => {
        if (pointer.isDown) {
            const x = Math.floor(pointer.x / (esMovil ? 20 : 15)) * (esMovil ? 20 : 15);
            const y = Math.floor(pointer.y / (esMovil ? 20 : 15)) * (esMovil ? 20 : 15);
            const puntoId = `${x},${y}`;
            
            if (!puntosCubiertos.has(puntoId)) {
                puntosCubiertos.add(puntoId);
                this.progreso = Math.min((puntosCubiertos.size / 60) * 100, 100);
                this.puntajeTotal += 1;
                this.actualizarProgreso();
                
                this.mostrarParticulasDensas(pointer.x, pointer.y, 0x3498db, esMovil ? 1 : 2);
                
                if (this.progreso > 70 && this.textures.exists('manos-limpias')) {
                    this.manos.setTexture('manos-limpias');
                }
                
                if (puntosCubiertos.size >= 60) {
                    this.completarEtapa();
                }
            }
        }
    });
}
    
    configurarEtapa6(manosY) {
    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    this.mostrarPersonajeEtapa();
    if (this.textures.exists('manos-limpias')) {
        this.manos = this.add.image(this.centerX, manosY, 'manos-limpias');
        this.manos.setScale(esMovil ? 1.0 : 1.2);
    } else {
        this.manos = this.add.circle(this.centerX, manosY, esMovil ? 35 : 40, 0x00b894);
    }
    this.objetosEtapa.push(this.manos);
    
    // ✅ POSICIÓN DE LA TOALLA RESPONSIVE
    const toallaX = esMovil ? this.centerX + 250 : this.centerX + 350;
    const toallaY = esMovil ? manosY - 100 : manosY - 150;
    
    if (this.textures.exists('toalla')) {
        this.toalla = this.add.image(toallaX, toallaY, 'toalla');
        this.toalla.setScale(esMovil ? 1.1 : 1.3);
    } else {
        this.toalla = this.add.rectangle(toallaX, toallaY, esMovil ? 70 : 80, esMovil ? 35 : 40, 0xf1c40f);
    }
    this.toalla.setInteractive({ draggable: true });
    this.objetosEtapa.push(this.toalla);
    
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        
        const distancia = Phaser.Math.Distance.Between(
            this.toalla.x, this.toalla.y, this.manos.x, this.manos.y
        );
        
        if (distancia < (esMovil ? 60 : 80)) {
            this.progreso = Math.min(this.progreso + 1, 100);
            this.puntajeTotal += 1;
            this.actualizarProgreso();
            
            if (this.progreso >= 100) {
                this.completarEtapa();
            }
        }
    });
}
    
    activarEfectoAgua() {
        if (this.textures.exists('lavadero-agua') && this.fondo) {
            this.fondo.setTexture('lavadero-agua');
        }
        
        this.efectoAgua = this.time.addEvent({
            delay: 200,
            callback: () => {
                if (this.aguaActivada) {
                    this.mostrarParticulasDensas(this.centerX, this.centerY - 50, 0x3498db, 3);
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    desactivarEfectoAgua() {
        this.aguaActivada = false;
        if (this.efectoAgua) {
            this.efectoAgua.remove();
        }
        if (this.textures.exists('lavadero') && this.fondo) {
            this.fondo.setTexture('lavadero');
        }
    }
    
    mostrarParticulasDensas(x, y, color, cantidad) {
        for (let i = 0; i < cantidad; i++) {
            const particula = this.add.circle(
                x + Phaser.Math.Between(-15, 15),
                y + Phaser.Math.Between(-15, 15),
                Phaser.Math.Between(2, 6),
                color
            );
            
            this.tweens.add({
                targets: particula,
                y: y - Phaser.Math.Between(20, 60),
                x: x + Phaser.Math.Between(-20, 20),
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(600, 1200),
                onComplete: () => {
                    particula.destroy();
                    this.particulasActivas = this.particulasActivas.filter(p => p !== particula);
                }
            });
            
            this.particulasActivas.push(particula);
        }
    }
    
    actualizarProgreso() {
    this.progreso = Math.min(this.progreso, 100);
    const anchoBarra = (400 * this.progreso) / 100;
    
    this.barraProgreso.width = anchoBarra;
    this.textoProgreso.setText(`${Math.floor(this.progreso)}%`);
    this.textoPuntaje.setText(`⭐ ${Math.floor(this.puntajeTotal)}`);
    
    // ✅ NUEVO: Actualizar feedback del jabón si estamos en etapa 2
    if (this.etapaActual === 2 && this.textoFeedbackJabon) {
        this.actualizarFeedbackJabon();
    }
}
    
    mostrarFeedback(mensaje, esPositivo) {
        if (this.textoFeedback) {
            this.textoFeedback.destroy();
        }
        
        this.textoFeedback = this.add.text(this.centerX, this.centerY - 100, mensaje, {
            font: '16px Arial',
            fill: esPositivo ? '#27ae60' : '#e74c3c',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.textoFeedback) {
                this.textoFeedback.destroy();
                this.textoFeedback = null;
            }
        });
    }
    
    crearBotonesControl() {
        const reinicio = this.add.text(30, this.cameras.main.height - 50, '🔄 Reiniciar', {
            font: '14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#e74c3c',
            padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true });
        
        reinicio.on('pointerdown', () => {
            this.scene.start('EscenaInicio');
        });
        
        const salir = this.add.text(this.cameras.main.width - 30, this.cameras.main.height - 50, '🚪 Salir', {
            font: '14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#95a5a6',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        
        salir.on('pointerdown', () => {
            this.scene.start('EscenaInicio');
        });
    }
    
    iniciarTemporizador() {
        this.temporizador = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.tiempoRestante--;
                this.textoTiempo.setText(`⏱️ ${this.tiempoRestante}s`);
                
                if (this.tiempoRestante <= 0) {
                    this.finalizarEtapa(false);
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    completarEtapa() {
        // ✅ CORRECCIÓN: Detener temporizador y desactivar agua primero
        if (this.temporizador) {
            this.temporizador.remove();
        }
        this.desactivarEfectoAgua();
        this.puntajeTotal += this.tiempoRestante * 2;
        
        if (this.etapaActual >= 6) {
            // ✅ CORRECCIÓN: Limpiar antes de ir a escena final
            this.limpiarEscenaCompletamente();
            this.scene.start('EscenaFinal', { puntaje: this.puntajeTotal });
        } else {
            this.finalizarEtapa(true);
        }
    }
    
    finalizarEtapa(exitoso) {
        // ✅ CORRECCIÓN: Detener temporizador si existe
        if (this.temporizador) {
            this.temporizador.remove();
        }
        this.desactivarEfectoAgua();
        
        // ✅ CORRECCIÓN: Limpiar completamente antes de mostrar mensaje
        this.limpiarEscenaCompletamente();
        
        const mensaje = exitoso ? 
            `¡ETAPA ${this.etapaActual} COMPLETADA! 🎉` : 
            '⏰ Tiempo agotado';
        
        const textoResultado = this.add.text(this.centerX, this.centerY - 50, mensaje, {
            font: '26px Arial',
            fill: exitoso ? '#27ae60' : '#e74c3c',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        if (exitoso) {
            this.add.text(this.centerX, this.centerY, `Puntaje: ${Math.floor(this.puntajeTotal)}`, {
                font: '18px Arial',
                fill: '#2c3e50',
                backgroundColor: '#ffffff',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
        }
        
        // ✅ CORRECCIÓN: Usar una variable local para etapaActual
        const etapaActual = this.etapaActual;
        const puntajeTotal = this.puntajeTotal;
        
        this.time.delayedCall(3000, () => {
            textoResultado.destroy();
            if (exitoso && etapaActual < 6) {
                this.scene.start('EscenaJuego', { 
                    etapa: etapaActual + 1, 
                    puntajeTotal: puntajeTotal 
                });
            } else {
                this.scene.start('EscenaInicio');
            }
        });
    }
    
    limpiarEscenaCompletamente() {

    
    // ✅ NUEVO: Limpiar feedback del jabón
    if (this.textoFeedbackJabon) {
        this.textoFeedbackJabon.destroy();
        this.textoFeedbackJabon = null;
    }
    if (this.barraJabonFondo) {
        this.barraJabonFondo.destroy();
        this.barraJabonFondo = null;
    }
    if (this.barraJabon) {
        this.barraJabon.destroy();
        this.barraJabon = null;
    }
    
   
        // Limpiar todos los objetos registrados

    this.objetosEtapa.forEach(objeto => {
        if (objeto && typeof objeto.destroy === 'function') {
            objeto.destroy();
        }
    });
    this.objetosEtapa = [];
    
    // Limpiar partículas
    this.particulasActivas.forEach(particula => {
        if (particula && typeof particula.destroy === 'function') {
            particula.destroy();
        }
    });
    this.particulasActivas = [];
    
    // Limpiar objetos específicos
    if (this.manos) {
        this.manos.destroy();
        this.manos = null;
    }
    if (this.jabon) {
        this.jabon.destroy();
        this.jabon = null;
    }
    if (this.toalla) {
        this.toalla.destroy();
        this.toalla = null;
    }
    if (this.flechas) {
        this.flechas.forEach(flecha => flecha.destroy());
        this.flechas = null;
    }
    if (this.puntoCentro) {
        this.puntoCentro.destroy();
        this.puntoCentro = null;
    }
    if (this.efectoAgua) {
        this.efectoAgua.remove();
        this.efectoAgua = null;
    }
    
    // ✅ NUEVO: Limpiar personaje
    if (this.personaje) {
        this.personaje.destroy();
        this.personaje = null;
    }
    
    // Limpiar eventos de input
    this.input.off('pointerdown');
    this.input.off('drag');
    this.input.off('pointermove');
    
    // Limpiar texto de feedback
    if (this.textoFeedback) {
        this.textoFeedback.destroy();
        this.textoFeedback = null;
    }

        // Limpiar todos los objetos registrados
        this.objetosEtapa.forEach(objeto => {
            if (objeto && typeof objeto.destroy === 'function') {
                objeto.destroy();
            }
        });
        this.objetosEtapa = [];
        
        // Limpiar partículas
        this.particulasActivas.forEach(particula => {
            if (particula && typeof particula.destroy === 'function') {
                particula.destroy();
            }
        });
        this.particulasActivas = [];
        
        // Limpiar objetos específicos
        if (this.manos) {
            this.manos.destroy();
            this.manos = null;
        }
        if (this.jabon) {
            this.jabon.destroy();
            this.jabon = null;
        }
        if (this.toalla) {
            this.toalla.destroy();
            this.toalla = null;
        }
        if (this.flechas) {
            this.flechas.forEach(flecha => flecha.destroy());
            this.flechas = null;
        }
        if (this.puntoCentro) {
            this.puntoCentro.destroy();
            this.puntoCentro = null;
        }
        if (this.efectoAgua) {
            this.efectoAgua.remove();
            this.efectoAgua = null;
        }
        
        // Limpiar eventos de input
        this.input.off('pointerdown');
        this.input.off('drag');
        this.input.off('pointermove');
        
        // Limpiar texto de feedback
        if (this.textoFeedback) {
            this.textoFeedback.destroy();
            this.textoFeedback = null;
        }
    }
}

class EscenaFinal extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaFinal' });
    }
    
    // ✅ CORRECCIÓN: Agregar preload para cargar la imagen
    preload() {
        this.load.image('fondoInicio', 'assets/fondos/fondo-inicio.png');
    }
    
    init(data) {
        this.puntajeFinal = data.puntaje || 0;
    }
    
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // ✅ CORRECCIÓN: Usar fondo-inicio.png en lugar de color sólido
        if (this.textures.exists('fondoInicio')) {
            const fondo = this.add.image(centerX, centerY, 'fondoInicio');
            fondo.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
            
            // Overlay para mejor legibilidad del texto
            const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.4);
            overlay.setDepth(0);
        } else {
            this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x27ae60);
        }
        
        this.add.text(centerX, centerY - 100, '🎉 ¡ENTRENAMIENTO COMPLETADO! 🎉', {
            font: '32px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY - 30, 'Has dominado las 6 etapas del lavado de manos', {
            font: '18px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY + 30, `PUNTUACIÓN FINAL: ${Math.floor(this.puntajeFinal)}`, {
            font: '28px Arial',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        const repetir = this.add.rectangle(centerX, centerY + 180, 280, 60, 0xe74c3c);
        repetir.setStrokeStyle(3, 0xffffff);
        repetir.setInteractive({ useHandCursor: true });
        
        const textoRepetir = this.add.text(centerX, centerY + 180, '🔄 Repetir Entrenamiento', {
            font: '18px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        repetir.on('pointerdown', () => this.scene.start('EscenaInicio'));
        textoRepetir.on('pointerdown', () => this.scene.start('EscenaInicio'));
    }
}

window.addEventListener('load', () => {
    new JuegoLavadoManos();
});
