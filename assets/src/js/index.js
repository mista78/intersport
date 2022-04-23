import { calls, selector } from "./tools/helpers";
import Slider from './tools/slider';

calls("herobanner", block => {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;
    console.log(block);
    let countDown = new Date('25 april 2022 00:00:00').getTime(),
        x = setInterval(function () {

            let now = new Date(),
                distance = countDown - now;
            const [days,hours,minutes,seconds] = selector("#days, #hours, #minutes, #seconds");
            days.innerText = Math.floor(distance / (day));
            hours.innerText = Math.floor((distance % (day)) / (hour));
            minutes.innerText = Math.floor((distance % (hour)) / (minute));
            seconds.innerText = Math.floor((distance % (minute)) / second);

            if (distance < 1) {
                clearInterval(x);
            }

        }, second);
})

calls("Productgrid", block => {
    const carousel = selector(`#${block}__carousel`);
    carousel.map(item => {
        const carous = new Slider(item);
    });
});

calls("Producthero", block => {
    const carousel = selector(`#${block}__carousel`);
    carousel.map(item => {
        const carous = new Slider(item);
    });
});

calls("menu", block => {
    const [submenu] = selector(`#Submenu`);
    const children = selector(`#Submenu span`, submenu);
    const reducer = (prev, current) => prev + current;
    const size = children.map(item => Math.round(item.getBoundingClientRect().width + 26));
    const width = size.reduce(reducer);
    submenu.style.width = `${width}px`;
    children.map((item) => item.addEventListener('click', (e) => {
        const mobileOnly = window.matchMedia("(max-width: 767px)");
        if (mobileOnly.matches) {
            const itemleft = e.target.getBoundingClientRect().left;
            const submenuleft = submenu.getBoundingClientRect().left;
            const left = (itemleft - submenuleft) / 2;
            submenu.style.transform = `translateX(-${left}px)`;
        }
        children.map(item => item.classList.remove('active'));
        e.target.classList.add('active');
    }));
});