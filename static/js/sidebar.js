const menus = document.querySelectorAll("[data-menu]");

menus.forEach(menu => {

    const toggle = menu.querySelector("[data-toggle]");
    const submenu = menu.querySelector("[data-submenu]");

    if(!toggle || !submenu) return;

    toggle.addEventListener("click", function(e){

        e.preventDefault();

        menu.classList.toggle("open");

    });

});