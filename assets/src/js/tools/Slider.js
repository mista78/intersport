import {selector, build, buildJson, useEvent} from './helpers.js'

class Slider {
    constructor(element) {
        this.element = element;

        this.config = {
            "visible": 5,
            "scrollable": 1,
            "infini": "true",
            "navigation": "true",
            "indicator": "true",
            "mobileonly": "true",
            "mobilevisible": 2,
            "mobilescrollable": 1,
            "disable": "false",
            "overflow": 0,
            "columgap": "0",
            "mobilebreakpoint": "768",
            "time": 0.5
        };
        this.selector = selector;
        this.build = build;
        this.buildJson = buildJson;
        this.useEvent = useEvent;

        this.onDrag = this.onDrag.bind(this);
        this.onGrab = this.onGrab.bind(this);
        this.onLetGo = this.onLetGo.bind(this);
        this.enableTransition = this.enableTransition.bind(this);
        this.disableTransition = this.disableTransition.bind(this);
        this.setStyle = this.setStyle.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.init();
    }

    init() {
        const children = [...this.element.children];
        this.element.innerHTML = "";
        this.config.visible = children.length > this.config.visible ? this.config.visible : children.length;
        const opts = {};
        const filter = ["id", "class", "tabindex"];
        Array.from(this.element.attributes).map(item => {
            if (!filter.includes(item.localName)) {
                opts[item.localName] = item.nodeValue;
            }
        });
        this.setOptions(opts);
        this.items = children;
        this.currentItem = 0;
        this.moveCallback = [];
        this.isMobile = false;

        this.element.appendChild(this.build({
            attributes: [
                ["class", "carousel"],
                ["style", `${this.config.overflow ? "overflow-x: clip;" : ""}`]
            ],
            children: [
                {
                    attributes: [
                        ["class", "carousel__container"],
                        ["style", `
						transition: ${this.config.time}s; 
						display: flex; 
						${this.config.columgap ? "column-gap: " + this.config.columgap + "px;" : ""}
						`],
                    ],
                    children: [
                        ...children.map(item => ({
                            attributes: [
                                ["class", "carousel__item"],
                            ],
                            children: [
                                this.buildJson(item),
                            ],
                        }))
                    ]
                }
            ]
        }));

        this.setStyle();
        // if (Math.round(this.items.length / this.slideVisible()) > 1) {
        this.config.navigation && this.createNavigation();
        this.config.indicator && this.createPagination();
        // }
        this.moveCallback.forEach(item => item(0)?.bind(this));
        this.onWindowResize();
        window.addEventListener("resize", () => {
            this.onWindowResize();
        });

        this.execSwipe(this.slideVisible() !== this.items.length);

    };
    onWindowResize() {
        const mobile = window.innerWidth < (this.config.mobilebreakpoint || 768);
        if (mobile !== this.isMobile) {
            this.isMobile = mobile;
            this.setStyle();
            // execSwipe(slideVisible() !== self.items.length);
            this.moveCallback.forEach(item => item(self.currentItem));
        }
        this.execSwipe(this.slideVisible() !== this.items.length);
    };

    execSwipe(cond) {
        const [carousel__container] = this.selector(".carousel__container", this.element);
        this.useEvent(carousel__container, "dragstart", e => e.preventDefault());
        this.useEvent(carousel__container, "mousedown", this.onGrab);
        this.useEvent(carousel__container, "touchstart", this.onGrab);
    };

    onLetGo(e) {
        const [carousel] = this.selector(".carousel", this.element);
        if (this.origin && this.lastTranslate) {
            this.enableTransition();
            if (
                Math.abs(this.lastTranslate.x / carousel.offsetWidth) >
                0.2
            ) {
                if (this.lastTranslate.x < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
            this.goToSlide(this.currentItem);
        }
        this.origin = null;
    };
    onDrag(e) {
        if (this.origin) {
            const point = e.touches ? e.touches[0] : e;
            const translat = {
                x: point.screenX - this.origin.x,
                y: point.screenY - this.origin.y
            };
            if (
                e.touches &&
                Math.abs(translat.x) > Math.abs(translat.y)
            ) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            const baseTranslate =
                (this.currentItem * -100) / this.items.length;
            this.lastTranslate = translat;

            this.translate(baseTranslate + (100 * translat.x) / this.width);
        }
    };
    disableTransition() {
        const [carousel__container] = this.selector(".carousel__container", this.element);
        carousel__container.style.transition = "none";
    };
    enableTransition() {
        const [carousel__container] = this.selector(".carousel__container", this.element);
        carousel__container.style.transition = this.config.time + "s";
    };
    onGrab(e) {
        const [carousel__container] = this.selector(".carousel__container", this.element);
        if (e.touches) {
            if (e.touches.length > 1) {
                return;
            } else {
                e = e.touches[0];
            }
        }
        const { screenX, screenY } = e;
        this.lastTranslate = null;
        this.origin = { x: screenX, y: screenY };
        this.width = carousel__container.offsetWidth;
        this.disableTransition();
        this.useEvent(window, "dragstart", e => e && e.preventDefault());
        this.useEvent(window, "mousemove", this.onDrag);
        this.useEvent(window, "touchmove", this.onDrag);
        this.useEvent(window, "touchend", this.onLetGo);
        this.useEvent(window, "mouseup", this.onLetGo);
        this.useEvent(window, "touchcancel", this.onLetGo);
    };
    setOptions(options) {
        if (typeof options === "object" && Object.keys(options).length > 0) {
            for (var property in options) {
                if (typeof this.config[property] !== "undefined") {
                    if (options[property] === "true") {
                        options[property] = true;
                    } else if (options[property] === "false") {
                        options[property] = false;
                    } else if (Number(options[property]) != NaN) {
                        options[property] = Number(options[property]);
                    }
                    this.config[property] = options[property];
                }
            }
        }
    };
    setStyle() {
        const ratio = this.items.length / this.slideVisible();
        const [container] = this.selector(".carousel__container", this.element);
        const [carousel] = this.selector(".carousel", this.element);
        carousel.setAttribute("style", ` ${this.isMobile ? "overflow:hidden;" : this.config.overflow ? "overflow-x: clip;" : ""} `);
        const item = this.selector('.carousel__item', container);
        const itemWidth = 100 / this.slideVisible() / ratio;
        item.map(item => item.style.width = `${itemWidth}%`);
        container.style.width = `${ratio * 100}%`;
        this.config.indicator && (Math.round(this.items.length / this.slideVisible()) > 1) && this.createPagination();
    };

    createPagination() {
        const [carousel__pagination] = this.selector(".carousel__pagination", this.element);
        carousel__pagination && carousel__pagination.remove();
        const pagination = this.build({
            attributes: [
                ["class", "carousel__pagination"],
            ],
            children: [
                {
                    attributes: [
                        ["class", "carousel__pagination-item"],
                        ["data-index", (0) * this.slideScroll()],
                    ],
                },
                ...Array(this.items.length).fill(0).map((item, index) => ({
                    attributes: [
                        ["class", "carousel__pagination-item"],
                        ["data-index", (index + 1) * this.slideScroll()],
                    ],
                    target: index * this.slideScroll()
                })).filter(item => this.items[item.target + this.slideVisible()])
            ]
        });
        this.element.appendChild(pagination);
        this.pagination = this.element.querySelector(".carousel__pagination");
        this.pagination.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("carousel__pagination-item")) {
                this.goToSlide(target.dataset.index * 1);
            }
        });
        this.onMove(index => {
            index = index ? index : 0;
            this.pagination.querySelector(".carousel__pagination-item--active") && this.pagination.querySelector(".carousel__pagination-item--active").classList.remove("carousel__pagination-item--active");
            this.pagination.querySelector(`[data-index="${index}"]`).classList.add("carousel__pagination-item--active");
        });
    };

    createNavigation() {
        [{
            attributes: [
                ["class", "carousel__next"],
            ],
            event: {
                "type": "click",
                "callback": () => {
                    this.enableTransition();
                    this.next();
                }
            }
        }, {
            attributes: [
                ["class", "carousel__prev"],
            ],
            event: {
                "type": "click",
                "callback": () => {
                    this.enableTransition();
                    this.prev();
                }
            }
        }].map(item => this.element.appendChild(this.build(item)));
        this.onMove(index => {
            if (this.config.infini === true) return;
            const [next, prev] = this.selector(".carousel__next,.carousel__prev", this.element);
            if (index === 0) {
                prev.classList.add("carousel__prev--disabled");
            } else {
                prev.classList.remove("carousel__prev--disabled");
            }
            if (this.items[this.currentItem + this.slideVisible()] === undefined) {
                next.classList.add("carousel__next--disabled");
            } else {
                next.classList.remove("carousel__next--disabled");
            }
        })
    };
    translate(percent) {
        const [carousel__container] = this.selector(".carousel__container", this.element);
        // percent = percent.toFixed(0);
        carousel__container.style.transform =
            "translate3d(" + percent + "%, 0, 0)";
    };

    onMove(callback) {
        this.moveCallback.push(callback);
    };

    goToSlide(index) {
        if (index < 0) {
            if (this.config.infini) {
                index = this.items.length - this.slideVisible();
            } else {
                return;
            }
        } else if (index > this.items.length || (this.items[this.currentItem + this.slideVisible()] === undefined && index > this.currentItem)) {
            if (this.config.infini) {
                index = 0;
            } else {
                return;
            }
        }
        const [container] = this.selector(".carousel__container", this.elements);
        let translateX = (index * -100) / this.items.length;
        this.translate(translateX);
        // container.style.transform = `translateX(${index * -100 / self.items.length}%)`;
        this.currentItem = index;
        this.moveCallback.map(callback => callback(index));
    };

    next() {
        this.goToSlide(this.currentItem + this.slideScroll());
    };

    prev() {
        this.goToSlide(this.currentItem - this.slideScroll());
    };


    slideVisible() {
        return this.isMobile
            ? this.config.mobilevisible || 1
            : this.config.visible;
    };

    slideScroll() {
        return this.isMobile
            ? this.config.mobilescrollable || 1
            : this.config.scrollable;
    };

};

export default Slider;
