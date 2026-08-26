document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("expanded");
        sidebar.classList.toggle("collapsed");

        /*
         * Ao recolher a Sidebar,
         * fecha todos os menus e submenus abertos.
         */
        if (!sidebar.classList.contains("expanded")) {

            const openMenus = sidebar.querySelectorAll(".open");

            openMenus.forEach(menu => {

                menu.classList.remove("open");

            });

        }

    });

});