<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Affichage Capteur en Temps Réel</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
        #data-container {
            border: 2px solid #007BFF;
            padding: 20px;
            margin: 20px auto;
            max-width: 600px;
            border-radius: 8px;
            font-size: 1.5em;
            background-color: #f8f9fa;
        }
        #last-update { font-size: 0.8em; color: #6c757d; }
    </style>
</head>
<body>

    <h1>Données du capteur</h1>
    <div id="data-container">
        Chargement des données...
    </div>
    <p id="last-update">Dernière mise à jour : Jamais</p>

<script>
    // La fonction qui va chercher les données
    async function fetchData() {
        try {
            // Fait un appel au script PHP
            const response = await fetch('../Controller/DataController.php');
            
            // Vérifie si la requête a réussi
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Transforme la réponse en objet JavaScript (JSON)
            const result = await response.json();

            // Met à jour le contenu de la page avec les nouvelles données
            const dataContainer = document.getElementById('data-container');
            const lastUpdate = document.getElementById('last-update');

            if (result.success) {
                dataContainer.innerHTML = result.data;
                dataContainer.style.color = 'black';
            } else {
                dataContainer.innerHTML = `Erreur : ${result.data}`;
                dataContainer.style.color = 'red';
            }
            
            lastUpdate.innerHTML = `Dernière mise à jour : ${result.timestamp}`;

        } catch (error) {
            // Affiche une erreur si l'appel échoue
            document.getElementById('data-container').innerHTML = `Impossible de charger les données : ${error.message}`;
            document.getElementById('data-container').style.color = 'red';
        }
    }

    // Appel initial pour avoir les données dès le chargement de la page
    fetchData();

    // C'est ICI la boucle ! On demande à JavaScript d'appeler fetchData toutes les 10 secondes (10000 ms)
    setInterval(fetchData, 5000);

</script>

</body>
</html>