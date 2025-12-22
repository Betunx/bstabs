# Formato de Tablaturas - Black Sheep

## 📊 Decisión: JSON (no TOML)

**Razones:**
- Nativo en JavaScript/TypeScript
- Parse instantáneo
- Compatible con APIs REST
- TypeScript typing perfecto
- Sin dependencias externas

## 🎸 Estructura de Datos

### ChordPosition - Alineación Perfecta

```typescript
{
  chord: string;    // Nombre del acorde (ej: "E", "Dm7")
  position: number; // Posición en caracteres desde el inicio
}
```

**Ejemplo:**
```
Letra:  "Pero esa luna es mi condena"
         01234567890123456789012345678

Acordes en JSON:
{
  "chords": [
    { "chord": "E", "position": 0 },    // Alineado con "P"
    { "chord": "D", "position": 14 },   // Alineado con "l"
    { "chord": "Dm7", "position": 18 }  // Alineado con "e"
  ],
  "lyrics": "Pero esa luna es mi condena"
}
```

**Se renderiza:**
```
E             D   Dm7
Pero esa luna es mi condena
```

## 📏 Espaciado Consistente

### margin-block: 1lh

Usa `margin-block: 1lh` en vez de valores fijos:
- `1lh` = 1 line-height
- Siempre consistente sin importar font-size
- Nunca se desajusta

```scss
.chord-line-wrapper {
  margin-block: 1lh; // Perfecto espaciado entre líneas
}

.section-name {
  margin-block: 1lh 1lh; // Top y bottom
}
```

## 🎨 Diseño Visual

### Fondo Blanco - Texto Negro

```scss
.tab-viewer-container {
  background-color: white;  // Siempre blanco
  color: black;             // Siempre negro
}

.chord-symbol {
  color: #D4AF37; // Dorado para acordes
}
```

### Centrado

```scss
.tab-viewer-container {
  max-width: 900px;
  margin-inline: auto; // Centrado horizontal
}
```

## 📝 Cómo Crear una Tablatura

### Paso 1: Escribe la letra completa

```
Pero esa luna es mi condena
Y no puedo escapar
```

### Paso 2: Cuenta posiciones de caracteres

```
Pero esa luna es mi condena
0123456789012345678901234567
```

### Paso 3: Coloca acordes

```
E en posición 0 (inicio)
D en posición 14 (antes de "luna")
Dm7 en posición 18 (antes de "es")
```

### Paso 4: JSON Final

```json
{
  "chords": [
    { "chord": "E", "position": 0 },
    { "chord": "D", "position": 14 },
    { "chord": "Dm7", "position": 18 }
  ],
  "lyrics": "Pero esa luna es mi condena"
}
```

## ✅ Ejemplo Completo

Ver: `EJEMPLO_EMMA.json`

## 🔧 Herramientas Futuras

### Editor Visual (TODO)

Crear interfaz web para:
1. Pegar letra
2. Click donde va cada acorde
3. Auto-genera JSON

```
[ Texto: Pero esa luna es mi condena          ]
[E]    [Acorde aquí]  [Acorde aquí]

→ Genera automáticamente el JSON
```
