


// --- Cliquer sur le solde pour masquer/afficher ---
const declencheurVision = document.getElementById('declencheur_vision');
const mp = document.getElementById('mp'); 
const ms = document.getElementById('ms'); 
let soldeVisible = true;

// On stocke les valeurs réelles une seule fois au chargement
const valeurP = mp.textContent;
const valeurS = ms.textContent;

if (declencheurVision) {
    declencheurVision.addEventListener('click', () => {
        soldeVisible = !soldeVisible;
        
        if (!soldeVisible) {
            mp.textContent = "****";
            ms.textContent = "****";
        } else {
            mp.textContent = valeurP;
            ms.textContent = valeurS;
        }
    });
}




















































// Taux de change statiques (par rapport à 1 USD, utilisé comme devise pivot)
const TAUX_DE_CHANGE = {
    usd: 1.0,         // Dollar Américain (base)
    eur: 0.92,        // Euro (1 USD = 0.92 EUR)
    btc: 0.000015,    // Bitcoin (1 USD = 0.000015 BTC) - Environ 66k USD/BTC
    shiba: 40000.0,   // Shiba Inu (1 USD = 40000 SHIB)
    xox: 550.0         // XOX Coin (1 USD = 15 XOX)
};

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
    const deroul_btns = document.querySelectorAll('.deroul_btn'); 

    // --- Page de Profil ---
    const navProfilBtn = document.getElementById('nav_profil_btn');
    const pageProfil = document.getElementById('page_profil');
    const fermProfilBtn = document.getElementById('ferm_profil');
    
    // --- Fonctionnalités principales et Navigation ---
    const ferm_bande_btn = document.getElementById('ferm_bande');
    const bande_info = document.querySelector('.bande_info');
    const onglets = document.querySelectorAll('.onglets_princ .onglet');
    const contenu_onglets = document.querySelectorAll('.contenu_onglet'); 
    
    // NAVIGATION SPA
    const navBasItems = document.querySelectorAll('.nav_bas .nav_item');
    const actionButtons = document.querySelectorAll('.actions .action_item button[data-cible]');
    const toutesLesVues = document.querySelectorAll('.page_vue');

    // --- Convertisseur SWAP ---
    const deviseDepartSelect = document.getElementById('devise_depart');
    const montantDepartInput = document.getElementById('montant_depart');
    const deviseArriveeSelect = document.getElementById('devise_arrivee');
    const montantArriveeInput = document.getElementById('montant_arrivee');
    const btnConvertir = document.getElementById('btn_convertir');
    const btnInverser = document.getElementById('inverser_devises');

    // --- CONSTANTES POUR LE SOLDE ET LA DEVISE (Noms Courts) ---
    const sdp = document.getElementById('sdp'); 
    const sds = document.getElementById('sds'); 
    const mp = document.getElementById('mp');   
    const ms = document.getElementById('ms');   
    const cp = document.getElementById('cp');   


    // ----------------------------------------------------
    // 2. FONCTIONS GLOBALES (Menu, Profil, Navigation)
    // ----------------------------------------------------
    
    /**
     * Gère l'affichage des différentes vues (pages) de l'application (SPA).
     * @param {string} idCible L'ID du conteneur de vue à afficher (ex: 'vue_principale').
     */
    const naviguerVers = (idCible) => {
        // 1. Masquer toutes les vues (sauf la page de profil qui est gérée par toggleProfil)
        toutesLesVues.forEach(vue => {
            if (vue.id !== 'page_profil') { 
                vue.classList.remove('actif');
                vue.style.display = 'none';
            }
        });

        // 2. Afficher la vue ciblée
        const vueCible = document.getElementById(idCible);
        if (vueCible) {
            vueCible.classList.add('actif'); 
            vueCible.style.display = 'block';
        }

        // 3. Gérer l'état du bouton 'actif' dans la nav_bas
        navBasItems.forEach(item => item.classList.remove('actif'));
        
        // Trouver le bouton nav_item correspondant (via l'attribut data-cible)
        const boutonActif = document.querySelector(`.nav_bas .nav_item[data-cible="${idCible}"]`);
        if (boutonActif) {
            boutonActif.classList.add('actif');
        }
        
        // S'assurer que le profil est fermé
        toggleProfil(false);
        // Fermer le menu latéral 
        toggleMenu(false);
        
        // Si on navigue vers la vue SWAP, déclencher la conversion
        if (idCible === 'vue_swap') {
            convertirDevise();
        }
    };

    /**
     * Ouvre ou ferme le menu latéral.
     * @param {boolean} open Vrai pour ouvrir, Faux pour fermer.
     */
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

    /**
     * Ouvre ou ferme la page de profil.
     * @param {boolean} open Vrai pour ouvrir, Faux pour fermer.
     */
    const toggleProfil = (open) => {
        if (!pageProfil) return;

        if (open) {
            pageProfil.classList.add('active');
            body.classList.add('profil_actif'); 
            toggleMenu(false);
            
            // Masquer toutes les vues SPA pour ne laisser que le profil visible
            toutesLesVues.forEach(vue => {
                if(vue.id !== 'page_profil') vue.style.display = 'none';
            });
            
            // Activer le bouton profil dans la nav_bas (visuellement)
            navBasItems.forEach(i => i.classList.remove('actif'));
            if (navProfilBtn) navProfilBtn.classList.add('actif');

        } else {
            pageProfil.classList.remove('active');
            body.classList.remove('profil_actif');
            
            // Réafficher la dernière vue active 
            const derniereVueActive = document.querySelector('.page_vue.actif, #vue_principale.actif');
            if (derniereVueActive) {
                derniereVueActive.style.display = 'block';
            } else {
                 // Si aucune n'est active, revenir à Home par défaut
                naviguerVers('vue_principale');
            }
        }
    }
    
    /**
     * Effectue la conversion en utilisant le tableau de taux statique.
     */
    const convertirDevise = () => {
        if (!montantDepartInput || !deviseDepartSelect || !deviseArriveeSelect) return;
        
        const deviseDepart = deviseDepartSelect.value;
        const deviseArrivee = deviseArriveeSelect.value;
        const montantDepart = parseFloat(montantDepartInput.value);

        // 1. Validation de l'entrée
        if (isNaN(montantDepart) || montantDepart <= 0) {
            montantArriveeInput.value = 'Montant Invalide';
            return;
        }
        
        // 2. Conversion vers la devise de base (USD)
        const tauxDepart = TAUX_DE_CHANGE[deviseDepart]; 
        const tauxArrivee = TAUX_DE_CHANGE[deviseArrivee];
        
        if (!tauxDepart || !tauxArrivee) {
            montantArriveeInput.value = 'Erreur de Taux';
            return;
        }

        // Convertir le montant de départ en USD
        const montantEnUSD = montantDepart / tauxDepart; 
        
        // Convertir le montant en USD en devise d'arrivée
        const resultat = montantEnUSD * tauxArrivee;

        // 3. Affichage du résultat formaté
        montantArriveeInput.value = resultat.toFixed(6).replace(/\.?0+$/, ""); 
    };

    /**
     * Inverse les devises sélectionnées
     */
    const inverserDevises = () => {
        if (!deviseDepartSelect || !deviseArriveeSelect) return;
        
        const tempDepart = deviseDepartSelect.value;
        const tempArrivee = deviseArriveeSelect.value;
        
        deviseDepartSelect.value = tempArrivee;
        deviseArriveeSelect.value = tempDepart;
        
        // Déclencher la conversion immédiatement après l'inversion
        convertirDevise();
    };


    // ----------------------------------------------------
    // 3. INITIALISATION ET ÉVÉNEMENTS
    // ----------------------------------------------------
    
    // --- A. GESTION DU THÈME (Sombre/Clair) ---
    
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

    // --- B. ÉVÉNEMENTS DU MENU LATÉRAL ---
    if (ouv_menu) ouv_menu.addEventListener('click', () => toggleMenu(true));
    if (ferm_menu) ferm_menu.addEventListener('click', () => toggleMenu(false));
    if (overlay) overlay.addEventListener('click', () => toggleMenu(false));

    // Gestion des menus déroulants
    deroul_btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const contenu = btn.nextElementSibling;
            
            // Fermer les autres menus ouverts
            deroul_btns.forEach(otherBtn => {
                if (otherBtn !== btn && otherBtn.classList.contains('actif')) {
                    otherBtn.classList.remove('actif');
                    otherBtn.nextElementSibling.style.maxHeight = 0;
                }
            });

            btn.classList.toggle('actif');
            
            if (btn.classList.contains('actif')) {
                contenu.style.maxHeight = contenu.scrollHeight + 'px';
            } else {
                contenu.style.maxHeight = 0;
            }
        });
    });

    // --- C. ÉVÉNEMENTS DE NAVIGATION (SPA) ---
    
    // Initialiser la première vue au chargement (Home)
    naviguerVers('vue_principale');
    
    // 1. ÉVÉNEMENTS DE LA BARRE DE NAVIGATION INFÉRIEURE (NAV_BAS)
    navBasItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const cible = e.currentTarget.getAttribute('data-cible');
            
            if (cible) {
                naviguerVers(cible);
                
            } else if (e.currentTarget.id === 'nav_profil_btn') {
                toggleProfil(true);
            }
        });
    });

    // 2. ÉVÉNEMENTS DES BOUTONS D'ACTION (Retrait, Dépôt, Swap, Sell, Earn)
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            const cible = e.currentTarget.getAttribute('data-cible');
            if (cible) {
                naviguerVers(cible);
            }
        });
    });

    // --- D. ÉVÉNEMENTS DE LA PAGE DE PROFIL ---
    if (navProfilBtn) {
        navProfilBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleProfil(true);
        });
    }

    if (fermProfilBtn) {
        fermProfilBtn.addEventListener('click', () => toggleProfil(false));
    }


    // --- E. ÉVÉNEMENTS DES ONGLETS SUPÉRIEURS ---
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

    // --- F. GESTION DES PETITES FONCTIONNALITÉS ---

    // Fermeture de la bannière d'information
    if (ferm_bande_btn && bande_info) {
        ferm_bande_btn.addEventListener('click', () => {
            bande_info.style.display = 'none';
        });
    }

    // --- G. ÉVÉNEMENTS DU CONVERTISSEUR SWAP ---
    if (btnConvertir) {
        btnConvertir.addEventListener('click', convertirDevise);
    }

    if (btnInverser) {
        btnInverser.addEventListener('click', inverserDevises);
    }

    // Conversion en direct ou au changement de sélection
    [montantDepartInput, deviseDepartSelect, deviseArriveeSelect].forEach(element => {
        if (element) {
            element.addEventListener('input', () => {
                // Ne convertir que si la vue swap est visible
                if (document.getElementById('vue_swap').classList.contains('actif')) {
                    convertirDevise();
                }
            });
            element.addEventListener('change', convertirDevise);
        }
    });

    // Initialiser la conversion au chargement si la vue swap est initialement active (bien que non recommandée ici)
    // if (montantDepartInput && deviseDepartSelect && deviseArriveeSelect && montantArriveeInput) {
    //     convertirDevise(); 
    // }



// --- Logique d'Affiliation ---
const codeDisplay = document.getElementById('code_promo_display');
const btnCopier = document.getElementById('btn_copier_code');

// Simulation d'un code unique (sera remplacé par le backend plus tard)
const genererCodePromo = () => {
    const user_id = document.getElementById('info_id')?.textContent || "USER";
    return (user_id + "-2024").toUpperCase();
};

if (codeDisplay) {
    codeDisplay.textContent = genererCodePromo();
}

if (btnCopier) {
    btnCopier.addEventListener('click', () => {
        const code = codeDisplay.textContent;
        navigator.clipboard.writeText(code).then(() => {
            btnCopier.textContent = "Copié !";
            btnCopier.style.backgroundColor = "#fff";
            setTimeout(() => {
                btnCopier.textContent = "Copier";
                btnCopier.style.backgroundColor = "var(--couleur-primaire)";
            }, 2000);
        });
    });
}














// --- Logique de masquage pour la page Équipe ---
const zoneEquipe = document.getElementById('masquer_equipe');
const valeurEquipe = document.getElementById('valeur_equipe');
let equipeVisible = true;

// On sauvegarde la valeur initiale
const montantEquipeReel = valeurEquipe ? valeurEquipe.textContent : "0.00";

if (zoneEquipe && valeurEquipe) {
    zoneEquipe.addEventListener('click', () => {
        equipeVisible = !equipeVisible;
        
        if (!equipeVisible) {
            valeurEquipe.textContent = "****";
        } else {
            valeurEquipe.textContent = montantEquipeReel;
        }
    });
}















// --- Logique Section Cadeau ---
const zoneCadeau = document.getElementById('zone_masquer_cadeau');
const valeurCadeau = document.getElementById('valeur_cadeau');
const btnClaim = document.getElementById('btn_claim_daily');
let cadeauVisible = true;

const montantCadeauReel = valeurCadeau ? valeurCadeau.textContent : "0.00";

if (zoneCadeau && valeurCadeau) {
    zoneCadeau.addEventListener('click', () => {
        cadeauVisible = !cadeauVisible;
        valeurCadeau.textContent = cadeauVisible ? montantCadeauReel : "****";
    });
}

if (btnClaim) {
    btnClaim.addEventListener('click', () => {
        btnClaim.textContent = "Reçu ! ✅";
        btnClaim.disabled = true;
        btnClaim.style.opacity = "0.7";
        alert("Félicitations ! Vous avez reçu 0.50$ de bonus.");
    });
}















// --- Logique de Retrait ---
const etapeChoix = document.getElementById('etape_paiement');
const etapeForm = document.getElementById('etape_formulaire');
const moyens = document.querySelectorAll('.moyen_item');
const nomMethode = document.getElementById('nom_methode_choisie');
const btnRetour = document.getElementById('btn_retour_retrait');

// Éléments de vérification
const inputMontant = document.getElementById('montant_retrait');
const condMin = document.getElementById('cond_minimum');
const condFilleuls = document.getElementById('cond_filleuls');
const btnFinal = document.getElementById('btn_confirmer_retrait');

// Simulation : On imagine que l'utilisateur a 1 seul filleul pour le test
let nombreFilleulsActuel = 1; 

// 1. Sélectionner un moyen
moyens.forEach(m => {
    m.addEventListener('click', () => {
        const methode = m.getAttribute('data-methode');
        nomMethode.textContent = methode;
        etapeChoix.style.display = 'none';
        etapeForm.style.display = 'block';
    });
});

// 2. Retour
btnRetour.addEventListener('click', () => {
    etapeForm.style.display = 'none';
    etapeChoix.style.display = 'block';
});

// 3. Vérification en temps réel
inputMontant.addEventListener('input', () => {
    const mnt = parseFloat(inputMontant.value);
    
    // Vérif Montant
    if (mnt >= 20) {
        condMin.textContent = "✅ Montant minimum de 20.00 $";
        condMin.className = "correct";
    } else {
        condMin.textContent = "❌ Montant minimum de 20.00 $";
        condMin.className = "incorrect";
    }

    // Vérif Filleuls
    if (nombreFilleulsActuel >= 2) {
        condFilleuls.textContent = "✅ Avoir parrainé au moins 2 personnes";
        condFilleuls.className = "correct";
    } else {
        condFilleuls.textContent = "❌ Avoir parrainé au moins 2 personnes (Actuel: " + nombreFilleulsActuel + ")";
        condFilleuls.className = "incorrect";
    }

    // Activer bouton si tout est OK
    if (mnt >= 20 && nombreFilleulsActuel >= 2) {
        btnFinal.style.cursor = "pointer";
        btnFinal.style.opacity = "1";
    } else {
        btnFinal.style.cursor = "not-allowed";
        btnFinal.style.opacity = "0.5";
    }
});















});
