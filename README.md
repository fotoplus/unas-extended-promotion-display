# unas-extended-promotion-display

JSON-paraméter alapú, dinamikus promóciómegjelenítés UNAS webáruházhoz.

A megoldás célja, hogy egy termékhez tartozó **HTML típusú UNAS paraméterben** JSON formátumban lehessen megadni a termékhez kapcsolódó promóciókat. A frontend JavaScript ezt az adatot feldolgozza, és az éppen érvényes promóciókat automatikusan megjeleníti a termék áránál.

## Funkciók

- több promóció kezelése egy termékhez;
- promóciónként megadható:
  - név;
  - kedvezmény / pénzvisszatérítés összege;
  - kezdő dátum;
  - záró dátum;
  - opcionális promóciós URL;
- a promóció csak a megadott időszakban jelenik meg;
- a promóció neve / sora opcionálisan kattintható, és új lapon nyílik meg;
- globálisan megadható, hogy az egyidejűleg aktív promóciók összevonhatók-e;
- összevonható promóciók esetén a rendszer:
  - összeadja az aktív kedvezményeket;
  - az összeget levonja az aktuális termékárból;
  - ha van akciós ár, abból számol;
  - egyébként a normál árból számol;
  - megjeleníti a kedvezmények utáni számított árat;
- ha a promóciók nem vonhatók össze, a promóciók megjelennek, de közös végösszeg nem készül.

## Könyvtárstruktúra

```text
/
├── index.html
├── generator.html
├── README.md
└── unas-content/
    ├── custom-style.css
    ├── example-parameter.html
    └── script.js
```

### `generator.html`

Egyszerű böngészős segédprogram a promóciós JSON blokk előállításához.

A kitöltött adatokból olyan HTML blokk készül, amely közvetlenül bemásolható az UNAS megfelelő HTML típusú termékparaméterébe.

### `unas-content/example-parameter.html`

Példa az UNAS HTML paraméter tartalmára:

```html
<script type="application/json" class="product-promotions-data">
{
    "combinable": false,
    "promotions": [
        {
            "promotion_name": "Sony téli pénzvisszatérítés",
            "promotion_discount": 37000,
            "promotion_start_date": "2026-10-01",
            "promotion_end_date": "2026-12-31",
            "promotion_url": "https://example.com/promotion"
        }
    ]
}
</script>
```

A `combinable` globális kapcsoló:

- `true`: az egyidejűleg aktív promóciók összevonhatók, ezért a kedvezmények összeadódnak és levonásra kerülnek az aktuális termékárból;
- `false`: az aktív promóciók megjelennek, de nem készül összevont, számított végösszeg.

### `unas-content/script.js`

Az UNAS termékoldalán:

1. megkeresi a promóciós HTML paramétert;
2. beolvassa a JSON adatot;
3. ellenőrzi a promóciók érvényességi dátumát;
4. csak az aktuálisan érvényes promóciókat jeleníti meg;
5. szükség esetén kiszámolja az összevont kedvezményt és a kedvezmények utáni árat;
6. a létrehozott promóciós blokkot az UNAS árblokkhoz illeszti.

### `unas-content/custom-style.css`

A generált promóciós elemek megjelenését tartalmazza, az UNAS termékoldal megjelenéséhez igazítva.

## Fontos: UNAS paraméterazonosító

A repository-ban szereplő paraméterazonosító jelenleg a fejlesztői / teszt rendszerhez tartozik:

```text
8988616
```

Az éles rendszerbe történő beépítéskor ezt **az éles UNAS HTML paraméter azonosítójára kell módosítani**.

Az azonosító jelenleg két helyen szerepel.

### JavaScript

`unas-content/script.js`:

```js
const PARAM_SELECTOR = '#page_artdet_product_param_spec_8988616';
```

### CSS

`unas-content/custom-style.css`:

```css
#page_artdet_product_param_spec_8988616 {
    display: none !important;
}
```

A JavaScriptben és a CSS-ben **ugyanazt az éles paraméterazonosítót kell használni**.



## Használat
1. Nyisd meg a `generator.html` oldalt.
2. Add meg a promóció vagy promóciók adatait.
3. Másold ki a generált HTML/JSON blokkot.
4. Illeszd be a termék promóciós paraméterébe.


## Kezdő lépések
1. Hozz létre az UNAS-ban egy HTML típusú termékparamétert a promóciós adatok számára.
2. Állítsd be a megfelelő paraméterazonosítót a `script.js` és `custom-style.css` fájlban.

## Telepítés (UNAS)
1. Lépj be az UNAS admin felületére.
2. Menj a **Beállítások / Kinézet, arculat** / Script beszúrása menübe
3. Hozz létre egy új scriptet, `body, end` típussal úgy, hogy csak a **termék részletek** oldalakon legyen beszúrva és másold be a `script.js` tartalmát.
4. Menj az Beállítások / Kinézet, arculat / Kinézet testreszabása / Saját CSS menübe és másold be a `custom-style.css` tartalmát.

