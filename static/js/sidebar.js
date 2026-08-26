document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;


    /* ==========================================
       MENUS PRINCIPAIS
       Turmas / Documentos / etc.
    ========================================== */

    const menus = document.querySelectorAll(".menu-group[data-menu]");

    menus.forEach(menu => {

        const toggle = Array.from(menu.children).find(
            element => element.matches("[data-toggle]")
        );

        const submenu = Array.from(menu.children).find(
            element => element.matches("[data-submenu]")
        );

        if (!toggle || !submenu) return;


        toggle.addEventListener("click", (event) => {

            event.preventDefault();

            /* Sidebar recolhida não abre submenu */
            if (!sidebar.classList.contains("expanded")) {
                return;
            }


            /* ==================================
               ACORDEÃO PRINCIPAL
            ================================== */

            menus.forEach(otherMenu => {

                if (otherMenu !== menu) {

                    otherMenu.classList.remove("open");

                    /* Fecha também submenus internos */
                    otherMenu
                        .querySelectorAll(".submenu-group.open")
                        .forEach(group => {

                            group.classList.remove("open");

                        });

                }

            });


            /* Abre / fecha menu clicado */

            menu.classList.toggle("open");

        });

    });


    /* ==========================================
       SEGUNDO NÍVEL
       Declarações / Listas
    ========================================== */

    const submenuToggles =
        document.querySelectorAll("[data-submenu-toggle]");

    submenuToggles.forEach(toggle => {

        toggle.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();


            /* Sidebar recolhida não abre submenu */

            if (!sidebar.classList.contains("expanded")) {
                return;
            }


            const group = toggle.closest(".submenu-group");

            if (!group) return;


            const parent = group.parentElement;


            /* ==================================
               ACORDEÃO DO SEGUNDO NÍVEL
            ================================== */

            Array.from(parent.children)
                .filter(element =>
                    element.classList.contains("submenu-group")
                )
                .forEach(otherGroup => {

                    if (otherGroup !== group) {

                        otherGroup.classList.remove("open");

                    }

                });


            /* Abre / fecha Declarações ou Listas */

            group.classList.toggle("open");

        });

    });

});