










document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. SÉLECTION DES ÉLÉMENTS DU DOM
    // ----------------------------------------------------
    const body = document.body;
    
    // --- Thème & Menu Latéral ---
    const bouton_theme = document.getElementById('bouton_theme'); 
    const ouv_menu = document.getElementById('ouv_menu'); 
    const ferm_menu = document.getElementById('ferm_menu'); 
    const menu_lat = document.getElementById('menu_lat'); 
    const overlay = document.getElementById('overlay'); 
    const deroul_btns = document.querySelectorAll('.deroul_btn'); // Déplacé ici pour la portée globale

    // --- Page de Profil ---
    const navProfilBtn = document.getElementById('nav_profil_btn');
    const pageProfil = document.getElementById('page_profil');
    const fermProfilBtn = document.getElementById('ferm_profil');
    
    // --- Fonctionnalités principales ---
    const ferm_bande_btn = document.getElementById('ferm_bande');
    const bande_info = document.querySelector('.bande_info');
    const onglets = document.querySelectorAll('.onglets_princ .onglet');
    const contenu_onglets = document.querySelectorAll('.contenu_onglet'); 
    const nav_bas_items = document.querySelectorAll('.nav_bas .nav_item');


    // ----------------------------------------------------
    // 2. GESTION DU THÈME (Sombre/Clair)
    // ----------------------------------------------------
    
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme !== 'light';
    
    if (isDarkMode) {
        body.classList.add('dark');
        if (bouton_theme) bouton_theme.textContent = '🌙'; 
    } else {
        body.classList.remove('dark');
        if (bouton_theme) bouton_theme.textContent = '⭐️'; 
    }

    if (bouton_theme) {
        bouton_theme.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            const theme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            bouton_theme.textContent = isDark ? '🌙' : '⭐️'; 
        });
    }

    // ----------------------------------------------------
    // 3. GESTION DU MENU LATÉRAL (Sidebar)
    // ----------------------------------------------------
    
    const toggleMenu = (open) => {
        if (!menu_lat || !overlay) return; 

        if (open) {
            menu_lat.classList.add('ouvert');
            overlay.style.display = 'block';
        } else {
            menu_lat.classList.remove('ouvert');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300); 
        }
    };

    if (ouv_menu) ouv_menu.addEventListener('click', () => toggleMenu(true));
    if (ferm_menu) ferm_menu.addEventListener('click', () => toggleMenu(false));
    if (overlay) overlay.addEventListener('click', () => toggleMenu(false));


    // ----------------------------------------------------
    // 4. GESTION DE LA PAGE DE PROFIL
    // ----------------------------------------------------

    const toggleProfil = (open) => {
        if (!pageProfil) return;

        if (open) {
            pageProfil.classList.add('active');
            body.classList.add('profil_actif'); 
            toggleMenu(false);
        } else {
            pageProfil.classList.remove('active');
            body.classList.remove('profil_actif');
        }
    }

    if (navProfilBtn) {
        navProfilBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleProfil(true);
            
            nav_bas_items.forEach(i => i.classList.remove('actif'));
            navProfilBtn.classList.add('actif');
        });
    }

    if (fermProfilBtn) {
        fermProfilBtn.addEventListener('click', () => toggleProfil(false));
    }


    // ----------------------------------------------------
    // 5. GESTION DES MENUS DÉROULANTS (Sidebar)
    // ----------------------------------------------------
    
    deroul_btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const contenu = btn.nextElementSibling;
            
            // Fermer tous les autres menus ouverts
            deroul_btns.forEach(otherBtn => {
                if (otherBtn !== btn && otherBtn.classList.contains('actif')) {
                    otherBtn.classList.remove('actif');
                    otherBtn.nextElementSibling.style.maxHeight = 0;
                }
            });

            // Bascule le menu cliqué
            btn.classList.toggle('actif');
            
            if (btn.classList.contains('actif')) {
                // Ouvre le menu
                contenu.style.maxHeight = contenu.scrollHeight + 'px';
            } else {
                // Ferme le menu
                contenu.style.maxHeight = 0;
            }
        });
    });


    // ----------------------------------------------------
    // 6. GESTION DES ONGLETS SUPÉRIEURS
    // ----------------------------------------------------

    onglets.forEach(onglet => {
        onglet.addEventListener('click', (e) => {
            const cible = e.currentTarget.getAttribute('data-cible'); 
            
            // Gérer l'état actif des boutons
            onglets.forEach(t => t.classList.remove('actif'));
            e.currentTarget.classList.add('actif');

            // Gérer l'affichage du contenu correspondant
            contenu_onglets.forEach(contenu => {
                contenu.classList.remove('actif');
            });
            
            const contenu_a_afficher = document.getElementById(`contenu_${cible}`);
            if (contenu_a_afficher) {
                contenu_a_afficher.classList.add('actif');
            }
        });
    });


    // ----------------------------------------------------
    // 7. GESTION DES PETITES FONCTIONNALITÉS
    // ----------------------------------------------------

    // Fermeture de la bannière d'information
    if (ferm_bande_btn && bande_info) {
        ferm_bande_btn.addEventListener('click', () => {
            bande_info.style.display = 'none';
        });
    }

    // Gestion de l'état actif de la navigation inférieure (Home, Trending, etc.)
    nav_bas_items.forEach(item => {
        item.addEventListener('click', (e) => {
            // Si c'est le bouton profil, la gestion est faite par toggleProfil, on sort
            if (e.currentTarget.id === 'nav_profil_btn') return; 

            const clickedItem = e.currentTarget;
            nav_bas_items.forEach(i => i.classList.remove('actif'));
            clickedItem.classList.add('actif');
            
            // S'assurer que la page de profil est fermée si l'on clique sur un autre onglet
            toggleProfil(false);
        });
    });
});
