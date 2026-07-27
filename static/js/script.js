document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");

    const button = document.getElementById("menu-toggle");

    button.addEventListener("click", () => {

        sidebar.classList.toggle("expanded");

    });

});