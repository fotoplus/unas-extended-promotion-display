document.addEventListener('DOMContentLoaded', function () {

    const PARAM_SELECTOR = '#page_artdet_product_param_spec_8988826';
    const CART_WRAP_SELECTOR = '#artdet__cart-wrap';

    const paramElement = document.querySelector(PARAM_SELECTOR);
    const cartWrap = document.querySelector(CART_WRAP_SELECTOR);

    if (!paramElement) {
        return;
    }


    /* ---------------------------------------------------------
     * JSON beolvasása
     * --------------------------------------------------------- */

    const dataElement = paramElement.querySelector(
        '.product-promotions-data[type="application/json"]'
    );

    if (!dataElement) {
        return;
    }

    let promotionData;

    try {
        promotionData = JSON.parse(dataElement.textContent.trim());
    } catch (error) {
        console.error('Hibás promóciós JSON:', error);
        return;
    }

    if (
        !promotionData ||
        typeof promotionData !== 'object' ||
        !Array.isArray(promotionData.promotions)
    ) {
        return;
    }

    const combinable = promotionData.combinable === true;
    const promotions = promotionData.promotions;

    if (promotions.length === 0) {
        return;
    }


    /* ---------------------------------------------------------
     * Segédfüggvények
     * --------------------------------------------------------- */

    function parseDate(value) {

        if (
            typeof value !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
            return null;
        }

        const [year, month, day] = value.split('-').map(Number);

        const date = new Date(
            year,
            month - 1,
            day,
            0,
            0,
            0,
            0
        );

        /*
         * Hibás dátumok kiszűrése
         * pl. 2026-02-31
         */
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }


    function parsePrice(value) {

        if (typeof value !== 'string') {
            return null;
        }

        const number = Number(
            value
                .replace(/\s/g, '')
                .replace(/[^\d]/g, '')
        );

        return Number.isFinite(number) ? number : null;
    }


    function formatPrice(value) {

        return new Intl.NumberFormat('hu-HU', {
            maximumFractionDigits: 0
        }).format(value) + ' Ft';
    }


    function isValidUrl(value) {

        if (!value) {
            return false;
        }

        try {
            const url = new URL(value);

            return (
                url.protocol === 'http:' ||
                url.protocol === 'https:'
            );

        } catch {
            return false;
        }
    }


    /* ---------------------------------------------------------
     * Aktív promóciók meghatározása
     * --------------------------------------------------------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePromotions = promotions.filter(function (promotion) {

        if (
            !promotion ||
            typeof promotion.promotion_name !== 'string' ||
            promotion.promotion_name.trim() === ''
        ) {
            return false;
        }

        const discount = Number(promotion.promotion_discount);

        if (!Number.isFinite(discount) || discount <= 0) {
            return false;
        }

        const startDate = parseDate(
            promotion.promotion_start_date
        );

        const endDate = parseDate(
            promotion.promotion_end_date
        );

        if (!startDate || !endDate) {
            return false;
        }

        if (endDate < startDate) {
            return false;
        }

        /*
         * A kezdő- és zárónap is érvényes.
         */
        return today >= startDate && today <= endDate;
    });


    /*
     * Ha nincs aktív promóció,
     * nem jelenítünk meg semmit.
     */
    if (activePromotions.length === 0) {
        return;
    }


    /* ---------------------------------------------------------
     * Aktuális termékár meghatározása
     * --------------------------------------------------------- */

    const salePriceElement = document.querySelector(
        '#price_akcio_brutto_U__unas__0001'
    );

    const basePriceElement = document.querySelector(
        '#price_net_brutto_U__unas__0001'
    );

    let currentPrice = null;


    /*
     * Ha van akciós ár, azt használjuk.
     */
    if (salePriceElement) {
        currentPrice = parsePrice(
            salePriceElement.textContent
        );
    }


    /*
     * Ha nincs használható akciós ár,
     * akkor a normál árat.
     */
    if (currentPrice === null && basePriceElement) {
        currentPrice = parsePrice(
            basePriceElement.textContent
        );
    }


    /*
     * Ha nem tudtuk meghatározni az árat,
     * a promóciókat ettől még megjelenítjük,
     * csak számított végső ár nem készül.
     */


    /* ---------------------------------------------------------
     * Promóciók teljes kedvezménye
     * --------------------------------------------------------- */

    const totalDiscount = activePromotions.reduce(
        function (sum, promotion) {
            return sum + Number(promotion.promotion_discount);
        },
        0
    );


    /* ---------------------------------------------------------
     * Promóciós blokk létrehozása
     * --------------------------------------------------------- */

    const promotionBox = document.createElement('div');

    promotionBox.className = 'artdet__cashback-promotions';


    /* ---------------------------------------------------------
     * Egyes promóciók megjelenítése
     * --------------------------------------------------------- */

    activePromotions.forEach(function (promotion) {

        const row = document.createElement('div');

        row.className = 'artdet__cashback-promotion';


        /*
         * Ha van érvényes URL, akkor link.
         * Egyébként sima span.
         */
        let content;

        if (isValidUrl(promotion.promotion_url)) {

            content = document.createElement('a');

            content.href = promotion.promotion_url;
            content.target = '_blank';
            content.rel = 'noopener noreferrer';

            content.className =
                'artdet__cashback-promotion-link';

        } else {

            content = document.createElement('span');

            content.className =
                'artdet__cashback-promotion-content';
        }


        /*
         * Promóció neve
         */
        const name = document.createElement('span');

        name.className =
            'artdet__cashback-promotion-name';

        name.textContent =
            promotion.promotion_name + ':';


        /*
         * Kedvezmény összege
         */
        const discount = document.createElement('span');

        discount.className =
            'artdet__cashback-promotion-discount';

        discount.textContent =
            formatPrice(
                Number(promotion.promotion_discount)
            );


        content.append(name, discount);

        row.append(content);

        promotionBox.append(row);
    });


    /* ---------------------------------------------------------
     * Számított végső ár
     *
     * Csak akkor jelenik meg, ha:
     *
     * - a promóciók globálisan összevonhatók
     * - és sikerült meghatározni az aktuális árat
     * --------------------------------------------------------- */

    if (
        combinable &&
        currentPrice !== null
    ) {

        const finalPrice = Math.max(
            0,
            currentPrice - totalDiscount
        );


        const finalRow = document.createElement('div');

        finalRow.className =
            'artdet__cashback-final-price';


        const title = document.createElement('span');

        title.className =
            'artdet__cashback-final-price-title';

        title.textContent =
            activePromotions.length > 1
                ? 'Árad a pénzvisszatérítések után:'
                : 'Árad a pénzvisszatérítés után:';


        const value = document.createElement('span');

        value.className =
            'artdet__cashback-final-price-value';

        value.textContent =
            formatPrice(finalPrice);


        finalRow.append(title, value);

        promotionBox.append(finalRow);
    }


    /* ---------------------------------------------------------
     * Beszúrás
     *
     * A promóciós blokk közvetlenül az
     * artdet__cart-wrap elé kerül.
     * --------------------------------------------------------- */




    if (cartWrap) {

        cartWrap.before(promotionBox);

    } else {

        const priceContainers = document.querySelectorAll(
            '.artdet__price-datas'
        );

        if (priceContainers.length > 0) {

            priceContainers[
                priceContainers.length - 1
            ].after(promotionBox);

        } else {

            console.warn(
                'Promóció: nem található megfelelő beszúrási pont.'
            );
        }
    }

});