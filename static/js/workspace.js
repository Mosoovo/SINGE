document.addEventListener("DOMContentLoaded", () => {

    const workspace = document.querySelector(".workspace-content");

    if (!workspace) return;

/*
 * ==========================================
 * HOME
 * Guarda o conteúdo inicial da Workspace
 * ==========================================
 */

const homeContent = workspace.innerHTML;
    /*
     * ==========================================
     * FUNÇÃO: EXIBIR TELA PROVISÓRIA
     * ==========================================
     */

    function showWorkspacePage(title, path) {

        workspace.innerHTML = `
            <div class="workspace-navigation-test">

                <h1>${title}</h1>

                <p>${path}</p>

                <small>Módulo em desenvolvimento</small>

            </div>
        `;

    }
    /*
 * ==========================================
 * FUNÇÃO: MÓDULO ATIVO NA SIDEBAR
 * ==========================================
 */

function setActiveModule(menuGroup) {

    document
        .querySelectorAll(".sidebar .nav-item.active")
        .forEach(item => {

            item.classList.remove("active");

        });

    if (!menuGroup) return;

    const navItem = menuGroup.querySelector(":scope > .nav-item");

    if (navItem) {

        navItem.classList.add("active");

    }

}

    /*
     * ==========================================
     * NAVEGAÇÃO DE SEGUNDO NÍVEL
     *
     * Ex:
     * Turmas > Fundamental I > 3º Ano
     * Documentos > Declarações > Escolaridade
     * ==========================================
     */

    const sidebarLinks = document.querySelectorAll(
        ".sidebar .submenu-level-2 a"
    );


    sidebarLinks.forEach(link => {

        link.addEventListener("click", (event) => {

            event.preventDefault();


            /* ITEM FINAL */

            const item = link.textContent.trim();


            /* SUBMENU PAI */

            const submenuGroup = link.closest(".submenu-group");

            const submenuTitle = submenuGroup
                ?.querySelector(":scope > .submenu-item")
                ?.childNodes[0]
                ?.textContent
                ?.trim();


            /* MÓDULO PRINCIPAL */

            const menuGroup = link.closest(".menu-group");

            const moduleTitle = menuGroup
                ?.querySelector(":scope > .nav-item .nav-label")
                ?.textContent
                ?.trim();


            /* CAMINHO */

            const path = [
                moduleTitle,
                submenuTitle,
                item
            ]
            .filter(Boolean)
            .join(" > ");

            setActiveModule(menuGroup);

            showWorkspacePage(item, path);

        });

    });

    /*
     * ==========================================
     * MÓDULOS COM SUBMENU
     * SIDEBAR RECOLHIDA
     *
     * Turmas
     * Documentos
     * ==========================================
     */

    const mainMenuLinks = document.querySelectorAll(
        ".sidebar .menu-group > .nav-item[data-toggle]"
    );


    mainMenuLinks.forEach(link => {

        link.addEventListener("click", (event) => {

            const sidebar = document.querySelector(".sidebar");

            if (!sidebar) return;


            /*
             * Sidebar expandida:
             * sidebar.js continua responsável
             * por abrir/fechar o submenu.
             */

            if (sidebar.classList.contains("expanded")) {
                return;
            }


            /*
             * Sidebar recolhida:
             * abre diretamente o módulo
             * na Workspace.
             */

            event.preventDefault();


            const moduleTitle = link
                .querySelector(".nav-label")
                ?.textContent
                ?.trim();


            if (!moduleTitle) return;

            const menuGroup = link.closest(".menu-group");

            setActiveModule(menuGroup);

            showWorkspacePage(
                moduleTitle,
                moduleTitle
            );

        });

    });
    /*
     * ==========================================
     * MÓDULOS PRINCIPAIS SEM SUBMENU
     *
     * Dashboard
     * Arquivo Permanente
     * Calendário
     * Configurações
     * ==========================================
     */

    const mainLinks = document.querySelectorAll(
        ".sidebar .menu-group > .nav-item:not([data-toggle])"
    );


    mainLinks.forEach(link => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

            const moduleTitle = link
                .querySelector(".nav-label")
                ?.textContent
                ?.trim();


            if (!moduleTitle) return;

            const menuGroup = link.closest(".menu-group");

            setActiveModule(menuGroup);

            showWorkspacePage(
                moduleTitle,
                moduleTitle
            );

        });

    });
    /*
    * ==========================================
        * LOGO SINGE → HOME
     * FUNÇÃO: RECOLHER SIDEBAR
     * ==========================================
     */

    function collapseSidebar() {

        const sidebar = document.querySelector(".sidebar");

        if (!sidebar) return;


        /*
         * Recolhe a Sidebar
         */

        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");


        /*
         * Fecha menus e submenus abertos
         */

        sidebar
            .querySelectorAll(".open")
            .forEach(element => {

                element.classList.remove("open");

            });

    }


    /*
     * ==========================================
     * LOGO SINGE → HOME
     * ==========================================
     */

    const homeButton = document.getElementById("home-button");

    if (homeButton) {

        homeButton.addEventListener("click", (event) => {

            event.preventDefault();


            /*
             * Restaura a Home
             */

            workspace.innerHTML = homeContent;

            setActiveModule(null);

            /*
             * Recolhe a Sidebar
             */

            collapseSidebar();

        });

    }


    /*
     * ==========================================
     * FOCO NA WORKSPACE
     * ==========================================
     */

    const workspaceArea = document.querySelector(".workspace");

    if (workspaceArea) {

        workspaceArea.addEventListener("click", () => {

            collapseSidebar();

        });

    }

});