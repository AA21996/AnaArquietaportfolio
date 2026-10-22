# Portafolio — Ana Victoria Arquieta

Sitio estático (HTML + CSS + JS, sin compilación) bilingüe EN/ES con flipbook de Heyzine, visor de CV con PDF.js y sección de contacto.

```
index.html
css/styles.css        ← estilos y paleta (:root)
js/main.js            ← CONFIG (rutas, contacto, flipbook) + lógica
js/i18n.js            ← todos los textos EN / ES
assets/img/           ← foto, logo, favicon, imagen para redes
assets/cv/            ← PDFs del CV
```

## 1. Foto, logo y PDFs

| Archivo | Dónde va | Notas |
|---|---|---|
| Foto de Ana | `assets/img/ana-victoria.jpg` | Vertical (proporción 4:5, ideal 1200×1500 px, < 300 KB). Mientras no exista se muestra `photo-placeholder.svg`. El encuadre se ajusta con `object-position` en `.hero__photo img` (`css/styles.css`). |
| Logo | `assets/img/logo.svg` | Reemplaza el placeholder. Puede ser PNG: cambia la ruta en `CONFIG.images.logo` y en el `src` de `.nav__logo` en `index.html`. Si trae colores propios, ajústalos a la paleta (olive `#505a46`, earth `#6d5b3b`, dark `#25281d`). |
| Favicon | `assets/img/favicon.svg` | Genera uno a partir del logo (por ejemplo en realfavicongenerator.net) y reemplaza el archivo. |
| Imagen para redes (Open Graph) | `assets/img/og-image.jpg` | 1200×630 px, normalmente la foto o una imagen de proyecto. |
| CV en inglés | `assets/cv/CV_Ana_Victoria_Arquieta_EN.pdf` | Reemplaza el PDF de ejemplo. |
| CV en español | `assets/cv/CV_Ana_Victoria_Arquieta_ES.pdf` | Opcional. Si lo borras, el sitio en español muestra y descarga la versión en inglés. |

Si cambias nombres de archivo, actualiza el objeto `CONFIG` al inicio de `js/main.js`.

## 2. Datos de contacto y enlaces (`CONFIG` en `js/main.js`)

Todo está en un solo lugar: `images`, `cv.en` / `cv.es`, `email`, `whatsapp` (solo dígitos con código de país), `phone`, `linkedin`, `flipbookUrl`. El script aplica estos valores a todos los enlaces de la página (tarjetas, footer y botón flotante). El mensaje predeterminado de WhatsApp está en `i18n.js` (`contact.waMessage`) en cada idioma.

## 3. Actualizar el flipbook de Heyzine

- **Si actualizas el mismo flipbook en Heyzine** (misma URL), no tienes que hacer nada.
- **Si creas uno nuevo:** en Heyzine copia el código "Embed" y en `index.html` reemplaza el `<div style="…padding-bottom…"><iframe …></iframe></div>` que está dentro de `<div class="flipbook">`. Vuelve a añadir `loading="lazy"` al `<iframe>`. Después cambia `CONFIG.flipbookUrl` en `js/main.js` (también actualiza el enlace "Open portfolio in full screen").
- El ancho máximo del flipbook (720 px) se cambia en `.flipbook { max-width }` en `css/styles.css`.

## 4. Editar textos (`js/i18n.js`)

Cada texto tiene una clave, por ejemplo `hero.intro`, con su versión en `en` y en `es`. En el HTML se usa como `data-i18n="hero.intro"` (texto) o `data-i18n-attr="aria-label:clave"` (atributos como `aria-label`, `alt` o `title`).

- Para cambiar un texto: edita el valor en **ambos** idiomas.
- Para agregar uno nuevo: crea la clave en `en` y `es` y ponle `data-i18n="tu.clave"` al elemento.
- El título de la pestaña y la meta description están en `meta.title` y `meta.description`.
- Los nombres de empresas y proyectos no se traducen y están directamente en `index.html`.

El sitio abre en inglés y recuerda el idioma que elige cada visitante.

## 5. Colores (`:root` en `css/styles.css`)

```css
--color-dark:  #25281d;  --color-light: #dcdbd9;  --color-earth: #6d5b3b;
--color-olive: #505a46;  --color-stone: #989488;
```

Cambia el valor y se actualiza todo el sitio. Si cambias colores, revisa el contraste (mínimo 4.5:1 para texto) en webaim.org/resources/contrastchecker. `--color-stone` no tiene contraste suficiente sobre el fondo claro: úsalo solo en líneas y bordes.

## 6. Probar en local

```bash
cd ana-victoria-portfolio
python3 -m http.server 8080      # o: npx serve
```

Abre http://localhost:8080. El visor del CV necesita servidor: abrir `index.html` con doble clic no funciona.

## 7. Publicar

### Netlify
1. Entra a app.netlify.com, ve a **Add new site → Deploy manually** y arrastra la carpeta `ana-victoria-portfolio`.
2. (Opcional) En **Domain settings** conecta tu dominio.
3. Para actualizar, vuelve a arrastrar la carpeta, o conecta un repositorio de GitHub para publicar con cada cambio.

### GitHub Pages
1. Crea un repositorio y sube el contenido de esta carpeta (que `index.html` quede en la raíz).
2. Ve a **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. El sitio queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

### Después de publicar
En `index.html`, sustituye `https://YOUR-DOMAIN.com/` en `og:image` y `og:url` por la URL real. Las redes sociales no ejecutan JavaScript, así que estas URL deben ser absolutas y estar escritas en el HTML. Puedes revisar la vista previa con el depurador de LinkedIn Post Inspector o de Facebook Sharing Debugger.
